import { LitElement, html, PropertyValues, css, TemplateResult } from "lit";
import { state } from "lit/decorators.js";
import "./components/ewt-button";
import "./components/ewt-checkbox";
import "./components/ewt-console";
import "./components/ewt-dialog";
import "./components/ewt-formfield";
import "./components/ewt-icon-button";
import "./components/ewt-textfield";
import type { EwtTextfield } from "./components/ewt-textfield";
import "./components/ewt-select";
import "./components/ewt-list-item";
import "./components/ewt-littlefs-manager";
import "./pages/ewt-page-progress";
import "./pages/ewt-page-message";
import { chipIcon, closeIcon, firmwareIcon } from "./components/svg";
import { Logger, Manifest, FlashStateType, FlashState } from "./const.js";
import { ImprovSerial, Ssid } from "improv-wifi-serial-sdk/dist/serial";
import {
  ImprovSerialCurrentState,
  ImprovSerialErrorState,
  PortNotReady,
} from "improv-wifi-serial-sdk/dist/const";
import { flash } from "./flash";
import { textDownload } from "./util/file-download";
import { fireEvent } from "./util/fire-event";
import { sleep } from "./util/sleep";
import { downloadManifest } from "./util/manifest";
import { dialogStyles } from "./styles";
import { parsePartitionTable, type Partition } from "./partition.js";
import { detectFilesystemType } from "./util/partition.js";
import { getChipFamilyName } from "./util/chip-family-name";

const ERROR_ICON = "⚠️";
const OK_ICON = "🎉";

export class EwtInstallDialog extends LitElement {
  public esploader!: any; // ESPLoader instance from tasmota-webserial-esptool

  public manifestPath!: string;

  public firmwareFile?: File;

  public baudRate?: number;

  public logger: Logger = console;

  public overrides?: {
    checkSameFirmware?: (
      manifest: Manifest,
      deviceImprov: ImprovSerial["info"],
    ) => boolean;
  };

  private _manifest!: Manifest;

  private _info?: ImprovSerial["info"];

  // null = NOT_SUPPORTED
  @state() private _client?: ImprovSerial | null;

  @state() private _state:
    | "ERROR"
    | "DASHBOARD"
    | "PROVISION"
    | "INSTALL"
    | "ASK_ERASE"
    | "LOGS"
    | "PARTITIONS"
    | "LITTLEFS" = "DASHBOARD";

  @state() private _installErase = false;
  @state() private _installConfirmed = false;
  @state() private _installState?: FlashState;

  @state() private _provisionForce = false;
  private _wasProvisioned = false;

  @state() private _error?: string;

  @state() private _busy = false;

  // undefined = not loaded
  // null = not available
  @state() private _ssids?: Ssid[] | null;

  // -1 = custom
  @state() private _selectedSsid = -1;

  // Partition table support
  @state() private _partitions?: Partition[];
  @state() private _selectedPartition?: Partition;
  @state() private _espStub?: any;

  // Track if Improv was already checked (to avoid repeated attempts)
  private _improvChecked = false;

  // Check if running on Android with WebUSB
  private get _isAndroid(): boolean {
    const port = this.esploader?.port as any;
    return port?.isWebUSB === true;
  }

  // Ensure stub is initialized (called before any operation that needs it)
  private async _ensureStub(): Promise<any> {
    if (this._espStub && this._espStub.IS_STUB) {
      this.logger.log(
        `Existing stub: IS_STUB=${this._espStub.IS_STUB}, chipFamily=${getChipFamilyName(this._espStub)}`,
      );

      // Ensure baudrate is set even if stub already exists
      if (this.baudRate && this.baudRate > 115200) {
        const currentBaud = this._espStub._currentBaudRate || 115200;
        if (currentBaud !== this.baudRate) {
          this.logger.log(
            `Adjusting baudrate from ${currentBaud} to ${this.baudRate}...`,
          );
          try {
            await this._espStub.setBaudrate(this.baudRate);
            this.logger.log(`Baudrate set to ${this.baudRate}`);
          } catch (baudErr: any) {
            this.logger.log(
              `Failed to set baudrate: ${baudErr.message}, continuing with current`,
            );
          }
        }
      }

      return this._espStub;
    }

    // Initialize if not already done
    if (!this.esploader.chipFamily) {
      this.logger.log("Initializing ESP loader...");

      try {
        await this.esploader.initialize();
        this.logger.log(`Found ${getChipFamilyName(this.esploader)}`);
      } catch (err: any) {
        this.logger.error(`Connection failed: ${err.message}`);

        // Try to reset device and release locks, then retry once
        this.logger.log("Attempting to reset device and retry connection...");
        await this._resetDeviceAndReleaseLocks();

        try {
          await this.esploader.initialize();
          this.logger.log(
            `Found ${getChipFamilyName(this.esploader)} after reset`,
          );
        } catch (retryErr: any) {
          this.logger.error(`Retry failed: ${retryErr.message}`);
          throw new Error(
            `Failed to connect to ESP. ${retryErr.message || "Unknown error"}.\n\n` +
              `Please try:\n` +
              `1. Press and hold the BOOT button on your ESP device\n` +
              `2. Click OK to retry\n` +
              `3. Release the BOOT button when flashing starts\n\n` +
              `If that doesn't work, try unplugging and reconnecting your device.`,
          );
        }
      }
    }

    // Run stub - chip properties are now automatically inherited from parent
    this.logger.log("Running stub...");
    const espStub = await this.esploader.runStub();

    this.logger.log(
      `Stub created: IS_STUB=${espStub.IS_STUB}, chipFamily=${getChipFamilyName(espStub)}`,
    );
    this._espStub = espStub;

    // Set baudrate BEFORE any operations (use user-selected baudrate if available)
    if (this.baudRate && this.baudRate > 115200) {
      this.logger.log(`Setting baudrate to ${this.baudRate}...`);
      try {
        await espStub.setBaudrate(this.baudRate);
        this.logger.log(`Baudrate set to ${this.baudRate}`);
      } catch (baudErr: any) {
        this.logger.error(
          `[DEBUG] setBaudrate() threw error: ${baudErr.message}`,
        );
        this.logger.log(
          `Failed to set baudrate: ${baudErr.message}, continuing with default`,
        );
      }
    }

    this.logger.log(
      `Returning stub: IS_STUB=${this._espStub.IS_STUB}, chipFamily=${getChipFamilyName(this._espStub)}`,
    );
    return this._espStub;
  }

  // Helper to get port from esploader
  private get _port(): SerialPort {
    return this.esploader.port;
  }

