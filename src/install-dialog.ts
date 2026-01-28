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
  public esploader!: any; // ESPLoader instance from tasmota-webserial-esptool v9.2.13

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
    | "LITTLEFS"
    | "REQUEST_PORT_SELECTION" = "DASHBOARD";

  @state() private _installErase = false;
  @state() private _installConfirmed = false;
  @state() private _installState?: FlashState;

  @state() private _provisionForce = false;
  private _wasProvisioned = false;

  @state() private _error?: string;

  @state() private _busy = true; // Start as busy until initialization completes

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

  // Track if Improv is supported (separate from active client)
  private _improvSupported = false;

  // Track if device is using USB-JTAG or USB-OTG (not external serial chip)
  @state() private _isUsbJtagOrOtgDevice = false;

  // Track if this dialog was created after port reconnection (skip mode switching)
  private _skipModeSwitch = false;

  // Ensure stub is initialized (called before any operation that needs it)
  private async _ensureStub(): Promise<any> {
    if (this._espStub && this._espStub.IS_STUB) {
      this.logger.log(
        `Existing stub: IS_STUB=${this._espStub.IS_STUB}, chipFamily=${getChipFamilyName(this._espStub)}`,
      );

      // Ensure baudrate is set even if stub already exists
      if (this.baudRate && this.baudRate > 115200) {
        const currentBaud = this._espStub.currentBaudRate || 115200;
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

      // Try twice before giving up
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          if (attempt > 1) {
            this.logger.log(`Retry attempt ${attempt}/2...`);
            await sleep(500); // Wait before retry
          }
          await this.esploader.initialize();
          this.logger.log(`Found ${getChipFamilyName(this.esploader)}`);
          break; // Success!
        } catch (err: any) {
          this.logger.error(
            `Connection failed to stub (attempt ${attempt}/2): ${err.message}`,
          );
          if (attempt === 2) {
            // Both attempts failed - show error to user
            this._state = "ERROR";
            this._error = `Failed to connect to ESP after 2 attempts: ${err.message}`;
            throw err;
          }
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
        // setBaudrate now supports CDC/JTAG on Android (WebUSB) in >=v9.2.13
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

  // Helper to check if device is using USB-JTAG or USB-OTG (not external serial chip)
  private async _isUsbJtagOrOtg(): Promise<boolean> {
    // Use detectUsbConnectionType from tasmota-webserial-esptool v9.2.13+
    const isUsbJtag = await this.esploader.detectUsbConnectionType();
    this.logger.log(`USB-JTAG/OTG detection: ${isUsbJtag ? "YES" : "NO"}`);
    return isUsbJtag;
  }

  // Helper to release reader/writer locks (used by multiple methods)
  private async _releaseReaderWriter() {
    if (this.esploader._reader) {
      const reader = this.esploader._reader;
      try {
        await reader.cancel();
      } catch (err) {
        this.logger.log("Reader cancel failed:", err);
      } finally {
        try {
          reader.releaseLock();
          this.logger.log("Reader released");
        } catch (err) {
          this.logger.log("Reader releaseLock failed:", err);
        }
        this.esploader._reader = undefined;
      }
    }
    if (this.esploader._writer) {
      const writer = this.esploader._writer;
      try {
        writer.releaseLock();
        this.logger.log("Writer released");
      } catch (err) {
        this.logger.log("Writer releaseLock failed:", err);
      } finally {
        this.esploader._writer = undefined;
      }
    }
  }

  // Helper to reset baudrate to 115200 for console
  // CRITICAL: The ESP stub might be at higher baudrate (e.g., 460800) for flashing
  // But firmware console always runs at 115200
  private async _resetBaudrateForConsole() {
    if (this._espStub && this._espStub.currentBaudRate !== 115200) {
      this.logger.log(
        `Resetting baudrate from ${this._espStub.currentBaudRate} to 115200 for console...`,
      );
      try {
        // Use setBaudrate from tasmota-webserial-esptool >=v9.2.13
        // This now supports CDC/JTAG baudrate changes on Android (WebUSB)
        await this._espStub.setBaudrate(115200);
        this.logger.log("Baudrate set to 115200 for console");
      } catch (baudErr: any) {
        this.logger.log(`Failed to set baudrate to 115200: ${baudErr.message}`);
      }
    }
  }

  // Helper to prepare ESP for flash operations after Improv check
  // Resets to bootloader mode and loads stub
  private async _prepareForFlashOperations() {
    // Reset ESP to BOOTLOADER mode for flash operations
    await this._resetToBootloaderAndReleaseLocks();

    // Wait for ESP to enter bootloader mode
    await sleep(100);

    // Reset ESP state (chipFamily preserved from reset if successful)
    this._espStub = undefined;
    this.esploader.IS_STUB = false;

    // Ensure stub is initialized
    await this._ensureStub();

    this.logger.log("ESP reset, stub loaded - ready for flash operations");
  }

  // Helper to handle post-flash cleanup and Improv re-initialization
  // Called when flash operation completes successfully
  private async _handleFlashComplete() {
    // Check if this is USB-JTAG or USB-OTG device (not external serial chip)
    const isUsbJtagOrOtg = await this._isUsbJtagOrOtg();
    this._isUsbJtagOrOtgDevice = isUsbJtagOrOtg; // Update state for UI

    if (isUsbJtagOrOtg) {
      // For USB-JTAG/OTG devices: Reset to firmware mode (port will change!)
      // Then user must select new port (User Gesture) and we test Improv
      this.logger.log("USB-JTAG/OTG device - resetting to firmware mode");

      try {
        // Use new resetToFirmware() method from >=v9.2.13
        // This will close the port and device will reboot to firmware
        await this.esploader.resetToFirmware();
        this.logger.log("Device reset to firmware mode - port closed");
      } catch (err: any) {
        this.logger.debug(`Reset to firmware error (expected): ${err.message}`);
      }

      // Release locks and reset ESP state
      await sleep(100);
      await this._releaseReaderWriter();

      this._espStub = undefined;
      this.esploader.IS_STUB = false;
      this.esploader.chipFamily = null;
      this._improvChecked = false; // Will check after user reconnects
      this._client = null; // Set to null (not undefined) to avoid "Wrapping up" UI state
      this._improvSupported = false; // Unknown until after reconnect
      this.esploader._reader = undefined;

      this.logger.log("Flash complete - waiting for user to select new port");
      this.requestUpdate();
      return;
    }

    // Normal flow for non-USB-JTAG/OTG devices
    // Release locks and reset ESP state for Improv test
    await sleep(100);

    await this._releaseReaderWriter();

    // Reset ESP state for Improv test
    this._espStub = undefined;
    this.esploader.IS_STUB = false;
    this.esploader.chipFamily = null;
    this._improvChecked = false;
    this.esploader._reader = undefined;
    this.logger.log("ESP state reset for Improv test");

    // Reconnect with 115200 baud and reset ESP to boot into new firmware
    try {
      // CRITICAL: After flashing at higher baudrate, reconnect at 115200
      // reconnectToBootloader() closes port and reopens at 115200 baud
      // It now automatically detects WebUSB vs WebSerial and uses appropriate methods
      this.logger.log("Reconnecting at 115200 baud for firmware reset...");
      try {
        await this.esploader.reconnectToBootloader();
        this.logger.log("Port reconnected at 115200 baud");
      } catch (reconnectErr: any) {
        this.logger.log(`Reconnect failed: ${reconnectErr.message}`);
      }

      // Reset device and release locks to ensure clean state for new firmware
      // hardReset() now uses chip-specific reset methods (S2/S3/C3 with USB-JTAG use watchdog)
      this.logger.log("Performing hardware reset to start new firmware...");
      await this._resetDeviceAndReleaseLocks();
    } catch (resetErr: any) {
      this.logger.log(`Hard reset failed: ${resetErr.message}`);
    }

    // Test Improv with new firmware
    await this._initialize(true);

    this.requestUpdate();
  }

  // Reset device and release locks - used when returning to dashboard or recovering from errors
  // Reset device to FIRMWARE mode (normal execution)
  // NOTE: This function should ONLY be called for external serial chips!
  // For USB-JTAG/OTG devices, hardReset(false) would trigger watchdog reset and change the port!
  private async _resetDeviceAndReleaseLocks() {
    // Release esploader reader/writer if locked
    await this._releaseReaderWriter();

    // Hardware reset to FIRMWARE mode (bootloader=false)
    // For external serial chips: Uses DTR/RTS signals, port stays open
    // For USB-JTAG/OTG: Would use watchdog reset and close port (NOT CALLED for these devices!)
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

  // Reset device to BOOTLOADER mode (for flashing)
  // Uses ESPLoader's reconnectToBootloader() to properly close/reopen port
  private async _resetToBootloaderAndReleaseLocks() {
    // Use ESPLoader's reconnectToBootloader() - it handles:
    // - Closing port completely (releases all locks)
    // - Reopening port at 115200 baud
    // - Restarting readLoop()
    // - Reset strategies to enter bootloader (connectWithResetStrategies)
    // - Chip detection
    // - WebUSB vs WebSerial detection and appropriate reset methods
    try {
      this.logger.log("Resetting ESP to bootloader mode...");
      await this.esploader.reconnectToBootloader();
      this.logger.log(
        `ESP in bootloader mode: ${getChipFamilyName(this.esploader)}`,
      );
    } catch (err: any) {
      this.logger.error(`Failed to reset ESP to bootloader: ${err.message}`);
      throw err;
    }

    // Reset stub state (chipFamily is preserved by reconnectToBootloader)
    this._espStub = undefined;
    this.esploader.IS_STUB = false;
  }

  protected render() {
    if (!this.esploader) {
      return html``;
    }
    
    // Safety check: Don't render DASHBOARD state until Improv check is complete
    if (this._state === "DASHBOARD" && !this._improvChecked) {
      return html`
        <ewt-dialog open .heading=${"Connecting"} scrimClickAction>
          ${this._renderProgress("Initializing")}
        </ewt-dialog>
      `;
    }
    
    let heading: string | undefined;
    let content: TemplateResult;
    let hideActions = false;
    let allowClosing = false;

    // During installation phase we temporarily remove the client
    if (
      this._client === undefined &&
      !this._improvChecked && // Only show "Connecting" if we haven't checked yet
      this._state !== "INSTALL" &&
      this._state !== "LOGS" &&
      this._state !== "PARTITIONS" &&
      this._state !== "LITTLEFS" &&
      this._state !== "REQUEST_PORT_SELECTION" &&
      this._state !== "DASHBOARD" // Don't show "Connecting" when in DASHBOARD state
    ) {
      if (this._error) {
        [heading, content, hideActions] = this._renderError(this._error);
      } else {
        content = this._renderProgress("Connecting");
        hideActions = true;
      }
    } else if (this._state === "INSTALL") {
      [heading, content, hideActions, allowClosing] = this._renderInstall();
    } else if (this._state === "REQUEST_PORT_SELECTION") {
      [heading, content, hideActions] = this._renderRequestPortSelection();
    } else if (this._state === "ASK_ERASE") {
      [heading, content] = this._renderAskErase();
    } else if (this._state === "ERROR") {
      [heading, content, hideActions] = this._renderError(this._error!);
    } else if (this._state === "DASHBOARD") {
      this.logger.log(`Rendering DASHBOARD: _improvSupported=${this._improvSupported}, _info=${this._info}`);
      try {
        [heading, content, hideActions, allowClosing] =
          this._improvSupported && this._info
            ? this._renderDashboard()
            : this._renderDashboardNoImprov();
        this.logger.log(`Dashboard rendered successfully`);
      } catch (err: any) {
        this.logger.error(`Error rendering dashboard: ${err.message}`, err);
        [heading, content, hideActions] = this._renderError(`Dashboard render error: ${err.message}`);
      }
    } else if (this._state === "PROVISION") {
      [heading, content, hideActions] = this._renderProvision();
    } else if (this._state === "LOGS") {
      [heading, content, hideActions] = this._renderLogs();
    } else if (this._state === "PARTITIONS") {
      [heading, content, hideActions] = this._renderPartitions();
    } else if (this._state === "LITTLEFS") {
      [heading, content, hideActions, allowClosing] = this._renderLittleFS();
    } else {
      // Fallback for unknown state
      this.logger.error(`Unknown state: ${this._state}`);
      [heading, content, hideActions] = this._renderError(`Unknown state: ${this._state}`);
    }

    this.logger.log(`Render complete: heading=${heading}, content=${content ? 'defined' : 'undefined'}, hideActions=${hideActions}, allowClosing=${allowClosing}`);

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

  _renderRequestPortSelection(): [string, TemplateResult, boolean] {
    const heading = "Select Port";
    const content = html`
      <ewt-page-message
        .label=${"Device has been reset to firmware mode. The USB port has changed. Please click the button below to select the new port."}
      ></ewt-page-message>
      <ewt-button
        slot="primaryAction"
        label="Select Port"
        ?disabled=${this._busy}
        @click=${this._handleSelectNewPort}
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
                  ?disabled=${this._busy}
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
        ${!this._client || this._client.nextUrl === undefined
          ? ""
          : html`
              <div>
                <a
                  href=${this._client.nextUrl}
                  class="has-button"
                  target="_blank"
                >
                  <ewt-button label="Visit Device"></ewt-button>
                </a>
              </div>
            `}
        ${!this._client ||
        !this._manifest.home_assistant_domain ||
        this._client.state !== ImprovSerialCurrentState.PROVISIONED
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
        ${this._client
          ? html`
              <div>
                <ewt-button
                  ?disabled=${this._busy}
                  .label=${this._client.state === ImprovSerialCurrentState.READY
                    ? "Connect to Wi-Fi"
                    : "Change Wi-Fi"}
                  @click=${async () => {
                    this._busy = true;

                    // Check if this is USB-JTAG/OTG device
                    const isUsbJtagOrOtg = await this._isUsbJtagOrOtg();

                    if (isUsbJtagOrOtg) {
                      // For USB-JTAG/OTG: Device is already in firmware mode
                      // Just close Improv client and re-initialize for WiFi setup
                      if (this._client) {
                        try {
                          await this._closeClientWithoutEvents(this._client);
                        } catch (e) {
                          this.logger.log("Failed to close Improv client:", e);
                        }
                        this._client = undefined;
                      }

                      // Re-create Improv client (firmware is already running at 115200 baud)
                      this.logger.log(
                        "Re-initializing Improv Serial for Wi-Fi setup (USB-JTAG/OTG)",
                      );
                      const client = new ImprovSerial(this._port, this.logger);
                      client.addEventListener("state-changed", () => {
                        this.requestUpdate();
                      });
                      client.addEventListener("error-changed", () =>
                        this.requestUpdate(),
                      );
                      try {
                        this._info = await client.initialize(1000);
                        this._client = client;
                        client.addEventListener(
                          "disconnect",
                          this._handleDisconnect,
                        );
                        this.logger.log(
                          "Improv client ready for Wi-Fi provisioning",
                        );
                      } catch (improvErr: any) {
                        try {
                          await this._closeClientWithoutEvents(client);
                        } catch (closeErr) {
                          this.logger.log(
                            "Failed to close Improv client after init error:",
                            closeErr,
                          );
                        }
                        this.logger.log(
                          `Improv initialization failed: ${improvErr.message}`,
                        );
                        this._error = `Improv initialization failed: ${improvErr.message}`;
                        this._state = "ERROR";
                        this._busy = false;
                        return;
                      }

                      this._state = "PROVISION";
                      this._provisionForce = true;
                      this._busy = false;
                      return;
                    }

                    // For external serial chips: Reset to firmware mode if needed
                    // Close Improv client if active
                    if (this._client) {
                      try {
                        await this._closeClientWithoutEvents(this._client);
                      } catch (e) {
                        this.logger.log("Failed to close Improv client:", e);
                      }
                      this._client = undefined;
                    }

                    // Ensure ESP is in firmware mode at 115200 baud
                    await this._resetBaudrateForConsole();
                    await this._releaseReaderWriter();

                    try {
                      await this._resetDeviceAndReleaseLocks();
                      this.logger.log(
                        "ESP reset to firmware mode for Wi-Fi setup",
                      );
                      await sleep(100);
                    } catch (resetErr: any) {
                      this.logger.log(`Reset failed: ${resetErr.message}`);
                    }

                    // Re-create Improv client (firmware is now running at 115200 baud)
                    this.logger.log(
                      "Re-initializing Improv Serial for Wi-Fi setup",
                    );
                    const client = new ImprovSerial(this._port, this.logger);
                    client.addEventListener("state-changed", () => {
                      this.requestUpdate();
                    });
                    client.addEventListener("error-changed", () =>
                      this.requestUpdate(),
                    );
                    try {
                      this._info = await client.initialize(1000);
                      this._client = client;
                      client.addEventListener(
                        "disconnect",
                        this._handleDisconnect,
                      );
                      this.logger.log(
                        "Improv client ready for Wi-Fi provisioning",
                      );
                    } catch (improvErr: any) {
                      try {
                        await this._closeClientWithoutEvents(client);
                      } catch (closeErr) {
                        this.logger.log(
                          "Failed to close Improv client after init error:",
                          closeErr,
                        );
                      }
                      this.logger.log(
                        `Improv initialization failed: ${improvErr.message}`,
                      );
                      this._error = `Improv initialization failed: ${improvErr.message}`;
                      this._state = "ERROR";
                      this._busy = false;
                      return;
                    }

                    this._state = "PROVISION";
                    this._provisionForce = true;
                    this._busy = false;
                  }}
                ></ewt-button>
              </div>
            `
          : ""}
        ${this._isUsbJtagOrOtgDevice
          ? html`
              <div>
                <ewt-button
                  ?disabled=${this._busy}
                  label="Open Console"
                  @click=${async () => {
                    this._busy = true;
                    
                    // Close Improv client if active
                    if (this._client) {
                      try {
                        await this._closeClientWithoutEvents(this._client);
                      } catch (e) {
                        this.logger.log("Failed to close Improv client:", e);
                      }
                    }
                    
                    // For USB-JTAG/OTG: Device is already in firmware mode at 115200 baud
                    // Just open console directly
                    this.logger.log("Opening console for USB-JTAG/OTG device (already in firmware mode)");
                    
                    // Release any locks
                    await this._releaseReaderWriter();
                    await sleep(100);
                    
                    this._state = "LOGS";
                    this._busy = false;
                  }}
                ></ewt-button>
              </div>
            `
          : ""}
        ${!this._isUsbJtagOrOtgDevice
          ? html`
              <div>
                <ewt-button
                  ?disabled=${this._busy}
                  label="Logs & Console"
                  @click=${async () => {
                    const client = this._client;
                    if (client) {
                      await this._closeClientWithoutEvents(client);
                      await sleep(100);
                    }
                    // Keep client object for dashboard rendering; connection already closed above.

                    await this._resetBaudrateForConsole();
                    await this._releaseReaderWriter();
                    await this._resetDeviceAndReleaseLocks();

                    this._state = "LOGS";
                  }}
                ></ewt-button>
              </div>
            `
          : ""}
        <div>
          <ewt-button
            ?disabled=${this._busy}
            label="Manage Filesystem"
            @click=${async () => {
              // Close Improv client if active (it locks the reader)
              if (this._client) {
                try {
                  await this._closeClientWithoutEvents(this._client);
                } catch (e) {
                  this.logger.log("Failed to close Improv client:", e);
                }
                // Keep client object for dashboard rendering; connection already closed above.
              }

              // Keep stub and reader/writer - they will be reused
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
                  ?disabled=${this._busy}
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

    this.logger.log(`_renderDashboardNoImprov: _manifest=${this._manifest ? 'defined' : 'undefined'}`);

    content = html`
      <div class="dashboard-buttons">
        <div>
          <ewt-button
            ?disabled=${this._busy}
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

        ${!this._isUsbJtagOrOtgDevice
          ? html`
              <div>
                <ewt-button
                  label="Logs & Console"
                  ?disabled=${this._busy}
                  @click=${async () => {
                    // Keep client object for dashboard running; connection already closed above.

                    await this._resetBaudrateForConsole();
                    await this._releaseReaderWriter();
                    await this._resetDeviceAndReleaseLocks();

                    this._state = "LOGS";
                  }}
                ></ewt-button>
              </div>
            `
          : ""}

        ${this._isUsbJtagOrOtgDevice
          ? html`
              <div>
                <ewt-button
                  label="Open Console"
                  ?disabled=${this._busy}
                  @click=${async () => {
                    this._busy = true;
                    
                    // Close Improv client if active
                    if (this._client) {
                      try {
                        await this._closeClientWithoutEvents(this._client);
                      } catch (e) {
                        this.logger.log("Failed to close Improv client:", e);
                      }
                    }
                    
                    // For USB-JTAG/OTG: Device is already in firmware mode at 115200 baud
                    // Just open console directly
                    this.logger.log("Opening console for USB-JTAG/OTG device (already in firmware mode)");
                    
                    // Release any locks
                    await this._releaseReaderWriter();
                    await sleep(100);
                    
                    this._state = "LOGS";
                    this._busy = false;
                  }}
                ></ewt-button>
              </div>
            `
          : ""}

        <div>
          <ewt-button
            label="Manage Filesystem"
            ?disabled=${this._busy}
            @click=${async () => {
              // Close Improv client if active (it locks the reader)
              if (this._client) {
                try {
                  await this._closeClientWithoutEvents(this._client);
                } catch (e) {
                  this.logger.log("Failed to close Improv client:", e);
                }
                // Keep client object for dashboard rendering; connection already closed above.
              }

              // Keep stub and reader/writer - they will be reused
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
                            // Visit Device opens external page - firmware must keep running
                            // Just close the dialog, don't reset to bootloader
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
                            // Add to HA opens external page - firmware must keep running
                            // Just close the dialog, don't reset to bootloader
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
                    @click=${async () => {
                      // After WiFi provisioning: Return to bootloader mode for flash operations
                      // EXCEPTION: USB-JTAG/OTG devices stay in firmware mode
                      // Close Improv client first
                      if (this._client) {
                        try {
                          await this._closeClientWithoutEvents(this._client);
                          this.logger.log(
                            "Improv client closed after provisioning",
                          );
                        } catch (e) {
                          this.logger.log("Failed to close Improv client:", e);
                        }
                      }

                      // Prepare for flash operations (reset to bootloader, load stub)
                      if (!this._isUsbJtagOrOtgDevice) {
                        try {
                          await this._prepareForFlashOperations();
                          this.logger.log(
                            "Device ready for flash operations after provisioning",
                          );
                        } catch (err: any) {
                          this.logger.log(
                            `Failed to prepare for flash: ${err.message}`,
                          );
                        }
                      } else {
                        this.logger.log(
                          "USB-JTAG/OTG: keep firmware mode after provisioning",
                        );
                      }

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
                @click=${async () => {
                  // After WiFi provisioning: Return to bootloader mode for flash operations
                  // EXCEPTION: USB-JTAG/OTG devices stay in firmware mode
                  // Close Improv client first
                  if (this._client) {
                    try {
                      await this._closeClientWithoutEvents(this._client);
                      this.logger.log(
                        "Improv client closed after provisioning",
                      );
                    } catch (e) {
                      this.logger.log("Failed to close Improv client:", e);
                    }
                  }

                  // Prepare for flash operations (reset to bootloader, load stub)
                  if (!this._isUsbJtagOrOtgDevice) {
                    try {
                      await this._prepareForFlashOperations();
                      this.logger.log(
                        "Device ready for flash operations after provisioning",
                      );
                    } catch (err: any) {
                      this.logger.log(
                        `Failed to prepare for flash: ${err.message}`,
                      );
                    }
                  } else {
                    this.logger.log(
                      "USB-JTAG/OTG: keep firmware mode after provisioning",
                    );
                  }

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
          @click=${async () => {
            // When going back from provision: Return to bootloader mode
            // EXCEPTION: USB-JTAG/OTG devices stay in firmware mode
            // Close Improv client first
            if (this._client) {
              try {
                await this._closeClientWithoutEvents(this._client);
                this.logger.log("Improv client closed");
              } catch (e) {
                this.logger.log("Failed to close Improv client:", e);
              }
            }

            // Prepare for flash operations (reset to bootloader, load stub)
            if (!this._isUsbJtagOrOtgDevice) {
              try {
                await this._prepareForFlashOperations();
                this.logger.log("Device ready for flash operations");
              } catch (err: any) {
                this.logger.log(`Failed to prepare for flash: ${err.message}`);
              }
            } else {
              this.logger.log(
                "USB-JTAG/OTG: keep firmware mode when going back",
              );
            }

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
      // EXCEPTION: USB-JTAG/OTG devices skip this (they show reconnect message instead)
      (this._installState.state === FlashStateType.FINISHED &&
        this._client === undefined &&
        !this._isUsbJtagOrOtgDevice)
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
          This will take a minute.<br />
          Keep this page visible until installation is complete.
        `,
        percentage,
      );
      hideActions = true;
    } else if (this._installState.state === FlashStateType.FINISHED) {
      heading = undefined;
      const supportsImprov = this._client !== null;

      // Check if this is USB-JTAG or USB-OTG device (use cached state)
      if (this._isUsbJtagOrOtgDevice) {
        // For USB-JTAG/OTG devices: Show success with instructions to reconnect
        // Device is now in firmware mode, user must reconnect to test Improv
        content = html`
          <ewt-page-message
            .icon=${OK_ICON}
            label="Installation complete!"
          ></ewt-page-message>
          <p
            style="text-align: center; margin: 16px 0; color: var(--mdc-theme-on-surface, #000);"
          >
            The device is now in firmware mode.<br />
            The USB port has changed.<br />
            <strong>Please close this dialog and reconnect</strong> to test
            device features.
          </p>
          <ewt-button
            slot="primaryAction"
            label="Close"
            dialogAction="close"
          ></ewt-button>
        `;
        hideActions = false;
      } else {
        // Normal flow with Next button
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
                supportsImprov && this._installErase
                  ? "PROVISION"
                  : "DASHBOARD";
            }}
          ></ewt-button>
        `;
      }
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
            this._improvChecked = false; // Force Improv re-test
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
      <ewt-console
        .port=${this._port}
        .logger=${this.logger}
        .onReset=${async () => await this._resetDeviceAndReleaseLocks()}
      ></ewt-console>
      <ewt-button
        slot="primaryAction"
        label="Back"
        @click=${async () => {
          await this.shadowRoot!.querySelector("ewt-console")!.disconnect();

          // After console: ESP is in firmware mode
          // Need to reset to bootloader and reload stub for flash/filesystem operations
          this.logger.log("Preparing ESP for flash operations...");
          try {
            // Reset to BOOTLOADER mode and load stub
            await this._resetToBootloaderAndReleaseLocks();

            // Wait for bootloader to start
            await sleep(100);

            // Load stub and restore baudrate
            await this._ensureStub();

            this.logger.log("ESP ready for flash operations");
          } catch (err: any) {
            this.logger.error(`Failed to prepare ESP: ${err.message}`);
          }

          this._state = "DASHBOARD";
          // Don't reset _improvChecked - console only reads, doesn't change firmware
          await this._initialize();
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
            // Don't reset _improvChecked - status is still valid after console operations
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
            // DON'T reset device or release locks - keep stub for Console/Install
            this._state = "DASHBOARD";
            // Don't reset _improvChecked - status is still valid after filesystem operations
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

    // CRITICAL: Set logger on esploader so we can see logs from enterConsoleMode() etc.
    this.esploader.logger = this.logger;

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

    // Set busy flag during initialization
    this._busy = true;
    this.requestUpdate(); // Force UI update to disable buttons immediately

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
        this._busy = false;
        return;
      }
    }

    // Skip Improv if requested (e.g., when returning from console or filesystem manager)
    if (skipImprov) {
      this.logger.log("Skipping Improv test (not needed for this operation)");
      this._client = null;
      this._improvChecked = true;
      this._busy = false;
      return;
    }

    if (this._manifest.new_install_improv_wait_time === 0) {
      this._client = null;
      this._improvSupported = false;
      this._busy = false;
      return;
    }

    // Skip Improv if we already checked (avoid repeated attempts)
    if (this._improvChecked) {
      this.logger.log(
        `Improv already checked - ${this._improvSupported ? "supported" : "not supported"}, skipping re-test`,
      );
      // Ensure _client state is valid for UI rendering
      if (!this._improvSupported) {
        // Not supported - ensure it's explicitly null for UI
        this._client = null;
      }
      // If supported: keep _client as-is (could be active client or undefined if closed)
      // The UI will check _improvSupported and _info instead of just _client
      this._busy = false;
      this.requestUpdate(); // Force UI update
      return;
    }

    // Skip Improv if we already have a working client
    if (this._client) {
      this.logger.log("Improv client already active, skipping initialization");
      this._improvSupported = true; // If we have a client, Improv is supported
      this._busy = false;
      return;
    }

    // CRITICAL: Check if device is using USB-JTAG or USB-OTG (not external serial chip)
    // These devices CAN support Improv, but require port reconnection after mode changes
    const isUsbJtagOrOtg = await this._isUsbJtagOrOtg();
    this._isUsbJtagOrOtgDevice = isUsbJtagOrOtg; // Update state for UI

    // For ALL devices: We need to be in FIRMWARE mode for Improv test
    // But the method to get there is different for USB-JTAG/OTG vs external serial chips
    if (!justInstalled && !this._skipModeSwitch) {
      // Check if we're in bootloader mode by checking if chipFamily is set
      // If chipFamily is set, we connected to bootloader (esptoolConnect does this)
      const inBootloaderMode = this.esploader.chipFamily !== null;

      if (isUsbJtagOrOtg) {
        // USB-JTAG/OTG devices: Use enterConsoleMode() to switch to firmware
        // This will CLOSE the port and require user to select new port
        if (inBootloaderMode) {
          this.logger.log(
            "USB-JTAG/OTG device in bootloader mode - switching to firmware mode for Improv",
          );

          try {
            // CRITICAL: Ensure chipFamily is set before calling enterConsoleMode()
            // rtcWdtResetChipSpecific() needs chipFamily to work
            if (!this.esploader.chipFamily) {
              this.logger.log("Detecting chip type for WDT reset...");
              await this.esploader.initialize();
              this.logger.log(`Chip detected: ${this.esploader.chipFamily}`);
            }

            // CRITICAL: Ensure we have a stub (like esp32tool does)
            // esp32tool: espStub = await esploader.runStub()
            // Then it calls espStub.setBaudrate() and espStub.enterConsoleMode()
            let loaderToUse = this.esploader;
            if (!this._espStub) {
              this.logger.log("Creating stub for console mode...");
              this._espStub = await this.esploader.runStub();
              this.logger.log(`Stub created: IS_STUB=${this._espStub.IS_STUB}`);
            }
            loaderToUse = this._espStub;

            // CRITICAL: Save the PARENT loader before console mode (like esp32tool does)
            // esp32tool: const loaderToSave = espStub._parent || espStub;
            //            espLoaderBeforeConsole = loaderToSave;
            const loaderToSave = this._espStub._parent || this._espStub;
            this.logger.log(`Saving parent loader for later restore: ${loaderToSave === this._espStub._parent ? 'parent' : 'stub'}`);
            // We'll need this later to restore the connection
            (this as any)._savedLoaderBeforeConsole = loaderToSave;

            // CRITICAL: Set baudrate to 115200 BEFORE enterConsoleMode()
            // This is what esp32tool does: await espStub.setBaudrate(115200);
            try {
              await loaderToUse.setBaudrate(115200);
              this.logger.log("Baudrate set to 115200 before WDT reset");
            } catch (baudErr: any) {
              this.logger.log(`Failed to set baudrate to 115200: ${baudErr.message}`);
            }

            // Use enterConsoleMode() to switch to firmware mode
            const portClosed = await loaderToUse.enterConsoleMode();

            this.logger.log(`enterConsoleMode() returned: ${portClosed}`);
            this.logger.log(`isUsbJtagOrOtg value: ${this.esploader.isUsbJtagOrOtg}`);
            this.logger.log(`chipFamily: ${this.esploader.chipFamily}`);

            if (portClosed) {
              // Port was closed - device is now in firmware mode but port changed
              // User must manually select new port for Improv test
              this.logger.log(
                "Device switched to firmware mode - port closed, need user to select new port",
              );

              this._improvChecked = false; // Will check after user reconnects
              this._client = undefined;
              this._improvSupported = false; // Unknown until after reconnect
              this._busy = false;

              // Show UI state that requires user to select new port
              // This will render a button that user must click (User Gesture)
              this._state = "REQUEST_PORT_SELECTION";
              this._error = ""; // Clear any previous errors
              return;
            } else {
              // Port didn't close - device might already be in firmware mode
              this.logger.log(
                "Port didn't close - device might already be in firmware mode",
              );
            }
          } catch (err: any) {
            this.logger.error(`Failed to enter firmware mode: ${err.message}`);
            // Show error to user
            this._state = "ERROR";
            this._error = `Failed to switch to firmware mode: ${err.message}`;
            this._busy = false;
            return;
          }
        } else {
          this.logger.log(
            "USB-JTAG/OTG device already in firmware mode, ready for Improv test",
          );
        }
      } else {
        // External serial chips: Use hardReset(false) to switch to firmware
        // Port stays OPEN, just device resets
        if (inBootloaderMode) {
          this.logger.log(
            "External serial chip in bootloader mode - resetting to firmware mode for Improv test",
          );

          try {
            // Release any locks first
            await this._releaseReaderWriter();

            // Reset to firmware mode using hardReset
            await this.esploader.hardReset(false); // false = firmware mode

            this.logger.log("Device reset to firmware mode");
            await sleep(500); // Wait for firmware to start
          } catch (e) {
            this.logger.log(
              `Reset to firmware failed, continuing anyway: ${e}`,
            );
          }
        } else {
          this.logger.log(
            "External serial chip already in firmware mode, ready for Improv test",
          );
        }
      }
    } else if (this._skipModeSwitch) {
      this.logger.log(
        "Skipping mode switch - device already in firmware mode after port reconnection",
      );
      
      // Wait for device to fully boot after WDT reset (500ms like esp32tool)
      this.logger.log("Waiting 500ms for device to fully boot...");
      await sleep(500);
      this.logger.log("Boot delay complete, ready for Improv test");
      
      // CRITICAL: For USB-JTAG/OTG after WDT reset, we need to ensure the port is clean
      // Release and recreate reader/writer to flush any stale data
      this.logger.log("Flushing port buffers after reconnect...");
      try {
        await this._releaseReaderWriter();
        await sleep(100);
        this.logger.log("Port buffers flushed");
      } catch (err: any) {
        this.logger.log(`Failed to flush buffers: ${err.message}`);
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
      this._improvSupported = true; // Mark Improv as supported
      client.addEventListener("disconnect", this._handleDisconnect);

      // After successful Improv: prepare ESP for potential flash operations
      // Close Improv client and reopen port to reset ESP into bootloader mode
      // EXCEPTION: USB-JTAG/OTG devices stay in firmware mode (avoid port change)
      if (!justInstalled && !this._isUsbJtagOrOtgDevice) {
        try {
          // CRITICAL: Close Improv client first to release reader lock
          await this._closeClientWithoutEvents(client);
          this.logger.log("Improv client closed");

          await this._prepareForFlashOperations();
        } catch (err: any) {
          if (
            err.message &&
            (err.message.includes("Failed to connect") ||
              err.message === "Port selection cancelled")
          ) {
            // Connection error - show error to user
            this._state = "ERROR";
            this._error = err.message;
            this._busy = false;
            return;
          }
          this.logger.log(`ESP reset failed: ${err.message}`);
        }
      } else if (this._isUsbJtagOrOtgDevice) {
        this.logger.log("USB-JTAG/OTG: staying in firmware mode after Improv");
      }

      // Clear busy flag when Improv successful and stub loaded
      this._busy = false;
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
        this._improvSupported = false; // Mark Improv as not supported
        this.logger.error("Improv initialization failed.", err);

        // After failed Improv: prepare ESP for flash operations anyway
        // Reset ESP into bootloader mode and load stub
        if (!justInstalled) {
          try {
            await this._prepareForFlashOperations();
          } catch (err: any) {
            if (
              err.message &&
              (err.message.includes("Failed to connect") ||
                err.message === "Port selection cancelled")
            ) {
              // Connection error - show error to user
              this._state = "ERROR";
              this._error = err.message;
              this._busy = false;
              return;
            }
            this.logger.log(`ESP reset failed: ${err.message}`);
          }
        }
      }

      // Clear busy flag when Improv failed but stub loaded
      this._busy = false;
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

    // If device is in firmware mode (e.g., after "Visit Device" or WiFi setup),
    // we need to reset to bootloader mode first
    // Check if we have Improv info (indicates firmware mode)
    if (this._info && this._improvSupported) {
      this.logger.log(
        "Device in firmware mode - preparing for flash operations",
      );
      try {
        await this._prepareForFlashOperations();
      } catch (err: any) {
        this.logger.log(`Failed to prepare for flash: ${err.message}`);
        // Continue anyway - _ensureStub will handle it
      }
    }

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
            void this._handleFlashComplete().catch((err: any) => {
              this.logger.error(
                `Post-flash cleanup failed: ${err?.message || err}`,
              );
              this._state = "ERROR";
              this._error = `Post-flash cleanup failed: ${err?.message || err}`;
            });
          }
        },
        loaderToUse,
        this.logger,
        this.manifestPath,
        this._installErase,
        new Uint8Array(0),
        this.baudRate,
      ).catch((flashErr: any) => {
        this.logger.error(`Flash error: ${flashErr.message || flashErr}`);
        this._state = "ERROR";
        this._error = `Flash failed: ${flashErr.message || flashErr}`;
        this._busy = false;
      });
    }
  }

  async _flashFilebuffer(fileBuffer: Uint8Array) {
    // Stub is already ensured in _confirmInstall
    const loaderToUse = this._espStub!;

    flash(
      (state) => {
        this._installState = state;

        if (state.state === FlashStateType.FINISHED) {
          void this._handleFlashComplete().catch((err: any) => {
            this.logger.error(
              `Post-flash cleanup failed: ${err?.message || err}`,
            );
            this._state = "ERROR";
            this._error = `Post-flash cleanup failed: ${err?.message || err}`;
          });
        }
      },
      loaderToUse,
      this.logger,
      this.manifestPath,
      this._installErase,
      fileBuffer,
      this.baudRate,
    ).catch((flashErr: any) => {
      this.logger.error(`Flash error: ${flashErr.message || flashErr}`);
      this._state = "ERROR";
      this._error = `Flash failed: ${flashErr.message || flashErr}`;
      this._busy = false;
    });
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

  private async _handleSelectNewPort() {
    // Prevent multiple clicks
    if (this._busy) {
      this.logger.log("Already processing port selection, ignoring duplicate click");
      return;
    }
    
    this._busy = true;
    this.logger.log("User clicked 'Select Port' button - requesting new port...");
    this.logger.log(`Dialog in DOM at start: ${this.parentNode ? 'yes' : 'no'}`);
    
    // Hide the "Select Port" button immediately and show progress
    // This avoids confusion when the port selection dialog appears
    this._state = "DASHBOARD"; // Change state to hide the button
    this._improvChecked = false; // Show "Connecting" message
    this.requestUpdate();
    
    // Ensure dialog stays in DOM
    if (!this.parentNode) {
      document.body.appendChild(this);
      this.logger.log("Dialog re-added to DOM before port selection");
    }
    
    await new Promise(resolve => setTimeout(resolve, 50)); // Small delay to ensure UI updates
    
    // This is called directly from button click (User Gesture preserved!)
    let newPort;
    try {
      // Check if we're using WebUSB (Android) or Web Serial (Desktop)
      if ((globalThis as any).requestSerialPort) {
        // Android WebUSB
        this.logger.log("Using WebUSB port selection (Android)");
        newPort = await (globalThis as any).requestSerialPort(
          (msg: string) => this.logger.log("[WebUSB]", msg)
        );
      } else {
        // Desktop Web Serial
        this.logger.log("Using Web Serial port selection (Desktop)");
        newPort = await navigator.serial.requestPort();
      }
      this.logger.log("Port selected by user");
      this.logger.log(`Dialog in DOM after port selection: ${this.parentNode ? 'yes' : 'no'}`);
      
      // Ensure dialog is still in DOM after port selection
      if (!this.parentNode) {
        document.body.appendChild(this);
        this.logger.log("Dialog re-added to DOM after port selection");
      }
    } catch (err: any) {
      this.logger.error("Port selection error:", err);
      if ((err as DOMException).name === "NotFoundError") {
        // User cancelled port selection
        this.logger.log("Port selection cancelled by user");
        this._busy = false;
        this._state = "ERROR";
        this._error = "Port selection cancelled";
        return;
      }
      this._busy = false;
      this._state = "ERROR";
      this._error = `Port selection failed: ${err.message}`;
      return;
    }

    if (!newPort) {
      this.logger.error("newPort is null/undefined");
      this._busy = false;
      this._state = "ERROR";
      this._error = "Failed to select port";
      return;
    }

    // Open port at 115200 baud (firmware mode default)
    this.logger.log("Opening port at 115200 baud for firmware mode...");
    this.logger.log(`Dialog in DOM before opening port: ${this.parentNode ? 'yes' : 'no'}`);
    try {
      await newPort.open({ baudRate: 115200 });
      this.logger.log("Port opened successfully at 115200 baud");
      this.logger.log(`Dialog in DOM after opening port: ${this.parentNode ? 'yes' : 'no'}`);
    } catch (err: any) {
      this.logger.error("Port open error:", err);
      this._busy = false;
      this._state = "ERROR";
      this._error = `Failed to open port: ${err.message}`;
      return;
    }

    // Don't create a new ESPLoader - reuse the existing one and just update the port!
    // This is how esp32tool does it: espStub.port = newPort
    this.logger.log("Updating existing ESPLoader with new port for firmware mode...");
    
    // CRITICAL: Update ALL port references (like esp32tool does)
    // esp32tool updates: espStub.port, espStub._parent.port, espLoaderBeforeConsole.port
    
    // 1. Update base loader port (CRITICAL - this is what _port getter uses!)
    this.logger.log("Updating base loader port");
    this.esploader.port = newPort;
    this.esploader.connected = true;
    
    // 2. Update stub port if it exists
    if (this._espStub) {
      this.logger.log("Updating STUB port");
      this._espStub.port = newPort;
      this._espStub.connected = true;
      
      // 3. Update parent if it exists
      if (this._espStub._parent) {
        this.logger.log("Updating parent loader port");
        this._espStub._parent.port = newPort;
      }
    }
    
    // 4. Update saved loader if it exists (like esp32tool does)
    if ((this as any)._savedLoaderBeforeConsole) {
      this.logger.log("Updating saved loader port");
      (this as any)._savedLoaderBeforeConsole.port = newPort;
    }
    this.logger.log("ESPLoader port updated for firmware mode (no bootloader sync)");

    // Wait for device to fully boot into firmware after WDT reset
    // AND for port to be ready for communication
    // esp32tool: waits 500ms after WDT reset, then opens port, then waits 200ms before console init
    // Total: ~700ms from WDT reset to console init
    this.logger.log("Waiting 700ms for device to fully boot and port to be ready...");
    await sleep(700);

    // CRITICAL: Verify port is actually open and ready
    this.logger.log(`Port state check: readable=${this._port.readable !== null}, writable=${this._port.writable !== null}`);
    
    // CRITICAL: Check if there are any reader/writer locks that could interfere with Improv
    this.logger.log(`Checking for locks: reader=${this.esploader._reader ? 'LOCKED' : 'free'}, writer=${this.esploader._writer ? 'LOCKED' : 'free'}`);
    if (this.esploader._reader || this.esploader._writer) {
      this.logger.log("WARNING: Port has active locks! Releasing them before Improv test...");
      await this._releaseReaderWriter();
      await sleep(100);
      this.logger.log("Locks released");
    }
    
    this.logger.log("Device should be ready now");

    // Now test Improv at 115200 baud
    this.logger.log("Testing Improv at 115200 baud...");
    
    // CRITICAL: Mark that we're skipping mode switch for any future _initialize() calls
    this._skipModeSwitch = true;
    
    // Show progress while testing Improv
    this._state = "DASHBOARD";
    this.requestUpdate(); // Force UI update to show progress
    
    // Continue with Improv test (this is the ONLY place we test Improv after port reconnection)
    await this._testImprov();
  }

  private async _testImprov() {
    // CRITICAL: Mark Improv as checked BEFORE testing to prevent duplicate tests
    this._improvChecked = true;
    
    // Test Improv support
    try {
      // Use _port getter which returns esploader.port (now updated with new port)
      this.logger.log("Initializing Improv Serial");
      this.logger.log(`Port for Improv: readable=${this._port.readable !== null}, writable=${this._port.writable !== null}`);
      this.logger.log(`Port info: ${JSON.stringify(this._port.getInfo())}`);
      
      const improvSerial = new ImprovSerial(
        this._port,
        this.logger,
      );
      improvSerial.addEventListener("state-changed", () => {
        this.requestUpdate();
      });
      improvSerial.addEventListener("error-changed", () =>
        this.requestUpdate(),
      );

      // Don't set _client until we successfully initialize
      this.logger.log("Calling improvSerial.initialize()...");
      const info = await improvSerial.initialize();

      // Success - set all the values
      this._client = improvSerial;
      this._info = info;
      this._improvSupported = true;
      this.logger.log("Improv Wi-Fi Serial detected");
    } catch (err: any) {
      this.logger.log(`Improv Wi-Fi Serial not detected: ${err.message}`);
      this._client = null;
      this._info = undefined; // Explicitly clear info
      this._improvSupported = false;
      // _improvChecked is already set to true at the beginning of this method
      this.logger.log(`State after Improv failure: _client=${this._client}, _info=${this._info}, _improvSupported=${this._improvSupported}, _improvChecked=${this._improvChecked}`);
    }

    this._busy = false;
    this._state = "DASHBOARD";
    this.logger.log(`Setting state to DASHBOARD, calling requestUpdate()`);
    this.logger.log(`Before requestUpdate - Dialog in DOM: ${this.parentNode ? 'yes' : 'no'}, isConnected: ${this.isConnected}`);
    
    // If dialog was removed from DOM, add it back
    if (!this.parentNode) {
      this.logger.log("Dialog was removed from DOM - adding it back");
      document.body.appendChild(this);
      this.logger.log("Dialog re-added to DOM");
    }
    
    this.requestUpdate(); // Force UI update after state changes
    
    // Additional check to ensure dialog is visible
    await new Promise(resolve => setTimeout(resolve, 100));
    this.logger.log(`After requestUpdate - dialog should be visible now`);
    this.logger.log(`Dialog element in DOM: ${this.parentNode ? 'yes' : 'no'}`);
    this.logger.log(`Dialog isConnected: ${this.isConnected}`);
  }

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
