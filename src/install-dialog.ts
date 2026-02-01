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

  // Name of Ssid. Null = other
  @state() private _selectedSsid: string | null = null;

  // Partition table support
  @state() private _partitions?: Partition[];
  @state() private _selectedPartition?: Partition;
  @state() private _espStub?: any;

  // Save chipFamily for use after reset (when chipFamily is set to null)
  private _savedChipFamily: number | null = null;

  // Track if Improv was already checked (to avoid repeated attempts)
  private _improvChecked = false;

  // Track if console was already opened once (to avoid repeated resets)
  private _consoleInitialized = false;

  // Track if Improv is supported (separate from active client)
  private _improvSupported = false;

  // Track if device is using USB-JTAG or USB-OTG (not external serial chip)
  @state() private _isUsbJtagOrOtgDevice = false;

  // Track action to perform after port reconnection (for USB-JTAG/OTG devices)
  private _openConsoleAfterReconnect = false;
  private _visitDeviceAfterReconnect = false;
  private _addToHAAfterReconnect = false;
  private _changeWiFiAfterReconnect = false;

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
            // Update currentBaudRate to prevent re-setting
            this._espStub.currentBaudRate = this.baudRate;
          } catch (baudErr: any) {
            this.logger.log(
              `Failed to set baudrate: ${baudErr.message}, continuing with current`,
            );
            // Assume baudrate is already correct if setBaudrate fails
            this._espStub.currentBaudRate = this.baudRate;
          }
        } else {
          this.logger.log(`Baudrate already at ${this.baudRate}, skipping`);
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
        // setBaudrate now supports CDC/JTAG on Android (WebUSB)
        await espStub.setBaudrate(this.baudRate);
        this.logger.log(`Baudrate set to ${this.baudRate}`);
        // Update currentBaudRate to prevent re-setting
        espStub.currentBaudRate = this.baudRate;
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
    // Use detectUsbConnectionType from tasmota-webserial-esptool
    const isUsbJtag = await this.esploader.detectUsbConnectionType();
    this.logger.log(`USB-JTAG/OTG detection: ${isUsbJtag ? "YES" : "NO"}`);
    return isUsbJtag;
  }

  // Helper to release reader/writer locks (used by multiple methods)
  private async _releaseReaderWriter() {
    // CRITICAL: Find the actual object that has the reader
    // The stub has a _parent pointer, and the reader runs on the parent!
    let readerOwner = this._espStub || this.esploader;
    if (readerOwner._parent) {
      readerOwner = readerOwner._parent;
      this.logger.log("Using parent loader for reader/writer");
    }

    // Cancel the reader on the correct object
    if (readerOwner._reader) {
      const reader = readerOwner._reader;
      try {
        await reader.cancel();
        this.logger.log("Reader cancelled on correct object");
      } catch (err) {
        this.logger.log("Reader cancel failed:", err);
      }
      try {
        reader.releaseLock();
        this.logger.log("Reader released");
      } catch (err) {
        this.logger.log("Reader releaseLock failed:", err);
      }
      readerOwner._reader = undefined;
    }

    // Release the writer on the correct object
    if (readerOwner._writer) {
      const writer = readerOwner._writer;
      readerOwner._writer = undefined;

      try {
        writer.releaseLock();
        this.logger.log("Writer lock released");
      } catch (err) {
        this.logger.log("Writer releaseLock failed:", err);
      }
    }

    // For WebUSB (Android), ALWAYS recreate streams
    // This is CRITICAL for console to work - WebUSB needs fresh streams
    // Even if no locks were held, streams may have been consumed by other operations
    if (this.esploader.isWebUSB && this.esploader.isWebUSB()) {
      try {
        this.logger.log("WebUSB detected - recreating streams");
        await (this._port as any).recreateStreams();
        await sleep(200);
        this.logger.log("WebUSB streams recreated and ready");
      } catch (err: any) {
        this.logger.log(`Failed to recreate WebUSB streams: ${err.message}`);
      }
    }
  }

  // Helper to reset baudrate to 115200 for console
  // The ESP stub might be at higher baudrate (e.g., 460800) for flashing
  // Firmware console always runs at 115200
  private async _resetBaudrateForConsole() {
    if (this._espStub && this._espStub.currentBaudRate !== 115200) {
      this.logger.log(
        `Resetting baudrate from ${this._espStub.currentBaudRate} to 115200`,
      );
      try {
        // Use setBaudrate from tasmota-webserial-esptool
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

      // CRITICAL: Release locks BEFORE resetToFirmware()
      await this._releaseReaderWriter();

      // CRITICAL: Forget the old port so browser doesn't show it in selection
      try {
        await this._port.forget();
        this.logger.log("Old port forgotten");
      } catch (forgetErr: any) {
        this.logger.log(`Port forget failed: ${forgetErr.message}`);
      }

      try {
        // Use resetToFirmware() method close the port and device will reboot to firmware
        await this.esploader.resetToFirmware();
        this.logger.log("Device reset to firmware mode - port closed");
      } catch (err: any) {
        this.logger.debug(`Reset to firmware error (expected): ${err.message}`);
      }

      // Reset ESP state
      await sleep(100);

      this._espStub = undefined;
      this.esploader.IS_STUB = false;
      this.esploader.chipFamily = null;
      this._improvChecked = false; // Will check after user reconnects
      this._client = null; // Set to null (not undefined) to avoid "Wrapping up" UI state
      this._improvSupported = false; // Unknown until after reconnect
      this.esploader._reader = undefined;

      this.logger.log("Flash complete - waiting for user to select new port");

      // CRITICAL: Set state to REQUEST_PORT_SELECTION to show "Select Port" button
      this._state = "REQUEST_PORT_SELECTION";
      this._error = "";
      this.requestUpdate();
      return;
    }

    // Normal flow for non-USB-JTAG/OTG devices
    // Release locks and reset ESP state for Improv test
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
      // Uses chip-specific reset methods (S2/S3/C3 with USB-JTAG use watchdog)
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
  private async _resetDeviceAndReleaseLocks() {
    // Find the actual object that has the reader/writer
    let readerOwner = this._espStub || this.esploader;
    if (readerOwner._parent) {
      readerOwner = readerOwner._parent;
      this.logger.log("Using parent loader for reader/writer");
    }

    // Call hardReset BEFORE releasing locks (so it can communicate)
    try {
      await this.esploader.hardReset(false);
      this.logger.log("Device reset sent");
    } catch (err) {
      this.logger.log("Reset error (expected):", err);
    }

    // Wait for reset to complete
    await sleep(500);

    // NOW release locks after reset
    await this._releaseReaderWriter();
    this.logger.log("Device reset to firmware mode");

    // Save chipFamily before resetting ESP state
    this._savedChipFamily = this.esploader.chipFamily;

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
      try {
        [heading, content, hideActions, allowClosing] =
          this._improvSupported && this._info
            ? this._renderDashboard()
            : this._renderDashboardNoImprov();
      } catch (err: any) {
        this.logger.error(`Error rendering dashboard: ${err.message}`, err);
        [heading, content, hideActions] = this._renderError(
          `Dashboard render error: ${err.message}`,
        );
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
      [heading, content, hideActions] = this._renderError(
        `Unknown state: ${this._state}`,
      );
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
                <ewt-button
                  ?disabled=${this._busy}
                  label="Visit Device"
                  @click=${async () => {
                    this._busy = true;

                    // Switch to firmware mode if needed
                    const needsReconnect =
                      await this._switchToFirmwareMode("visit");
                    if (needsReconnect) {
                      return; // Will continue after port reconnection
                    }

                    // Device is in firmware mode - open URL
                    if (this._client && this._client.nextUrl) {
                      window.open(this._client.nextUrl, "_blank");
                    }
                    this._busy = false;
                  }}
                ></ewt-button>
              </div>
            `}
        ${!this._client ||
        !this._manifest.home_assistant_domain ||
        this._client.state !== ImprovSerialCurrentState.PROVISIONED
          ? ""
          : html`
              <div>
                <ewt-button
                  ?disabled=${this._busy}
                  label="Add to Home Assistant"
                  @click=${async () => {
                    this._busy = true;

                    // Switch to firmware mode if needed
                    const needsReconnect =
                      await this._switchToFirmwareMode("homeassistant");
                    if (needsReconnect) {
                      return; // Will continue after port reconnection
                    }

                    // Device is in firmware mode - open HA URL
                    if (this._manifest.home_assistant_domain) {
                      window.open(
                        `https://my.home-assistant.io/redirect/config_flow_start/?domain=${this._manifest.home_assistant_domain}`,
                        "_blank",
                      );
                    }
                    this._busy = false;
                  }}
                ></ewt-button>
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

                    // Switch to firmware mode if needed
                    const needsReconnect =
                      await this._switchToFirmwareMode("wifi");
                    if (needsReconnect) {
                      return; // Will continue after port reconnection
                    }

                    // Device is in firmware mode
                    this.logger.log(
                      "Device is running firmware for Wi-Fi setup",
                    );

                    // Close Improv client and re-initialize for WiFi setup
                    if (this._client) {
                      try {
                        await this._closeClientWithoutEvents(this._client);
                      } catch (e) {
                        this.logger.log("Failed to close Improv client:", e);
                      }
                      this._client = undefined;

                      // Wait for port to be ready after closing client
                      await sleep(200);
                    }

                    // Hard reset to ensure device is ready for Wi‑Fi setup.
                    // This matches the flow in _testImprov where reset is done before Improv test
                    try {
                      this.logger.log("Resetting device for Wi-Fi setup...");

                      // Restore chipFamily if it was saved (needed for hardReset to work)
                      if (
                        this.esploader.chipFamily === null &&
                        this._savedChipFamily !== null
                      ) {
                        this.logger.log(
                          `Restoring chipFamily ${this._savedChipFamily} for reset`,
                        );
                        this.esploader.chipFamily = this._savedChipFamily;
                      }

                      // Do hardReset FIRST
                      await this.esploader.hardReset(false);
                      this.logger.log("Device reset completed");
                      
                      // NOW recreate streams AFTER reset
                      await this._releaseReaderWriter();
                      
                      // Wait for streams to be fully ready
                      await sleep(200);
                      this.logger.log("Port ready for new Improv client");
                    } catch (err: any) {
                      this.logger.log(`Reset error (expected): ${err.message}`);
                    }

                    // Re-create Improv client (firmware is running at 115200 baud)
                    const client = new ImprovSerial(this._port, this.logger);
                    client.addEventListener("state-changed", () => {
                      this.requestUpdate();
                    });
                    client.addEventListener("error-changed", () =>
                      this.requestUpdate(),
                    );
                    try {
                      // Add extra timeout wrapper to prevent hanging
                      const initPromise = client.initialize(1000);
                      const timeoutPromise = new Promise<any>((_, reject) =>
                        setTimeout(
                          () =>
                            reject(new Error("Improv initialization timeout")),
                          2000,
                        ),
                      );
                      this._info = await Promise.race([
                        initPromise,
                        timeoutPromise,
                      ]);

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

                    // Switch to firmware mode if needed
                    const needsReconnect =
                      await this._switchToFirmwareMode("console");
                    if (needsReconnect) {
                      return; // Will continue after port reconnection
                    }

                    // Device is already in firmware mode
                    this.logger.log(
                      "Opening console for USB-JTAG/OTG device (in firmware mode)",
                    );

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
                    }

                    // switch to Firmware mode for Console
                    await this._switchToFirmwareMode("console");

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
              // Filesystem management requires bootloader mode
              // Close Improv client if active (it locks the reader)
              if (this._client) {
                try {
                  await this._closeClientWithoutEvents(this._client);
                } catch (e) {
                  this.logger.log("Failed to close Improv client:", e);
                }
              }

              // Switch to bootloader mode for filesystem operations
              this.logger.log(
                "Preparing device for filesystem operations (switching to bootloader mode)...",
              );

              try {
                await this._prepareForFlashOperations();
                await this._ensureStub();
              } catch (err: any) {
                this.logger.log(
                  `Failed to prepare for filesystem: ${err.message}`,
                );
                this._state = "ERROR";
                this._error = `Failed to enter bootloader mode: ${err.message}`;
                return;
              }

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
                    this._busy = true;
                    const client = this._client;
                    if (client) {
                      await this._closeClientWithoutEvents(client);
                    }

                    // switch to Firmware mode for Console
                    const needsReconnect =
                      await this._switchToFirmwareMode("console");
                    if (needsReconnect) {
                      return; // Will continue after port reconnection
                    }

                    this._state = "LOGS";
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

                    // Switch to firmware mode if needed
                    const needsReconnect =
                      await this._switchToFirmwareMode("console");
                    if (needsReconnect) {
                      return; // Will continue after port reconnection
                    }

                    // Device is already in firmware mode
                    this.logger.log(
                      "Opening console for USB-JTAG/OTG device (in firmware mode)",
                    );

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
              // Filesystem management requires bootloader mode
              // Close Improv client if active (it locks the reader)
              if (this._client) {
                try {
                  await this._closeClientWithoutEvents(this._client);
                } catch (e) {
                  this.logger.log("Failed to close Improv client:", e);
                }
                // Keep client object for dashboard rendering; connection already closed above.
              }

              // Switch to bootloader mode for filesystem operations
              this.logger.log(
                "Preparing device for filesystem operations (switching to bootloader mode)...",
              );

              try {
                await this._prepareForFlashOperations();
                await this._ensureStub();
              } catch (err: any) {
                this.logger.log(
                  `Failed to prepare for filesystem: ${err.message}`,
                );
                this._state = "ERROR";
                this._error = `Failed to enter bootloader mode: ${err.message}`;
                return;
              }

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
                          @click=${async (ev: Event) => {
                            ev.preventDefault();
                            const url = this._client!.nextUrl!;
                            // Preserve user gesture for popup blockers
                            const popup = window.open("about:blank", "_blank");
                            // Visit Device opens external page - firmware must running
                            // Check if device is in bootloader mode
                            // Switch to firmware mode if needed
                            const needsReconnect =
                              await this._switchToFirmwareMode("visit");
                            if (needsReconnect) {
                              popup?.close();
                              return; // Will continue after port reconnection
                            }

                            // Device is already in firmware mode
                            this.logger.log(
                              "Following Link (in firmware mode)",
                            );

                            if (popup) {
                              popup.location.href = url;
                            } else {
                              window.open(url, "_blank");
                            }
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
                          @click=${async (ev: Event) => {
                            ev.preventDefault();
                            const url = `https://my.home-assistant.io/redirect/config_flow_start/?domain=${this._manifest.home_assistant_domain}`;
                            const popup = window.open("about:blank", "_blank");
                            // Add to HA opens external page - firmware must running
                            // Check if device is in bootloader mode
                            // Switch to firmware mode if needed
                            const needsReconnect =
                              await this._switchToFirmwareMode("homeassistant");
                            if (needsReconnect) {
                              popup?.close();
                              return; // Will continue after port reconnection
                            }

                            // Device is already in firmware mode
                            this.logger.log(
                              "Following Link (in firmware mode)",
                            );

                            if (popup) {
                              popup.location.href = url;
                            } else {
                              window.open(url, "_blank");
                            }
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
                      // After WiFi provisioning: Device stays in firmware mode
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

                      // Release locks and stay in firmware mode
                      await this._releaseReaderWriter();
                      this.logger.log(
                        "Returning to dashboard (device stays in firmware mode)",
                      );

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
                  // After WiFi provisioning: Device stays in firmware mode
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

                  // Release locks and stay in firmware mode
                  await this._releaseReaderWriter();
                  this.logger.log(
                    "Returning to dashboard (device stays in firmware mode)",
                  );

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
                    index === this._ssids!.length
                      ? null
                      : this._ssids![index].name;
                }}
                @closed=${(ev: Event) => ev.stopPropagation()}
              >
                ${this._ssids!.map(
                  (info, idx) => html`
                    <ewt-list-item
                      .selected=${this._selectedSsid === info.name}
                      value=${idx}
                    >
                      ${info.name}
                    </ewt-list-item>
                  `,
                )}
                <ewt-list-item
                  .selected=${this._selectedSsid === null}
                  value="-1"
                >
                  Join other…
                </ewt-list-item>
              </ewt-select>
            `
          : ""}
        ${
          // Show input box if command not supported or "Join Other" selected
          this._selectedSsid === null
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
            // When going back from provision: Device stays in firmware mode
            // Close Improv client first
            if (this._client) {
              try {
                await this._closeClientWithoutEvents(this._client);
                this.logger.log("Improv client closed");
              } catch (e) {
                this.logger.log("Failed to close Improv client:", e);
              }
            }

            // Release locks and stay in firmware mode
            await this._releaseReaderWriter();
            this.logger.log(
              "Returning to dashboard (device stays in firmware mode)",
            );

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
    } else if (
      this._installState.state === FlashStateType.FINISHED &&
      !this._isUsbJtagOrOtgDevice
    ) {
      // NOTE: USB-JTAG/OTG devices go directly to REQUEST_PORT_SELECTION
      // This is only for external serial chips
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
        .onReset=${async () => await this.esploader.hardReset(false)}
      ></ewt-console>
      <ewt-button
        slot="primaryAction"
        label="Back"
        @click=${async () => {
          await this.shadowRoot!.querySelector("ewt-console")!.disconnect();

          // After console: ESP stays in firmware mode
          // Device will only switch to bootloader mode when "Install" or "Manage Filesystem" is clicked
          await this._releaseReaderWriter();
          this.logger.log(
            "Returning to dashboard (device stays in firmware mode)",
          );

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
            // Just release locks and go back to dashboard
            // Device stays in firmware mode (no need to switch)
            await this._releaseReaderWriter();
            this._state = "DASHBOARD";
            // Don't reset _improvChecked - status is still valid after console operations
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
            try {
              // For USB-JTAG/OTG: Need to re-initialize after port changes
              // For External Serial: Just go back to dashboard
              if (this._isUsbJtagOrOtgDevice) {
                this._state = "DASHBOARD";
                await this._initialize();
              } else {
                // External serial - just go back, device stays in bootloader mode
                this._state = "DASHBOARD";
                // Ensure _busy is false so buttons are enabled
                this._busy = false;
              }
            } catch (err: any) {
              this.logger.error(`Partitions Back error: ${err.message}`);
              this._state = "ERROR";
              this._error = `Failed to return to dashboard: ${err.message}`;
              this._busy = false;
            }
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
        await this._releaseReaderWriter();
        this._error = "Port selection cancelled";
        this._state = "ERROR";
      } else if (e.message && e.message.includes("Failed to connect")) {
        // Connection error - show error state so user can retry
        await this._releaseReaderWriter();
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
      this._updateSsids();
    } else {
      // Reset this value if we leave provisioning.
      this._provisionForce = false;
    }

    if (this._state === "INSTALL") {
      this._installConfirmed = false;
      this._installState = undefined;
    }
  }

  private async _updateSsids(tries = 0) {
    this._ssids = undefined;
    this._busy = true;

    let ssids: Ssid[];
    try {
      ssids = await this._client!.scan();
    } catch (err) {
      // When we fail while loading, pick "Join other"
      if (this._ssids === undefined) {
        this._ssids = null;
        this._selectedSsid = null;
      }
      this._busy = false;
      return;
    }

    // We will retry a few times if we don't get any results
    if (ssids.length === 0 && tries < 3) {
      this.logger.log(
        `SSID scan returned empty, scheduling retry ${tries + 1}/3`,
      );
      setTimeout(() => {
        if (this._state === "PROVISION") {
          this._updateSsids(tries + 1);
        }
      }, 2000);
      return;
    }

    this._ssids = ssids;
    this._selectedSsid = ssids.length ? ssids[0].name : null;
    this._busy = false;
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

    if (changedProps.has("_selectedSsid") && this._selectedSsid === null) {
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
      this._improvChecked = true;
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
      this._busy = false;
      this.requestUpdate(); // Force UI update
      return;
    }

    // Skip Improv if we already have a working client
    if (this._client) {
      this.logger.log("Improv client already active, skipping initialization");
      this._improvSupported = true; // If we have a client, Improv is supported
      this._improvChecked = true;
      this._busy = false;
      return;
    }

    // Check if device is using USB-JTAG or USB-OTG (not external serial chip)
    const isUsbJtagOrOtg = await this._isUsbJtagOrOtg();
    this._isUsbJtagOrOtgDevice = isUsbJtagOrOtg; // Update state for UI

    // Check if device is in bootloader mode
    // If yes, switch to firmware mode first (needed for Improv)
    const inBootloaderMode = this.esploader.chipFamily !== null;

    if (inBootloaderMode) {
      this.logger.log(
        "Device is in BOOTLOADER mode - switching to FIRMWARE mode for Improv test",
      );

      if (isUsbJtagOrOtg) {
        // USB-JTAG/OTG: Need WDT reset → port closes → user must select new port
        this.logger.log(
          "USB-JTAG/OTG device - need to switch to firmware mode",
        );

        try {
          // CRITICAL: Ensure chipFamily is set before calling resetToFirmware()
          if (!this.esploader.chipFamily) {
            this.logger.log("Detecting chip type...");
            await this.esploader.initialize();
            this.logger.log(`Chip detected: ${this.esploader.chipFamily}`);
          }

          // CRITICAL: Create stub before reset
          if (!this._espStub) {
            this.logger.log("Creating stub for firmware mode switch...");
            this._espStub = await this.esploader.runStub();
            this.logger.log(`Stub created: IS_STUB=${this._espStub.IS_STUB}`);
          }

          // CRITICAL: Save parent loader
          const loaderToSave = this._espStub._parent || this._espStub;
          (this as any)._savedLoaderBeforeConsole = loaderToSave;

          // CRITICAL: Release locks BEFORE calling resetToFirmware()
          await this._releaseReaderWriter();

          // CRITICAL: Forget the old port so browser doesn't show it in selection
          try {
            await this._port.forget();
            this.logger.log("Old port forgotten");
          } catch (forgetErr: any) {
            this.logger.log(`Port forget failed: ${forgetErr.message}`);
          }

          // Use resetToFirmware() which handles WDT reset and port close
          await this.esploader.resetToFirmware();
          this.logger.log("Device reset to firmware mode - port closed");
        } catch (err: any) {
          this.logger.debug(
            `Reset to firmware error (expected): ${err.message}`,
          );
        }

        // Reset ESP state (port is already closed by resetToFirmware)
        await sleep(100);

        this._espStub = undefined;
        this.esploader.IS_STUB = false;
        this.esploader.chipFamily = null;
        this._improvChecked = false; // Will check after user reconnects
        this._client = undefined;
        this._improvSupported = false;
        this.esploader._reader = undefined;

        this.logger.log("Waiting for user to select new port");

        // Show port selection UI
        this._state = "REQUEST_PORT_SELECTION";
        this._error = "";
        this._busy = false;
        return;
      } else {
        // External serial chip: Can reset to firmware without port change
        this.logger.log("External serial chip - resetting to firmware mode");

        try {
          await this._resetDeviceAndReleaseLocks();
          await sleep(500); // Wait for firmware to start

          // For WebUSB, ensure streams are recreated after reset
          await this._releaseReaderWriter();
          await sleep(200); // Wait for streams to be fully ready
          this.logger.log("Streams ready after reset");
        } catch (err: any) {
          this.logger.log(`Reset to firmware failed: ${err.message}`);
        }
      }
    } else {
      this.logger.log(
        "Device is already in FIRMWARE mode - ready for Improv test",
      );

      // Ensure locks are released and streams are ready
      // For WebUSB, this also recreates streams
      try {
        await this._releaseReaderWriter();
        await sleep(200); // Wait for streams to be fully ready
        this.logger.log("Port ready for Improv test");
      } catch (err: any) {
        this.logger.log(`Failed to prepare port: ${err.message}`);
      }
    }

    // Don't switch to bootloader on initial connect!
    // Just test Improv directly - device should now be in firmware mode
    this.logger.log("Testing Improv (device is in firmware mode)");

    // Calculate timeout for Improv test
    const timeout = !justInstalled
      ? 1000
      : this._manifest.new_install_improv_wait_time !== undefined
        ? this._manifest.new_install_improv_wait_time * 1000
        : 10000;

    //    // Call Improv test with skipReset=false to ensure device is properly reset
    //    // This matches the CDC/USB-JTAG flow where hardReset is done right before Improv test
    //    await this._testImprov(timeout, false);
    // Call Improv test with timeout and skipReset=true (already in firmware mode)
    await this._testImprov(timeout, true);
  }

  /**
   * Switch device from bootloader mode to firmware mode.
   * For USB-JTAG/OTG devices: Requires port reconnection (sets REQUEST_PORT_SELECTION state).
   * For external serial: Resets device without port change.
   *
   * @param actionAfterReconnect - Action to perform after reconnect: 'console', 'visit', 'homeassistant', 'wifi', or null
   */
  private async _switchToFirmwareMode(
    actionAfterReconnect:
      | "console"
      | "visit"
      | "homeassistant"
      | "wifi"
      | null = null,
  ): Promise<boolean> {
    const inBootloaderMode = this.esploader.chipFamily !== null;

    if (!inBootloaderMode) {
      this.logger.log("Device already in firmware mode");

      // If opening console for the FIRST time, do a reset to ensure device is ready
      if (actionAfterReconnect === "console" && !this._consoleInitialized) {
        this.logger.log("First console open - resetting device...");
        this._consoleInitialized = true;
        try {
          await this.esploader.hardReset(false);
          this.logger.log("Device reset completed");
        } catch (err: any) {
          this.logger.log(`Reset error (expected): ${err.message}`);
        }
      }

      // Even if already in firmware mode, ensure streams are ready
      // This is needed for WebUSB after closing Improv client
      await this._releaseReaderWriter();

      return false; // No switch needed
    }

    this.logger.log(
      `Device is in bootloader mode - switching to firmware for ${actionAfterReconnect || "operation"}`,
    );

    // CRITICAL: Ensure chipFamily is set
    if (!this.esploader.chipFamily) {
      this.logger.log("Detecting chip type...");
      await this.esploader.initialize();
      this.logger.log(`Chip detected: ${this.esploader.chipFamily}`);
    }

    // CRITICAL: Create stub before reset
    if (!this._espStub) {
      this.logger.log("Creating stub for firmware mode switch...");
      this._espStub = await this.esploader.runStub();
      this.logger.log(`Stub created: IS_STUB=${this._espStub.IS_STUB}`);
    }

    // CRITICAL: Set baudrate to 115200 BEFORE switching
    await this._resetBaudrateForConsole();

    // CRITICAL: Save parent loader
    const loaderToSave = this._espStub._parent || this._espStub;
    (this as any)._savedLoaderBeforeSwitch = loaderToSave;

    // Check if USB-JTAG/OTG device
    const isUsbJtagOrOtg = await this._isUsbJtagOrOtg();

    if (isUsbJtagOrOtg) {
      // USB-JTAG/OTG: Need WDT reset and port reconnection

      // CRITICAL: Release locks BEFORE calling resetToFirmware()
      this.logger.log("Releasing reader/writer...");
      await this._releaseReaderWriter();

      try {
        // CRITICAL: Forget the old port
        try {
          await this._port.forget();
          this.logger.log("Old port forgotten");
        } catch (forgetErr: any) {
          this.logger.log(`Port forget failed: ${forgetErr.message}`);
        }

        // Use resetToFirmware() for CDC this is doing a WDT reset
        await this.esploader.resetToFirmware();
        this.logger.log("Device reset to firmware mode - port closed");
      } catch (err: any) {
        this.logger.debug(`Reset to firmware error (expected): ${err.message}`);
      }

      // Reset ESP state
      await sleep(100);

      this._espStub = undefined;
      this.esploader.IS_STUB = false;
      this.esploader.chipFamily = null;
      this._improvChecked = false;
      this._client = null;
      this._improvSupported = false;
      this.esploader._reader = undefined;

      // Set flag for action after reconnect
      if (actionAfterReconnect === "console") {
        this._openConsoleAfterReconnect = true;
      } else if (actionAfterReconnect === "visit") {
        this._visitDeviceAfterReconnect = true;
      } else if (actionAfterReconnect === "homeassistant") {
        this._addToHAAfterReconnect = true;
      } else if (actionAfterReconnect === "wifi") {
        this._changeWiFiAfterReconnect = true;
      }

      this.logger.log("Waiting for user to select new port");

      // Show port selection UI
      this._state = "REQUEST_PORT_SELECTION";
      this._error = "";
      this._busy = false;
      return true; // Port reconnection needed
    } else {
      // External serial chip: Can reset to firmware without port change
      this.logger.log("External serial chip - resetting to firmware mode");

      try {
        // CRITICAL: Call hardReset BEFORE releasing locks (so it can communicate)
        await this.esploader.hardReset(false); // false = firmware mode
        this.logger.log("Device reset to firmware mode");
      } catch (err: any) {
        this.logger.log(
          `Reset worked. Expected slip Timeout read error: ${err.message}`,
        );
      }

      // Wait for reset to complete
      await sleep(500);

      // NOW release locks AFTER reset
      this.logger.log("Releasing reader/writer after reset...");
      await this._releaseReaderWriter();

      // Reset ESP state
      this._espStub = undefined;
      this.esploader.IS_STUB = false;
      this.esploader.chipFamily = null;

      try {
        // Do a hardReset to start firmware
        await this.esploader.hardReset(false); // false = firmware mode
        this.logger.log("Device in firmware mode, start firmware with reset");
      } catch (err: any) {
        this.logger.log(`Reset error: ${err.message}`);
      }

      return false; // No port reconnection needed
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

    // For flash operations, we MUST be in bootloader mode
    // This is the ONLY place where we switch to bootloader (not on initial connect)
    this.logger.log(
      "Preparing device for flash operations (switching to bootloader mode)...",
    );

    try {
      await this._prepareForFlashOperations();
    } catch (err: any) {
      this.logger.log(`Failed to prepare for flash: ${err.message}`);
      this._state = "ERROR";
      this._error = `Failed to enter bootloader mode: ${err.message}`;
      return;
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
        async (state) => {
          this._installState = state;

          if (state.state === FlashStateType.FINISHED) {
            // For USB-JTAG/OTG, wait for cleanup before showing port selection
            const isUsbJtagOrOtg = await this._isUsbJtagOrOtg();
            if (isUsbJtagOrOtg) {
              this._isUsbJtagOrOtgDevice = true;
              // Wait for reset to complete before showing port selection
              await this._handleFlashComplete().catch((err: any) => {
                this.logger.error(
                  `Post-flash cleanup failed: ${err?.message || err}`,
                );
                this._state = "ERROR";
                this._error = `Post-flash cleanup failed: ${err?.message || err}`;
              });
            } else {
              // For non-USB-JTAG/OTG, run async (no need to wait)
              void this._handleFlashComplete().catch((err: any) => {
                this.logger.error(
                  `Post-flash cleanup failed: ${err?.message || err}`,
                );
                this._state = "ERROR";
                this._error = `Post-flash cleanup failed: ${err?.message || err}`;
              });
            }
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
      this._selectedSsid === null
        ? (
            this.shadowRoot!.querySelector(
              "ewt-textfield[name=ssid]",
            ) as EwtTextfield
          ).value
        : this._selectedSsid;
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
      this.logger.log(
        "Already processing port selection, ignoring duplicate click",
      );
      return;
    }

    this._busy = true;
    this.logger.log(
      "User clicked 'Select Port' button - requesting new port...",
    );
    this.logger.log(
      `Dialog in DOM at start: ${this.parentNode ? "yes" : "no"}`,
    );

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

    let newPort;
    try {
      // Check if we're using WebUSB (Android) or Web Serial (Desktop)
      if ((globalThis as any).requestSerialPort) {
        // Android WebUSB
        this.logger.log("Using WebUSB port selection (Android)");
        newPort = await (globalThis as any).requestSerialPort((msg: string) =>
          this.logger.log("[WebUSB]", msg),
        );
      } else {
        // Desktop Web Serial
        this.logger.log("Using Web Serial port selection (Desktop)");
        newPort = await navigator.serial.requestPort();
      }

      // UI updates can happen after requestPort completes
      await new Promise((resolve) => setTimeout(resolve, 50));

      this.logger.log("Port selected by user");

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
    // Port should be closed by resetToFirmware(), but check first
    this.logger.log("Opening port at 115200 baud for firmware mode...");
    this.logger.log(
      `Dialog in DOM before opening port: ${this.parentNode ? "yes" : "no"}`,
    );

    // Check if port is already open (shouldn't be, but just in case)
    if (newPort.readable !== null || newPort.writable !== null) {
      this.logger.log("WARNING: Port appears to be open, closing it first...");
      try {
        await newPort.close();
        await sleep(200); // Wait for port to fully close
        this.logger.log("Port closed successfully");
      } catch (closeErr: any) {
        this.logger.log(`Port close failed: ${closeErr.message}`);
        // Continue anyway - maybe it wasn't really open
      }
    }

    try {
      await newPort.open({ baudRate: 115200 });
      this.logger.log("Port opened successfully at 115200 baud");
      this.logger.log(
        `Dialog in DOM after opening port: ${this.parentNode ? "yes" : "no"}`,
      );
    } catch (err: any) {
      this.logger.error("Port open error:", err);
      this._busy = false;
      this._state = "ERROR";
      this._error = `Failed to open port: ${err.message}`;
      return;
    }

    // Don't create a new ESPLoader - reuse the existing one and just update the port! -> espStub.port = newPort
    this.logger.log(
      "Updating existing ESPLoader with new port for firmware mode...",
    );

    // CRITICAL: Update ALL port references!!
    // Updates: espStub.port, espStub._parent.port, espLoaderBeforeConsole.port

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

    // 4. Update saved loader if it exists
    if ((this as any)._savedLoaderBeforeConsole) {
      this.logger.log("Updating saved loader port");
      (this as any)._savedLoaderBeforeConsole.port = newPort;
    }
    this.logger.log(
      "ESPLoader port updated for firmware mode (no bootloader sync)",
    );

    // Wait for device to fully boot into firmware after WDT reset
    // AND for port to be ready for communication
    this.logger.log(
      "Waiting 700ms for device to fully boot and port to be ready...",
    );
    await sleep(700);

    // CRITICAL: Verify port is actually open and ready
    this.logger.log(
      `Port state check: readable=${this._port.readable !== null}, writable=${this._port.writable !== null}`,
    );

    // CRITICAL: Check if there are any reader/writer locks that could interfere with Improv
    this.logger.log(
      `Checking for locks: reader=${this.esploader._reader ? "LOCKED" : "free"}, writer=${this.esploader._writer ? "LOCKED" : "free"}`,
    );
    if (this.esploader._reader || this.esploader._writer) {
      this.logger.log(
        "WARNING: Port has active locks! Releasing them before Improv test...",
      );
      await this._releaseReaderWriter();
      this.logger.log("Locks released");
    }

    this.logger.log("Device should be ready now");

    // Now test Improv at 115200 baud
    this.logger.log("Testing Improv at 115200 baud...");

    // Show progress while testing Improv
    this._state = "DASHBOARD";
    this.requestUpdate(); // Force UI update to show progress

    // Continue with Improv test
    // For USB-JTAG/OTG: Device is in firmware mode but firmware not started - need reset
    // For external serial: Reset ensures device is in clean state
    await this._testImprov(1000, false);
  }

  private async _testImprov(timeout = 1000, skipReset = false) {
    // CRITICAL: Mark Improv as checked BEFORE testing to prevent duplicate tests
    this._improvChecked = true;

    // CRITICAL: Set _busy = false to ensure menu is enabled even if something fails
    // This is set early to prevent menu from staying gray if an unexpected error occurs
    //    this._busy = false;

    // Declare improvSerial outside try block so it's available in catch
    let improvSerial: ImprovSerial | undefined;

    // Test Improv support
    try {
      // Use _port getter which returns esploader.port (now updated with new port)
      this.logger.log(
        `Port for Improv: readable=${this._port.readable !== null}, writable=${this._port.writable !== null}`,
      );
      const portInfo = this._port.getInfo();
      this.logger.log(
        `Port info: VID=0x${portInfo.usbVendorId?.toString(16).padStart(4, "0")}, PID=0x${portInfo.usbProductId?.toString(16).padStart(4, "0")}`,
      );

      // CRITICAL: Reset device BEFORE testing Improv to ensure firmware is running (unless skipReset is true)
      if (!skipReset) {
        this.logger.log("Resetting device for Improv detection...");

        try {
          // Release locks before reset
          await this._releaseReaderWriter();

          await this.esploader.hardReset(false);
          this.logger.log("Device reset sent, device is rebooting...");

          // CRITICAL: hardReset consumes the streams
          // Need to recreate them before Improv can use the port
          await this._releaseReaderWriter();
          this.logger.log("Streams recreated after reset");

          // Wait for device to boot up
          this.logger.log(
            "Waiting for firmware running to be ready for Improv test...",
          );
          await sleep(500);
        } catch (resetErr: any) {
          this.logger.log(`Failed to reset device: ${resetErr.message}`);
          // Continue anyway
        }
      }

      improvSerial = new ImprovSerial(this._port, this.logger);
      improvSerial.addEventListener("state-changed", () => {
        this.requestUpdate();
      });
      improvSerial.addEventListener("error-changed", () =>
        this.requestUpdate(),
      );

      // Don't set _client until we successfully initialize
      this.logger.log("Calling improvSerial.initialize()...");
      const info = await improvSerial.initialize(timeout);

      // Wait for firmware to complete WiFi scan and connection
      // Poll for valid IP address (not 0.0.0.0) by requesting current state with timeout
      this.logger.log(
        "Waiting for firmware to get valid IP address (checking every 500ms, max 10 seconds)...",
      );
      const startTime = Date.now();
      const maxWaitTime = 10000; // 10 seconds max
      let hasValidIp = false;

      while (Date.now() - startTime < maxWaitTime) {
        // Active request current state to get updated URL
        try {
          await improvSerial.requestCurrentState();
          const currentUrl = improvSerial.nextUrl;
          if (currentUrl && !currentUrl.includes("0.0.0.0")) {
            this.logger.log(`Valid IP found: ${currentUrl}`);
            hasValidIp = true;
            break;
          }
        } catch (err: any) {
          this.logger.log(`Failed to request current state: ${err.message}`);
        }
        await sleep(500); // Check every 500ms
      }

      if (!hasValidIp) {
        this.logger.log(
          `Timeout after ${maxWaitTime / 1000} seconds - continuing with current URL: ${improvSerial.nextUrl || "undefined"}`,
        );
      }

      // Success - set all the values
      this._client = improvSerial;
      this._info = info;
      this._improvSupported = true;
      improvSerial.addEventListener("disconnect", this._handleDisconnect);
      this.logger.log("Improv Wi-Fi Serial detected");
      this.logger.log(
        `Improv state: ${improvSerial.state}, nextUrl: ${improvSerial.nextUrl || "undefined"}`,
      );
    } catch (err: any) {
      this.logger.log(`Improv Wi-Fi Serial not detected: ${err.message}`);
      this._client = null;
      this._info = undefined; // Explicitly clear info
      this._improvSupported = false;
      // _improvChecked is already set to true at the beginning of this method
      this.logger.log(
        `State after Improv failure: _client=${this._client}, _info=${this._info}, _improvSupported=${this._improvSupported}, _improvChecked=${this._improvChecked}`,
      );

      // CRITICAL: Close the improvSerial client if it was created
      // Even if initialize() failed, the client may have opened streams
      if (improvSerial) {
        try {
          this.logger.log("Closing failed Improv client...");
          await improvSerial.close();
          this.logger.log("Failed Improv client closed");

          // CRITICAL: Wait for streams to be fully released
          await sleep(200);
        } catch (closeErr: any) {
          this.logger.log(`Failed to close Improv client: ${closeErr.message}`);
        }
      }

      // CRITICAL: Improv test consumes streams even on failure
      // Need to recreate them so console/other features can work
      try {
        await this._releaseReaderWriter();
        this.logger.log("Streams recreated after Improv failure");
      } catch (releaseErr: any) {
        this.logger.log(`Failed to recreate streams: ${releaseErr.message}`);
      }
    }

    // Disable Menu as long improv check is done
    this._busy = false;

    // Check if user wanted specific action after reconnect
    if (this._openConsoleAfterReconnect) {
      this.logger.log("Opening console as requested by user");
      this._openConsoleAfterReconnect = false; // Reset flag

      // CRITICAL: Close Improv client before opening console
      if (this._client) {
        try {
          await this._closeClientWithoutEvents(this._client);
          this.logger.log("Improv client closed before opening console");
        } catch (e) {
          this.logger.log("Failed to close Improv client:", e);
        }
        this._client = undefined;

        // Wait for port to be ready after closing client
        await sleep(200);
      }

      // Ensure all locks are released
      await this._releaseReaderWriter();

      this._state = "LOGS";
    } else if (this._visitDeviceAfterReconnect) {
      this.logger.log("Opening Visit Device URL as requested by user");
      this._visitDeviceAfterReconnect = false; // Reset flag
      if (this._client && this._client.nextUrl) {
        window.open(this._client.nextUrl, "_blank");
      }
      this._state = "DASHBOARD";
    } else if (this._addToHAAfterReconnect) {
      this.logger.log("Opening Home Assistant URL as requested by user");
      this._addToHAAfterReconnect = false; // Reset flag
      if (this._manifest.home_assistant_domain) {
        window.open(
          `https://my.home-assistant.io/redirect/config_flow_start/?domain=${this._manifest.home_assistant_domain}`,
          "_blank",
        );
      }
      this._state = "DASHBOARD";
    } else if (this._changeWiFiAfterReconnect) {
      this.logger.log("Opening Wi-Fi provisioning as requested by user");
      this._changeWiFiAfterReconnect = false; // Reset flag

      // Close Improv client and re-initialize for WiFi setup
      if (this._client) {
        try {
          await this._closeClientWithoutEvents(this._client);
        } catch (e) {
          this.logger.log("Failed to close Improv client:", e);
        }
        this._client = undefined;

        // Wait for port to be ready after closing client
        await sleep(200);

        // Hard reset to ensure device is ready for Wi‑Fi setup.
        // This matches the flow in _testImprov where reset is done before Improv test
        try {
          this.logger.log("Resetting device for Wi-Fi setup...");

          // Restore chipFamily if it was saved (needed for hardReset to work)
          if (
            this.esploader.chipFamily === null &&
            this._savedChipFamily !== null
          ) {
            this.logger.log(
              `Restoring chipFamily ${this._savedChipFamily} for reset`,
            );
            this.esploader.chipFamily = this._savedChipFamily;
          }

          // Do hardReset FIRST
          await this.esploader.hardReset(false);
          this.logger.log("Device reset completed");
          
          // NOW recreate streams AFTER reset
          await this._releaseReaderWriter();
          
          // Wait for streams to be fully ready
          await sleep(200);
          this.logger.log("Port ready for Wi-Fi setup");
        } catch (err: any) {
          this.logger.log(`Reset error (expected): ${err.message}`);
        }
      }

      // Re-create Improv client for Wi-Fi provisioning
      this.logger.log("Re-initializing Improv Serial for Wi-Fi setup");
      const client = new ImprovSerial(this._port, this.logger);
      client.addEventListener("state-changed", () => {
        this.requestUpdate();
      });
      client.addEventListener("error-changed", () => this.requestUpdate());
      try {
        // Add extra timeout wrapper to prevent hanging
        const initPromise = client.initialize(1000);
        const timeoutPromise = new Promise<any>((_, reject) =>
          setTimeout(
            () => reject(new Error("Improv initialization timeout")),
            2000,
          ),
        );
        this._info = await Promise.race([initPromise, timeoutPromise]);
        this._client = client;
        client.addEventListener("disconnect", this._handleDisconnect);
        this.logger.log("Improv client ready for Wi-Fi provisioning");
        this._state = "PROVISION";
        this._provisionForce = true;
      } catch (improvErr: any) {
        try {
          await this._closeClientWithoutEvents(client);
        } catch (closeErr) {
          this.logger.log(
            "Failed to close Improv client after init error:",
            closeErr,
          );
        }
        this.logger.log(`Improv initialization failed: ${improvErr.message}`);
        this._error = `Improv initialization failed: ${improvErr.message}`;
        this._state = "ERROR";
      }
    } else {
      this._state = "DASHBOARD";
    }

    // If dialog was removed from DOM, add it back
    if (!this.parentNode) {
      document.body.appendChild(this);
      this.logger.log("Dialog re-added to DOM");
    }

    this.requestUpdate(); // Force UI update after state changes

    // Additional check to ensure dialog is visible
    await new Promise((resolve) => setTimeout(resolve, 100));
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
    // CRITICAL: Always remove event listener BEFORE closing
    // This prevents the disconnect event from firing and showing error dialog
    client.removeEventListener("disconnect", this._handleDisconnect);

    // Then close the client
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