  // Helper to release reader/writer locks (used by multiple methods)
  private async _releaseReaderWriter() {
    if (this.esploader._reader) {
      try {
        // Only cancel if reader is still active (not already released)
        if (this.esploader._reader.locked !== false) {
          await this.esploader._reader.cancel();
        }
        this.esploader._reader.releaseLock();
        this.esploader._reader = undefined;
        this.logger.log("Reader released");
      } catch (err) {
        // Reader might already be released - just clear the reference
        this.esploader._reader = undefined;
        this.logger.log("Reader already released or error:", err);
      }
    }
    if (this.esploader._writer) {
      try {
        this.esploader._writer.releaseLock();
        this.esploader._writer = undefined;
        this.logger.log("Writer released");
      } catch (err) {
        // Writer might already be released - just clear the reference
        this.esploader._writer = undefined;
        this.logger.log("Writer already released or error:", err);
      }
    }
  }

  // Reset device and release locks - used when returning to dashboard or recovering from errors
  // Reset device to FIRMWARE mode (normal execution)
  private async _resetDeviceAndReleaseLocks() {
    // Release esploader reader/writer if locked
    await this._releaseReaderWriter();

    // Hardware reset to FIRMWARE mode (bootloader=false) and to fix connection issues
    // Use appropriate method based on platform (Desktop vs Android)
    try {
      await this.esploader.hardReset(false);
      this.logger.log("Device reset to firmware mode");
    } catch (err) {
      this.logger.log("Could not reset device:", err);
    }

    // Reset ESP state
    this._espStub = undefined;
    this.esploader.IS_STUB = false;
    this.esploader.chipFamily = null;
  }

  // Reset device to BOOTLOADER mode (for flashing) using DTR/RTS sequence
  private async _resetToBootloaderAndReleaseLocks() {
    // Release esploader reader/writer if locked
    await this._releaseReaderWriter();

    // Special DTR/RTS sequence to enter BOOTLOADER mode
    // This is the bootloader entry sequence, NOT a simple reset!
    try {
      if (this._isAndroid) {
        // Android (WebUSB) - use WebUSB-specific methods
        await this.esploader.setDTRWebUSB(false);
        await this.esploader.setRTSWebUSB(true);
        await sleep(100);
        await this.esploader.setDTRWebUSB(false);
        await this.esploader.setRTSWebUSB(false);
        await sleep(200);
        this.logger.log("Device reset to bootloader (WebUSB/Android)");
      } else {
        // Desktop (Web Serial) - use Web Serial methods
        await this.esploader.setDTR(false);
        await this.esploader.setRTS(true);
        await sleep(100);
        await this.esploader.setDTR(false);
        await this.esploader.setRTS(false);
        await sleep(200);
        this.logger.log("Device reset to bootloader (Web Serial/Desktop)");
      }
    } catch (err) {
      this.logger.log("Could not reset device to bootloader:", err);
    }

    // Reset ESP state
    this._espStub = undefined;
    this.esploader.IS_STUB = false;
    this.esploader.chipFamily = null;
  }

  protected render() {
    if (!this.esploader) {
      return html``;
    }
    let heading: string | undefined;
    let content: TemplateResult;
    let hideActions = false;
    let allowClosing = false;

    // During installation phase we temporarily remove the client
    if (
      this._client === undefined &&
      this._state !== "INSTALL" &&
      this._state !== "LOGS" &&
      this._state !== "PARTITIONS" &&
      this._state !== "LITTLEFS"
    ) {
      if (this._error) {
        [heading, content, hideActions] = this._renderError(this._error);
      } else {
        content = this._renderProgress("Connecting");
        hideActions = true;
      }
    } else if (this._state === "INSTALL") {
      [heading, content, hideActions, allowClosing] = this._renderInstall();
    } else if (this._state === "ASK_ERASE") {
      [heading, content] = this._renderAskErase();
    } else if (this._state === "ERROR") {
      [heading, content, hideActions] = this._renderError(this._error!);
    } else if (this._state === "DASHBOARD") {
      [heading, content, hideActions, allowClosing] = this._client
        ? this._renderDashboard()
        : this._renderDashboardNoImprov();
    } else if (this._state === "PROVISION") {
      [heading, content, hideActions] = this._renderProvision();
    } else if (this._state === "LOGS") {
      [heading, content, hideActions] = this._renderLogs();
    } else if (this._state === "PARTITIONS") {
      [heading, content, hideActions] = this._renderPartitions();
    } else if (this._state === "LITTLEFS") {
      [heading, content, hideActions, allowClosing] = this._renderLittleFS();
    }

    return html`
      <ewt-dialog
        open
        .heading=${heading!}
        scrimClickAction
        @closed=${this._handleClose}
        .hideActions=${hideActions}
      >
        ${heading && allowClosing
          ? html`
              <ewt-icon-button dialogAction="close">
                ${closeIcon}
              </ewt-icon-button>
            `
          : ""}
        ${content!}
      </ewt-dialog>
    `;
  }

  _renderProgress(label: string | TemplateResult, progress?: number) {
    return html`
      <ewt-page-progress
        .label=${label}
        .progress=${progress}
      ></ewt-page-progress>
    `;
  }

  _renderError(label: string): [string, TemplateResult, boolean] {
    const heading = "Error";
    const content = html`
      <ewt-page-message .icon=${ERROR_ICON} .label=${label}></ewt-page-message>
      <ewt-button
        slot="primaryAction"
        dialogAction="ok"
        label="Close"
      ></ewt-button>
    `;
    const hideActions = false;
    return [heading, content, hideActions];
  }

  _renderDashboard(): [string, TemplateResult, boolean, boolean] {
    const heading = this._info!.name;
    let content: TemplateResult;
    let hideActions = true;
    let allowClosing = true;

    content = html`
      <div class="table-row">
        ${firmwareIcon}
        <div>${this._info!.firmware}&nbsp;${this._info!.version}</div>
      </div>
      <div class="table-row last">
        ${chipIcon}
        <div>${this._info!.chipFamily}</div>
      </div>
      <div class="dashboard-buttons">
        ${!this._isSameVersion
          ? html`
              <div>
                <ewt-button
                  text-left
                  .label=${!this._isSameFirmware
                    ? `Install ${this._manifest.name}`
                    : `Update ${this._manifest.name}`}
                  @click=${() => {
                    if (this._isSameFirmware) {
                      this._startInstall(false);
                    } else if (this._manifest.new_install_prompt_erase) {
                      this._state = "ASK_ERASE";
                    } else {
                      this._startInstall(true);
                    }
                  }}
                ></ewt-button>
              </div>
            `
          : ""}
        ${this._client!.nextUrl === undefined
          ? ""
          : html`
              <div>
                <a
                  href=${this._client!.nextUrl}
                  class="has-button"
                  target="_blank"
                >
                  <ewt-button label="Visit Device"></ewt-button>
                </a>
              </div>
            `}
        ${!this._manifest.home_assistant_domain ||
        this._client!.state !== ImprovSerialCurrentState.PROVISIONED
          ? ""
          : html`
              <div>
                <a
                  href=${`https://my.home-assistant.io/redirect/config_flow_start/?domain=${this._manifest.home_assistant_domain}`}
                  class="has-button"
                  target="_blank"
                >
                  <ewt-button label="Add to Home Assistant"></ewt-button>
                </a>
              </div>
            `}
        <div>
          <ewt-button
            .label=${this._client!.state === ImprovSerialCurrentState.READY
              ? "Connect to Wi-Fi"
              : "Change Wi-Fi"}
            @click=${() => {
              this._state = "PROVISION";
              if (
                this._client!.state === ImprovSerialCurrentState.PROVISIONED
              ) {
                this._provisionForce = true;
              }
            }}
          ></ewt-button>
        </div>
        <div>
          <ewt-button
            label="Logs & Console"
            @click=${async () => {
              const client = this._client;
              if (client) {
                await this._closeClientWithoutEvents(client);
                await sleep(100);
              }
              // Also set `null` back to undefined.
              this._client = undefined;

              // CRITICAL: Set baudrate back to 115200 for firmware communication
              // The ESP stub might be at higher baudrate (e.g., 460800) for flashing
              // But firmware console always runs at 115200
              if (this._espStub && this._espStub._currentBaudRate !== 115200) {
                this.logger.log(
                  `Resetting baudrate from ${this._espStub._currentBaudRate} to 115200 for console...`,
                );
                try {
                  await this._espStub.setBaudrate(115200);
                  this.logger.log("Baudrate set to 115200 for console");
                } catch (baudErr: any) {
                  this.logger.log(
                    `Failed to set baudrate to 115200: ${baudErr.message}`,
                  );
                }
              }

              // Release esploader reader/writer if locked
              if (this.esploader._reader) {
                try {
                  await this.esploader._reader.cancel();
                  this.esploader._reader.releaseLock();
                  this.esploader._reader = undefined;
                  this.logger.log("Reader released for console");
                } catch (err) {
                  this.logger.log("Could not release reader:", err);
                }
              }
              if (this.esploader._writer) {
                try {
                  this.esploader._writer.releaseLock();
                  this.esploader._writer = undefined;
                  this.logger.log("Writer released for console");
                } catch (err) {
                  this.logger.log("Could not release writer:", err);
                }
              }

              this._state = "LOGS";
            }}
          ></ewt-button>
        </div>
        <div>
          <ewt-button
            label="Manage Filesystem"
            @click=${async () => {
              // Close Improv client if active (it locks the reader)
              if (this._client) {
                await this._closeClientWithoutEvents(this._client);
                this._client = undefined;
              }

              // Release esploader reader/writer if locked
              await this._releaseReaderWriter();

              // Reset ESP state to put it back into bootloader mode
              this._espStub = undefined;
              this.esploader.IS_STUB = false;
              this.esploader.chipFamily = null;
              this._improvChecked = false; // Clear flag so Improv will be re-tested
              this.logger.log(
                "ESP state reset - will re-initialize for filesystem access",
              );

              this._state = "PARTITIONS";
              this._readPartitionTable();
            }}
          ></ewt-button>
        </div>
        ${this._isSameFirmware && this._manifest.funding_url
          ? html`
              <div>
                <a
                  class="button"
                  href=${this._manifest.funding_url}
                  target="_blank"
                >
                  <ewt-button label="Fund Development"></ewt-button>
                </a>
              </div>
            `
          : ""}
        ${this._isSameVersion
          ? html`
              <div>
                <ewt-button
                  class="danger"
                  label="Erase User Data"
                  @click=${() => this._startInstall(true)}
                ></ewt-button>
              </div>
            `
          : ""}
      </div>
    `;

    return [heading, content, hideActions, allowClosing];
  }
  _renderDashboardNoImprov(): [string, TemplateResult, boolean, boolean] {
    const heading = "Device Dashboard";
    let content: TemplateResult;
    let hideActions = true;
    let allowClosing = true;

    content = html`
      <div class="dashboard-buttons">
        <div>
          <ewt-button
            text-left
            .label=${`Install ${this._manifest.name}`}
            @click=${() => {
              if (this._manifest.new_install_prompt_erase) {
                this._state = "ASK_ERASE";
              } else {
                // Default is to erase a device that does not support Improv Serial
                this._startInstall(true);
              }
            }}
          ></ewt-button>
        </div>

        <div>
          <ewt-button
            label="Logs & Console"
            @click=${async () => {
              // Also set `null` back to undefined.
              this._client = undefined;

              // CRITICAL: Set baudrate back to 115200 for firmware communication
              // The ESP stub might be at higher baudrate (e.g., 460800) for flashing
              // But firmware console always runs at 115200
              if (this._espStub && this._espStub._currentBaudRate !== 115200) {
                this.logger.log(
                  `Resetting baudrate from ${this._espStub._currentBaudRate} to 115200 for console...`,
                );
                try {
                  await this._espStub.setBaudrate(115200);
                  this.logger.log("Baudrate set to 115200 for console");
                } catch (baudErr: any) {
                  this.logger.log(
                    `Failed to set baudrate to 115200: ${baudErr.message}`,
                  );
                }
              }

              // Release esploader reader/writer if locked
              await this._releaseReaderWriter();

              this._state = "LOGS";
            }}
          ></ewt-button>
        </div>

        <div>
          <ewt-button
            label="Manage Filesystem"
            @click=${async () => {
              // Close Improv client if active (it locks the reader)
              if (this._client) {
                await this._closeClientWithoutEvents(this._client);
                this._client = undefined;
              }

              // Release esploader reader/writer if locked
              await this._releaseReaderWriter();

              // Reset ESP state to put it back into bootloader mode
              this._espStub = undefined;
              this.esploader.IS_STUB = false;
              this.esploader.chipFamily = null;
              this._improvChecked = false; // Clear flag so Improv will be re-tested
              this.logger.log(
                "ESP state reset - will re-initialize for filesystem access",
              );

              this._state = "PARTITIONS";
              this._readPartitionTable();
            }}
          ></ewt-button>
        </div>
      </div>
    `;

    return [heading, content, hideActions, allowClosing];
  }

  _renderProvision(): [string | undefined, TemplateResult, boolean] {
    let heading: string | undefined = "Configure Wi-Fi";
    let content: TemplateResult;
    let hideActions = false;

    if (this._busy) {
      return [
        heading,
        this._renderProgress(
          this._ssids === undefined
            ? "Scanning for networks"
            : "Trying to connect",
        ),
        true,
      ];
    }

    if (
      !this._provisionForce &&
      this._client!.state === ImprovSerialCurrentState.PROVISIONED
    ) {
      heading = undefined;
      const showSetupLinks =
        !this._wasProvisioned &&
        (this._client!.nextUrl !== undefined ||
          "home_assistant_domain" in this._manifest);
      hideActions = showSetupLinks;
      content = html`
        <ewt-page-message
          .icon=${OK_ICON}
          label="Device connected to the network!"
        ></ewt-page-message>
        ${showSetupLinks
          ? html`
              <div class="dashboard-buttons">
                ${this._client!.nextUrl === undefined
                  ? ""
                  : html`
                      <div>
                        <a
                          href=${this._client!.nextUrl}
                          class="has-button"
                          target="_blank"
                          @click=${() => {
                            this._state = "DASHBOARD";
                          }}
                        >
                          <ewt-button label="Visit Device"></ewt-button>
                        </a>
                      </div>
                    `}
                ${!this._manifest.home_assistant_domain
                  ? ""
                  : html`
                      <div>
                        <a
                          href=${`https://my.home-assistant.io/redirect/config_flow_start/?domain=${this._manifest.home_assistant_domain}`}
                          class="has-button"
                          target="_blank"
                          @click=${() => {
                            this._state = "DASHBOARD";
                          }}
                        >
                          <ewt-button
                            label="Add to Home Assistant"
                          ></ewt-button>
                        </a>
                      </div>
                    `}
                <div>
                  <ewt-button
                    label="Skip"
                    @click=${() => {
                      this._state = "DASHBOARD";
                    }}
                  ></ewt-button>
                </div>
              </div>
            `
          : html`
              <ewt-button
                slot="primaryAction"
                label="Continue"
                @click=${() => {
                  this._state = "DASHBOARD";
                }}
              ></ewt-button>
            `}
      `;
    } else {
      let error: string | undefined;

      switch (this._client!.error) {
        case ImprovSerialErrorState.UNABLE_TO_CONNECT:
          error = "Unable to connect";
          break;

        case ImprovSerialErrorState.NO_ERROR:
        // Happens when list SSIDs not supported.
        case ImprovSerialErrorState.UNKNOWN_RPC_COMMAND:
          break;

        default:
          error = `Unknown error (${this._client!.error})`;
      }
      content = html`
        <div>
          Enter the credentials of the Wi-Fi network that you want your device
          to connect to.
        </div>
        ${error ? html`<p class="error">${error}</p>` : ""}
        ${this._ssids !== null
          ? html`
              <ewt-select
                fixedMenuPosition
                label="Network"
                @selected=${(ev: { detail: { index: number } }) => {
                  const index = ev.detail.index;
                  // The "Join Other" item is always the last item.
                  this._selectedSsid =
                    index === this._ssids!.length ? -1 : index;
                }}
                @closed=${(ev: Event) => ev.stopPropagation()}
              >
                ${this._ssids!.map(
                  (info, idx) => html`
                    <ewt-list-item
                      .selected=${this._selectedSsid === idx}
                      value=${idx}
                    >
                      ${info.name}
                    </ewt-list-item>
                  `,
                )}
                <ewt-list-item
                  .selected=${this._selectedSsid === -1}
                  value="-1"
                >
                  Join other…
                </ewt-list-item>
              </ewt-select>
            `
          : ""}
        ${
          // Show input box if command not supported or "Join Other" selected
          this._selectedSsid === -1
            ? html`
                <ewt-textfield label="Network Name" name="ssid"></ewt-textfield>
              `
            : ""
        }
        <ewt-textfield
          label="Password"
          name="password"
          type="password"
        ></ewt-textfield>
        <ewt-button
          slot="primaryAction"
          label="Connect"
          @click=${this._doProvision}
        ></ewt-button>
        <ewt-button
          slot="secondaryAction"
          .label=${this._installState && this._installErase ? "Skip" : "Back"}
          @click=${() => {
            this._state = "DASHBOARD";
          }}
        ></ewt-button>
      `;
    }
    return [heading, content, hideActions];
  }

  _renderAskErase(): [string | undefined, TemplateResult] {
    const heading = "Erase device";
    const content = html`
      <div>
        Do you want to erase the device before installing
        ${this._manifest.name}? All data on the device will be lost.
      </div>
      <ewt-formfield label="Erase device" class="danger">
        <ewt-checkbox></ewt-checkbox>
      </ewt-formfield>
      <ewt-button
        slot="primaryAction"
        label="Next"
        @click=${() => {
          const checkbox = this.shadowRoot!.querySelector("ewt-checkbox")!;
          this._startInstall(checkbox.checked);
        }}
      ></ewt-button>
      <ewt-button
        slot="secondaryAction"
        label="Back"
        @click=${() => {
          this._state = "DASHBOARD";
        }}
      ></ewt-button>
    `;

    return [heading, content];
  }

  _renderInstall(): [string | undefined, TemplateResult, boolean, boolean] {
    let heading: string | undefined;
    let content: TemplateResult;
    let hideActions = false;
    const allowClosing = false;

    const isUpdate = !this._installErase && this._isSameFirmware;

    if (!this._installConfirmed && this._isSameVersion) {
      heading = "Erase User Data";
      content = html`
        Do you want to reset your device and erase all user data from your
        device?
        <ewt-button
          class="danger"
          slot="primaryAction"
          label="Erase User Data"
          @click=${this._confirmInstall}
        ></ewt-button>
      `;
    } else if (!this._installConfirmed) {
      heading = "Confirm Installation";
      const action = isUpdate ? "update to" : "install";
      content = html`
        ${isUpdate
          ? html`Your device is running
              ${this._info!.firmware}&nbsp;${this._info!.version}.<br /><br />`
          : ""}
        Do you want to ${action}
        ${this._manifest.name}&nbsp;${this._manifest.version}?
        ${this._installErase
          ? html`<br /><br />All data on the device will be erased.`
          : ""}
        <ewt-button
          slot="primaryAction"
          label="Install"
          @click=${this._confirmInstall}
        ></ewt-button>
        <ewt-button
          slot="secondaryAction"
          label="Back"
          @click=${() => {
            this._state = "DASHBOARD";
          }}
        ></ewt-button>
      `;
    } else if (
      !this._installState ||
      this._installState.state === FlashStateType.INITIALIZING ||
      this._installState.state === FlashStateType.MANIFEST ||
      this._installState.state === FlashStateType.PREPARING
    ) {
      heading = "Installing";
      content = this._renderProgress("Preparing installation");
      hideActions = true;
    } else if (this._installState.state === FlashStateType.ERASING) {
      heading = "Installing";
      content = this._renderProgress("Erasing");
      hideActions = true;
    } else if (
      this._installState.state === FlashStateType.WRITING ||
      // When we're finished, keep showing this screen with 100% written
      // until Improv is initialized / not detected.
      (this._installState.state === FlashStateType.FINISHED &&
        this._client === undefined)
    ) {
      heading = "Installing";
      let percentage: number | undefined;
      let undeterminateLabel: string | undefined;
      if (this._installState.state === FlashStateType.FINISHED) {
        // We're done writing and detecting improv, show spinner
        undeterminateLabel = "Wrapping up";
      } else if (this._installState.details.percentage < 4) {
        // We're writing the firmware under 4%, show spinner or else we don't show any pixels
        undeterminateLabel = "Installing";
      } else {
        // We're writing the firmware over 4%, show progress bar
        percentage = this._installState.details.percentage;
      }
      content = this._renderProgress(
        html`
          ${undeterminateLabel ? html`${undeterminateLabel}<br />` : ""}
          <br />
          This will take
          ${this._installState.chipFamily === "ESP8266"
            ? "a minute"
            : "2 minutes"}.<br />
          Keep this page visible to prevent slow down
        `,
        percentage,
      );
      hideActions = true;
    } else if (this._installState.state === FlashStateType.FINISHED) {
      heading = undefined;
      const supportsImprov = this._client !== null;
      content = html`
        <ewt-page-message
          .icon=${OK_ICON}
          label="Installation complete!"
        ></ewt-page-message>
        <ewt-button
          slot="primaryAction"
          label="Next"
          @click=${() => {
            this._state =
              supportsImprov && this._installErase ? "PROVISION" : "DASHBOARD";
          }}
        ></ewt-button>
      `;
    } else if (this._installState.state === FlashStateType.ERROR) {
      heading = "Installation failed";
      content = html`
        <ewt-page-message
          .icon=${ERROR_ICON}
          .label=${this._installState.message}
        ></ewt-page-message>
        <ewt-button
          slot="primaryAction"
          label="Back"
          @click=${async () => {
            await this._initialize(); // Re-test Improv after failed flash
            this._state = "DASHBOARD";
          }}
        ></ewt-button>
      `;
    }
    return [heading, content!, hideActions, allowClosing];
  }

  _renderLogs(): [string | undefined, TemplateResult, boolean] {
    let heading: string | undefined = `Logs`;
    let content: TemplateResult;
    let hideActions = false;

    content = html`
      <ewt-console .port=${this._port} .logger=${this.logger}></ewt-console>
      <ewt-button
        slot="primaryAction"
        label="Back"
        @click=${async () => {
          await this.shadowRoot!.querySelector("ewt-console")!.disconnect();

          // Complete re-init like new connection (but without Improv)
          this.logger.log("Reset and Release locks...");
          try {
            await this._resetDeviceAndReleaseLocks();
          } catch (reconnectErr: any) {
            this.logger.error(
              `Reset and Release locks failed: ${reconnectErr.message}`,
            );
          }

          this._state = "DASHBOARD";
          await this._initialize(); // Re-test Improv after console
        }}
      ></ewt-button>
      <ewt-button
        slot="secondaryAction"
        label="Download Logs"
        @click=${() => {
          textDownload(
            this.shadowRoot!.querySelector("ewt-console")!.logs(),
            `esp-web-tools-logs.txt`,
          );

          this.shadowRoot!.querySelector("ewt-console")!.reset();
        }}
      ></ewt-button>
      <ewt-button
        slot="secondaryAction"
        label="Reset Device"
        @click=${async () => {
          await this.shadowRoot!.querySelector("ewt-console")!.reset();
        }}
      ></ewt-button>
    `;

    return [heading, content!, hideActions];
  }

  _renderPartitions(): [string | undefined, TemplateResult, boolean] {
    const heading = "Partition Table";
    let content: TemplateResult;
    const hideActions = false;

    if (this._busy) {
      content = this._renderProgress("Reading partition table...");
    } else if (!this._partitions || this._partitions.length === 0) {
      content = html`
        <ewt-page-message
          .icon=${ERROR_ICON}
          label="No partitions found"
        ></ewt-page-message>
        <ewt-button
          slot="primaryAction"
          label="Back"
          @click=${async () => {
            await this._resetDeviceAndReleaseLocks();
            this._state = "DASHBOARD";
            await this._initialize();
          }}
        ></ewt-button>
      `;
    } else {
      content = html`
        <div class="partition-list">
          <table class="partition-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>SubType</th>
                <th>Offset</th>
                <th>Size</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${this._partitions.map(
                (partition) => html`
                  <tr>
                    <td>${partition.name}</td>
                    <td>${partition.typeName}</td>
                    <td>${partition.subtypeName}</td>
                    <td>0x${partition.offset.toString(16)}</td>
                    <td>${this._formatSize(partition.size)}</td>
                    <td>
                      ${partition.type === 0x01 && partition.subtype === 0x82
                        ? html`
                            <ewt-button
                              label="Open FS"
                              @click=${() => this._openFilesystem(partition)}
                            ></ewt-button>
                          `
                        : ""}
                    </td>
                  </tr>
                `,
              )}
            </tbody>
          </table>
        </div>
        <ewt-button
          slot="primaryAction"
          label="Back"
          @click=${async () => {
            await this._resetDeviceAndReleaseLocks();
            this._state = "DASHBOARD";
            await this._initialize();
          }}
        ></ewt-button>
      `;
    }

    return [heading, content, hideActions];
  }

  _renderLittleFS(): [string | undefined, TemplateResult, boolean, boolean] {
    const heading = undefined;
    const hideActions = true;
    const allowClosing = true;

    const content = html`
      <ewt-littlefs-manager
        .partition=${this._selectedPartition}
        .espStub=${this._espStub}
        .logger=${this.logger}
        .onClose=${() => {
          this._state = "PARTITIONS";
        }}
      ></ewt-littlefs-manager>
    `;

    return [heading, content, hideActions, allowClosing];
  }

  private async _readPartitionTable() {
    const PARTITION_TABLE_OFFSET = 0x8000;
    const PARTITION_TABLE_SIZE = 0x1000;

    this._busy = true;
    this._partitions = undefined;

    try {
      this.logger.log("Reading partition table from 0x8000...");

      // Ensure stub is initialized
      const espStub = await this._ensureStub();

      // Add a small delay after stub is running
      await sleep(100);

      this.logger.log("Reading flash data...");
      const data = await espStub.readFlash(
        PARTITION_TABLE_OFFSET,
        PARTITION_TABLE_SIZE,
      );

      const partitions = parsePartitionTable(data);

      if (partitions.length === 0) {
        this.logger.log("No valid partition table found");
        this._partitions = [];
      } else {
        this.logger.log(`Found ${partitions.length} partition(s)`);
        this._partitions = partitions;
      }
    } catch (e: any) {
      this.logger.error(`Failed to read partition table: ${e.message || e}`);

      if (e.message === "Port selection cancelled") {
        await this._resetDeviceAndReleaseLocks();
        this._error = "Port selection cancelled";
        this._state = "ERROR";
      } else if (e.message && e.message.includes("Failed to connect")) {
        // Connection error - show error state so user can retry
        await this._resetDeviceAndReleaseLocks();
        this._error = e.message;
        this._state = "ERROR";
      } else {
        // Other errors (like parsing errors) - just show empty partition list
        this.logger.log("Returning to partition view with no partitions");
        this._partitions = [];
      }
    } finally {
      // DON'T release reader/writer locks here!
      // Keep them so the stub remains usable for:
      // - Multiple partition reads
      // - Opening filesystem
      // The locks will be released when:
      // - User clicks "Back" to dashboard (calls _initialize)
      // - User clicks "Install Firmware" (flash.ts releases them)
      // - Dialog is closed (calls _handleClose)

      this._busy = false;
    }
  }

  private async _openFilesystem(partition: Partition) {
    try {
      this._busy = true;
      this.logger.log(
        `Detecting filesystem type for partition "${partition.name}"...`,
      );

      // Check if ESP stub is still available
      if (!this._espStub) {
        throw new Error("ESP stub not available. Please reconnect.");
      }

      const fsType = await detectFilesystemType(
        this._espStub,
        partition.offset,
        partition.size,
        this.logger,
      );
      this.logger.log(`Detected filesystem: ${fsType}`);

      if (fsType === "littlefs") {
        this._selectedPartition = partition;
        this._state = "LITTLEFS";
      } else if (fsType === "spiffs") {
        this.logger.error(
          "SPIFFS support not yet implemented. Use LittleFS partitions.",
        );
        this._error = "SPIFFS support not yet implemented";
        this._state = "ERROR";
      } else {
        this.logger.error("Unknown filesystem type. Cannot open partition.");
        this._error = "Unknown filesystem type";
        this._state = "ERROR";
      }
    } catch (e: any) {
      this.logger.error(`Failed to open filesystem: ${e.message || e}`);
      this._error = `Failed to open filesystem: ${e.message || e}`;
      this._state = "ERROR";
    } finally {
      this._busy = false;
    }
  }

  private _formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  }

  public override willUpdate(changedProps: PropertyValues) {
    if (!changedProps.has("_state")) {
      return;
    }
    // Clear errors when changing between pages unless we change
    // to the error page.
    if (this._state !== "ERROR") {
      this._error = undefined;
    }
    // Scan for SSIDs on provision
    if (this._state === "PROVISION") {
      this._ssids = undefined;
      this._busy = true;
      this._client!.scan().then(
        (ssids) => {
          this._busy = false;
          this._ssids = ssids;
          this._selectedSsid = ssids.length ? 0 : -1;
        },
        () => {
          this._busy = false;
          this._ssids = null;
          this._selectedSsid = -1;
        },
      );
    } else {
      // Reset this value if we leave provisioning.
      this._provisionForce = false;
    }

    if (this._state === "INSTALL") {
      this._installConfirmed = false;
      this._installState = undefined;
    }
  }

  protected override firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);

    // Wrap logger to also log to debug component
    const originalLogger = this.logger;
    this.logger = {
      log: (msg: string, ...args: any[]) => {
        originalLogger.log(msg, ...args);
      },
      error: (msg: string, ...args: any[]) => {
        originalLogger.error(msg, ...args);
      },
      debug: (msg: string, ...args: any[]) => {
        if (originalLogger.debug) {
          originalLogger.debug(msg, ...args);
        }
      },
    };

    this._initialize(); // Initial connect - test Improv
  }

  protected override updated(changedProps: PropertyValues) {
    super.updated(changedProps);

    if (changedProps.has("_state")) {
      this.setAttribute("state", this._state);
    }

    if (this._state !== "PROVISION") {
      return;
    }

    if (changedProps.has("_selectedSsid") && this._selectedSsid === -1) {
      // If we pick "Join other", select SSID input.
      this._focusFormElement("ewt-textfield[name=ssid]");
    } else if (changedProps.has("_ssids")) {
      // Form is shown when SSIDs are loaded/marked not supported
      this._focusFormElement();
    }
  }

  private _focusFormElement(selector = "ewt-textfield, ewt-select") {
    const formEl = this.shadowRoot!.querySelector(
      selector,
    ) as LitElement | null;
    if (formEl) {
      formEl.updateComplete.then(() => setTimeout(() => formEl.focus(), 100));
    }
  }

  private async _initialize(justInstalled = false, skipImprov = false) {
    if (this._port.readable === null || this._port.writable === null) {
      this._state = "ERROR";
      this._error =
        "Serial port is not readable/writable. Close any other application using it and try again.";
      return;
    }

    // DON'T release locks here!
    // The stub will be created on first use and kept for all operations

    try {
      // If local file upload via browser is used, we already provide a manifest as a JSON string and not a URL to it
      this._manifest = JSON.parse(this.manifestPath);
    } catch {
      // Standard procedure - download manifest.json with provided URL
      try {
        this._manifest = await downloadManifest(this.manifestPath);
      } catch (err: any) {
        this._state = "ERROR";
        this._error = "Failed to download manifest";
        return;
      }
    }

    // ALWAYS skip Improv on Android - it causes connection issues
    if (this._isAndroid) {
      this.logger.log("Skipping Improv on Android (WebUSB) - not supported");
      this._client = null;
      this._improvChecked = true;
      return;
    }

    // Skip Improv if requested (e.g., when returning from console or filesystem manager)
    if (skipImprov) {
      this.logger.log("Skipping Improv test (not needed for this operation)");
      this._client = null;
      this._improvChecked = true;
      return;
    }

    if (this._manifest.new_install_improv_wait_time === 0) {
      this._client = null;
      return;
    }

    // Skip Improv if we already checked and it's not supported
    if (this._improvChecked && this._client === null) {
      this.logger.log("Improv already checked - not supported, skipping");
      return;
    }

    // Skip Improv if we already have a working client
    if (this._client) {
      this.logger.log("Improv client already active, skipping initialization");
      return;
    }

    // Port is at 115200 baud for Improv (no stub loaded yet!)
    // If not just installed, reset ESP to firmware mode to ensure firmware is running
    if (!justInstalled) {
      try {
        // Reset ESP to FIRMWARE mode (needed if we were in bootloader mode)
        await this._resetDeviceAndReleaseLocks();
        this.logger.log("ESP reset to firmware mode for Improv test");
        await sleep(100); // Wait for firmware to start
      } catch (e) {
        this.logger.log(`Reset to firmware failed, continuing anyway`);
      }
    }

    this._improvChecked = true;
    const client = new ImprovSerial(this._port, this.logger);
    client.addEventListener("state-changed", () => {
      this.requestUpdate();
    });
    client.addEventListener("error-changed", () => this.requestUpdate());
    try {
      // If a device was just installed, give new firmware 10 seconds (overridable) to
      // format the rest of the flash and do other stuff.
      const timeout = !justInstalled
        ? 1000
        : this._manifest.new_install_improv_wait_time !== undefined
          ? this._manifest.new_install_improv_wait_time * 1000
          : 10000;
      this._info = await client.initialize(timeout);
      this._client = client;
      client.addEventListener("disconnect", this._handleDisconnect);

      // After successful Improv: prepare ESP for potential flash operations
      // Close Improv client and reopen port to reset ESP into bootloader mode
      if (!justInstalled) {
        try {
          // CRITICAL: Close Improv client first to release reader lock
          await this._closeClientWithoutEvents(client);
          this.logger.log("Improv client closed");

          // Reset ESP to BOOTLOADER mode for flash operations
          await this._resetToBootloaderAndReleaseLocks();

          // Wait for ESP to enter bootloader mode
          await sleep(100);

          // Reset ESP state
          this._espStub = undefined;
          this.esploader.IS_STUB = false;
          this.esploader.chipFamily = null;
          // Ensure stub is initialized
          try {
            await this._ensureStub();
          } catch (err: any) {
            // Stub load failed - show error to user
            this._state = "ERROR";
            this._error = err.message;
            return;
          }
          this.logger.log(
            "ESP reseted, stub loaded - ready for flash operations",
          );
        } catch (resetErr: any) {
          this.logger.log(`ESP reset failed: ${resetErr.message}`);
        }
      }
    } catch (err: any) {
      // Clear old value
      this._info = undefined;

      // CRITICAL: Close the Improv client to release its reader
      try {
        await this._closeClientWithoutEvents(client);
        this.logger.log("Improv client closed after error");
      } catch (closeErr) {
        this.logger.log("Could not close Improv client:", closeErr);
      }

      if (err instanceof PortNotReady) {
        this._state = "ERROR";
        this._error =
          "Serial port is not ready. Close any other application using it and try again.";
      } else {
        this._client = null; // not supported
        this.logger.error("Improv initialization failed.", err);

        // After failed Improv: prepare ESP for flash operations anyway
        // Reset ESP into bootloader mode and load stub
        if (!justInstalled) {
          try {
            // Reset ESP to BOOTLOADER mode for flash operations
            await this._resetToBootloaderAndReleaseLocks();

            // Wait for ESP to enter bootloader mode
            await sleep(100);

            // Reset ESP state
            this._espStub = undefined;
            this.esploader.IS_STUB = false;
            this.esploader.chipFamily = null;
            // Ensure stub is initialized
            try {
              await this._ensureStub();
            } catch (err: any) {
              // Stub load failed - show error to user
              this._state = "ERROR";
              this._error = err.message;
              return;
            }
            this.logger.log(
              "ESP reseted, stub loaded - ready for flash operations",
            );
          } catch (resetErr: any) {
            this.logger.log(`ESP reset failed: ${resetErr.message}`);
          }
        }
      }
    }
  }

  private _startInstall(erase: boolean) {
    this._state = "INSTALL";
    this._installErase = erase;
    this._installConfirmed = false;
  }

  private async _confirmInstall() {
    this._installConfirmed = true;
    this._installState = undefined;

    if (this._client) {
      await this._closeClientWithoutEvents(this._client);
    }
    this._client = undefined;

    // Ensure stub is initialized before flash
    try {
      await this._ensureStub();
    } catch (err: any) {
      // Connection failed - show error to user
      this._state = "ERROR";
      this._error = err.message;
      return;
    }

    // Use the stub for flash
    const loaderToUse = this._espStub!;

    if (this.firmwareFile != undefined) {
      // If a uploaded File was provided -> create Uint8Array of content
      new Blob([this.firmwareFile])
        .arrayBuffer()
        .then((b) => this._flashFilebuffer(new Uint8Array(b)));
    } else {
      // Use "standard way" with URL to manifest and firmware binary
      flash(
        (state) => {
          this._installState = state;

          if (state.state === FlashStateType.FINISHED) {
            // Release locks and reset ESP state for Improv test
            sleep(100).then(async () => {
              const reader = this.esploader._reader;
              const writer = this.esploader._writer;

              if (reader) {
                await reader.cancel();
                reader.releaseLock();
                this.esploader._reader = undefined;
                this.logger.log("Reader released after flash");
              }

              if (writer) {
                writer.releaseLock();
                this.esploader._writer = undefined;
                this.logger.log("Writer released after flash");
              }

              // Reset ESP state for Improv test
              this._espStub = undefined;
              this.esploader.IS_STUB = false;
              this.esploader.chipFamily = null;
              this._improvChecked = false;
              this.esploader._reader = undefined;
              this.esploader._writer = undefined;
              this.logger.log("ESP state reset for Improv test");

              // Reset ESP to boot into new firmware
              // SKIP on Android - WebUSB connection handling is different
              if (!this._isAndroid) {
                try {
                  // Reset device and release locks to ensure clean state for new firmware
                  this.logger.log(
                    "Performing hardware reset to start new firmware...",
                  );
                  await this._resetDeviceAndReleaseLocks();
                } catch (resetErr: any) {
                  this.logger.log(`Hard reset failed: ${resetErr.message}`);
                }

                // Test Improv with new firmware (Desktop only)
                await this._initialize(true);
              } else {
                this.logger.log("Skipping hard reset on Android (WebUSB)");
                // On Android, skip Improv completely
                this._client = null;
                this._improvChecked = true;
              }

              this.requestUpdate();
            });
          }
        },
        loaderToUse,
        this.logger,
        this.manifestPath,
        this._installErase,
        new Uint8Array(0),
        this.baudRate,
      );
    }
  }

  async _flashFilebuffer(fileBuffer: Uint8Array) {
    // Stub is already ensured in _confirmInstall
    const loaderToUse = this._espStub!;

    flash(
      (state) => {
        this._installState = state;

        if (state.state === FlashStateType.FINISHED) {
          // Release locks and reset ESP state for Improv test
          sleep(100).then(async () => {
            const reader = this.esploader._reader;
            const writer = this.esploader._writer;

            if (reader) {
              await reader.cancel();
              reader.releaseLock();
              this.esploader._reader = undefined;
              this.logger.log("Reader released after flash");
            }

            if (writer) {
              writer.releaseLock();
              this.esploader._writer = undefined;
              this.logger.log("Writer released after flash");
            }

            // Reset ESP state for Improv test
            this._espStub = undefined;
            this.esploader.IS_STUB = false;
            this.esploader.chipFamily = null;
            this._improvChecked = false;
            this.esploader._reader = undefined;
            this.esploader._writer = undefined;
            this.logger.log("ESP state reset for Improv test");

            // Reset ESP to boot into new firmware
            // SKIP on Android - WebUSB connection handling is different
            if (!this._isAndroid) {
              try {
                // Reset device and release locks to ensure clean state for new firmware
                this.logger.log(
                  "Performing hardware reset to start new firmware...",
                );
                await this._resetDeviceAndReleaseLocks();
              } catch (resetErr: any) {
                this.logger.log(`Hard reset failed: ${resetErr.message}`);
              }

              // Test Improv with new firmware (Desktop only)
              await this._initialize(true);
            } else {
              this.logger.log("Skipping hard reset on Android (WebUSB)");
              // On Android, skip Improv completely
              this._client = null;
              this._improvChecked = true;
            }

            this.requestUpdate();
          });
        }
      },
      loaderToUse,
      this.logger,
      this.manifestPath,
      this._installErase,
      fileBuffer,
      this.baudRate,
    );
  }

  private async _doProvision() {
    this._busy = true;
    this._wasProvisioned =
      this._client!.state === ImprovSerialCurrentState.PROVISIONED;
    const ssid =
      this._selectedSsid === -1
        ? (
            this.shadowRoot!.querySelector(
              "ewt-textfield[name=ssid]",
            ) as EwtTextfield
          ).value
        : this._ssids![this._selectedSsid].name;
    const password = (
      this.shadowRoot!.querySelector(
        "ewt-textfield[name=password]",
      ) as EwtTextfield
    ).value;
    try {
      await this._client!.provision(ssid, password);
    } catch (err: any) {
      return;
    } finally {
      this._busy = false;
      this._provisionForce = false;
    }
  }

  private _handleDisconnect = () => {
    this._state = "ERROR";
    this._error = "Disconnected";
  };

  private async _handleClose() {
    if (this._client) {
      await this._closeClientWithoutEvents(this._client);
    }
    fireEvent(this, "closed" as any);
    this.parentNode!.removeChild(this);
  }

  /**
   * Return if the device runs same firmware as manifest.
   */
  private get _isSameFirmware() {
    return !this._info
      ? false
      : this.overrides?.checkSameFirmware
        ? this.overrides.checkSameFirmware(this._manifest, this._info)
        : this._info.firmware === this._manifest.name;
  }

  /**
   * Return if the device runs same firmware and version as manifest.
   */
  private get _isSameVersion() {
    return (
      this._isSameFirmware && this._info!.version === this._manifest.version
    );
  }

  private async _closeClientWithoutEvents(client: ImprovSerial) {
    client.removeEventListener("disconnect", this._handleDisconnect);
    await client.close();
  }

  static styles = [
    dialogStyles,
    css`
      :host {
        --mdc-dialog-max-width: 390px;
      }
      ewt-icon-button {
        position: absolute;
        right: 4px;
        top: 10px;
      }
      .table-row {
        display: flex;
      }
      .table-row.last {
        margin-bottom: 16px;
      }
      .table-row svg {
        width: 20px;
        margin-right: 8px;
      }
      ewt-textfield,
      ewt-select {
        display: block;
        margin-top: 16px;
      }
      .dashboard-buttons {
        margin: 0 0 -16px -8px;
      }
      .dashboard-buttons div {
        display: block;
        margin: 4px 0;
      }
      a.has-button {
        text-decoration: none;
      }
      .error {
        color: var(--improv-danger-color);
      }
      .danger {
        --mdc-theme-primary: var(--improv-danger-color);
        --mdc-theme-secondary: var(--improv-danger-color);
      }
      button.link {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        text-align: left;
        text-decoration: underline;
        cursor: pointer;
      }
      :host([state="LOGS"]) ewt-dialog {
        --mdc-dialog-max-width: 90vw;
      }
      ewt-console {
        width: calc(80vw - 48px);
        height: 80vh;
      }
      :host([state="PARTITIONS"]) ewt-dialog {
        --mdc-dialog-max-width: 800px;
      }
      :host([state="LITTLEFS"]) ewt-dialog {
        --mdc-dialog-max-width: 95vw;
        --mdc-dialog-max-height: 90vh;
      }
      :host([state="LITTLEFS"]) .mdc-dialog__content {
        padding: 10px 20px;
      }
      :host([state="LITTLEFS"]) ewt-littlefs-manager {
        display: block;
        max-width: 100%;
      }
      .partition-list {
        max-height: 60vh;
        overflow-y: auto;
      }
      .partition-table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
      }
      .partition-table th,
      .partition-table td {
        padding: 8px 12px;
        text-align: left;
        border: 1px solid #ccc;
      }
      .partition-table th {
        font-weight: 600;
        background-color: #f0f0f0;
        position: sticky;
        top: 0;
      }
      .partition-table tbody tr:hover {
        background-color: rgba(3, 169, 244, 0.1);
      }
    `,
  ];
}

customElements.define("ewt-install-dialog", EwtInstallDialog);

declare global {
  interface HTMLElementTagNameMap {
    "ewt-install-dialog": EwtInstallDialog;
  }
}
