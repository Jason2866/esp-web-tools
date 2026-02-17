/**
 * Mode Switching Utilities for ESP32 devices
 * Handles transitions between bootloader and firmware modes
 * Based on esp32tool implementation
 */

import { sleep } from "./util/sleep";

export interface ModeSwitchingCallbacks {
  onPortChange?: (message: string, reason: string) => Promise<SerialPort>;
  onLog?: (message: string) => void;
  onError?: (message: string) => void;
}

/**
 * Set baudrate on ESP stub
 * @param espStub - ESP stub instance
 * @param baudRate - Target baudrate
 * @param callbacks - Logging callbacks
 */
export async function setBaudrate(
  espStub: any,
  baudRate: number,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<void> {
  const { onLog, onError } = callbacks;

  if (!espStub || !espStub.IS_STUB) {
    onError?.("Cannot set baudrate: stub not loaded");
    return;
  }

  const currentBaud = espStub.currentBaudRate || 115200;
  
  if (currentBaud === baudRate) {
    onLog?.(`Baudrate already at ${baudRate}, skipping`);
    return;
  }

  onLog?.(`Setting baudrate from ${currentBaud} to ${baudRate}...`);
  
  try {
    await espStub.setBaudrate(baudRate);
    onLog?.(`Baudrate set to ${baudRate}`);
    // Update currentBaudRate to prevent re-setting
    espStub.currentBaudRate = baudRate;
  } catch (err: any) {
    onError?.(`Failed to set baudrate: ${err.message}`);
    // Assume baudrate is already correct if setBaudrate fails
    espStub.currentBaudRate = baudRate;
  }
}

/**
 * Ensure baudrate is set for FLASH operations (BOOTLOADER mode)
 * Flash operations use HIGH SPEED baudrate (e.g. 460800 or user-specified)
 * 
 * IMPORTANT: Only use this for BOOTLOADER/FLASH mode!
 * For FIRMWARE/CONSOLE mode, always use 115200 (see resetBaudrateForConsole)
 * 
 * @param espStub - ESP stub instance
 * @param baudRate - Target baudrate for flash operations (typically 460800 or higher)
 * @param callbacks - Logging callbacks
 */
export async function ensureFlashBaudrate(
  espStub: any,
  baudRate: number | undefined,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<void> {
  const { onLog } = callbacks;

  // Only set if baudrate is specified and > 115200
  if (!baudRate || baudRate <= 115200) {
    onLog?.("Using default baudrate (115200) for flash operations");
    return;
  }

  onLog?.(`Setting FLASH baudrate to ${baudRate} for high-speed operations`);
  await setBaudrate(espStub, baudRate, callbacks);
}

/**
 * Reset baudrate to 115200 for CONSOLE mode (FIRMWARE mode)
 * Firmware console ALWAYS runs at 115200 baud
 * 
 * IMPORTANT: Only use this when switching to FIRMWARE/CONSOLE mode!
 * For BOOTLOADER/FLASH mode, use ensureFlashBaudrate with high speed
 * 
 * @param espStub - ESP stub instance
 * @param callbacks - Logging callbacks
 */
export async function resetBaudrateForConsole(
  espStub: any,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<void> {
  const { onLog } = callbacks;

  if (!espStub || !espStub.IS_STUB) {
    onLog?.("No stub loaded, skipping baudrate reset");
    return;
  }

  const currentBaud = espStub.currentBaudRate || 115200;
  
  if (currentBaud === 115200) {
    onLog?.("Baudrate already at 115200 for console");
    return;
  }

  onLog?.(`Resetting baudrate from ${currentBaud} to 115200 for CONSOLE/FIRMWARE mode`);
  await setBaudrate(espStub, 115200, callbacks);
}

/**
 * Release reader and writer locks on serial port
 * Handles both stub and parent loader
 * @param esploader - ESP loader instance
 * @param espStub - ESP stub instance (optional)
 * @param callbacks - Logging callbacks
 */
export async function releaseReaderWriter(
  esploader: any,
  espStub: any | undefined,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<void> {
  const { onLog } = callbacks;

  // Find the actual object that has the reader
  // The stub has a _parent pointer, and the reader runs on the parent!
  let readerOwner = espStub || esploader;
  if (readerOwner._parent) {
    readerOwner = readerOwner._parent;
    onLog?.("Using parent loader for reader/writer");
  }

  // Cancel the reader on the correct object
  if (readerOwner._reader) {
    const reader = readerOwner._reader;
    try {
      await reader.cancel();
      onLog?.("Reader cancelled on correct object");
    } catch (err) {
      onLog?.(`Reader cancel failed: ${err}`);
    }
    try {
      reader.releaseLock();
      onLog?.("Reader released");
    } catch (err) {
      onLog?.(`Reader releaseLock failed: ${err}`);
    }
    readerOwner._reader = undefined;
  }

  // Release the writer on the correct object
  if (readerOwner._writer) {
    const writer = readerOwner._writer;
    readerOwner._writer = undefined;

    try {
      writer.releaseLock();
      onLog?.("Writer lock released");
    } catch (err) {
      onLog?.(`Writer releaseLock failed: ${err}`);
    }
  }

  // For WebUSB (Android), ALWAYS recreate streams
  // This is CRITICAL for console to work - WebUSB needs fresh streams
  // Even if no locks were held, streams may have been consumed by other operations
  if (esploader.isWebUSB && esploader.isWebUSB()) {
    try {
      onLog?.("WebUSB detected - recreating streams");
      await (esploader.port as any).recreateStreams();
      await sleep(200);
      onLog?.("WebUSB streams recreated and ready");
    } catch (err: any) {
      onLog?.(`Failed to recreate WebUSB streams: ${err.message}`);
    }
  }
}

/**
 * Perform hardware reset to firmware mode
 * Handles stream recreation for WebUSB
 * @param esploader - ESP loader instance
 * @param callbacks - Logging callbacks
 */
export async function hardResetToFirmware(
  esploader: any,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<void> {
  const { onLog } = callbacks;

  try {
    onLog?.("Performing hardware reset to firmware mode...");
    await esploader.hardReset(false); // false = firmware mode (GPIO0=HIGH)
    onLog?.("Hardware reset sent");
  } catch (err: any) {
    onLog?.(`Reset error (expected): ${err.message}`);
  }

  // Wait for reset to complete
  await sleep(500);
}

/**
 * Perform hardware reset to bootloader mode
 * @param esploader - ESP loader instance
 * @param callbacks - Logging callbacks
 */
export async function hardResetToBootloader(
  esploader: any,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<void> {
  const { onLog } = callbacks;

  try {
    onLog?.("Performing hardware reset to bootloader mode...");
    await esploader.hardReset(true); // true = bootloader mode (GPIO0=LOW)
    onLog?.("Hardware reset sent");
  } catch (err: any) {
    onLog?.(`Reset error (expected): ${err.message}`);
  }

  // Wait for reset to complete
  await sleep(500);
}


/**
 * Check if device is ESP32-S2
 */
export function isESP32S2(esploader: any): boolean {
  return esploader.chipFamily === 0x00000002; // CHIP_FAMILY_ESP32S2
}

/**
 * Check if device is ESP32-P4
 */
export function isESP32P4(esploader: any): boolean {
  return esploader.chipFamily === 0x00000012; // CHIP_FAMILY_ESP32P4
}

/**
 * Check if device is USB-OTG chip (S2 or P4)
 */
export function isUsbOtgChip(esploader: any): boolean {
  return isESP32S2(esploader) || isESP32P4(esploader);
}

/**
 * Check if console reset is supported
 * ESP32-S2 USB-JTAG/CDC does not support reset in console mode
 */
export function isConsoleResetSupported(esploader: any): boolean {
  // For ESP32-S2: if _isUsbJtagOrOtg is undefined, assume USB-JTAG/OTG (conservative)
  const isS2UsbJtag =
    isESP32S2(esploader) &&
    (esploader.isUsbJtagOrOtg === true ||
      esploader.isUsbJtagOrOtg === undefined);
  return !isS2UsbJtag;
}

/**
 * Detect if device is using WebUSB (Android)
 */
export function isUsingWebUSB(): boolean {
  return (globalThis as any).requestSerialPort !== undefined;
}

/**
 * Check if device is WebUSB with external serial chip
 * @param esploader - ESP loader instance
 * @returns true if WebUSB with external serial chip, false otherwise
 */
export async function isWebUsbWithExternalSerial(
  esploader: any,
): Promise<boolean> {
  const isWebUsb = esploader.isWebUSB && esploader.isWebUSB();
  if (!isWebUsb) {
    return false;
  }

  // Check if USB-JTAG/OTG (built-in USB)
  let isUsbJtag = false;
  try {
    if (typeof esploader.detectUsbConnectionType === "function") {
      isUsbJtag = await esploader.detectUsbConnectionType();
    }
  } catch (err) {
    // If detection fails, assume external serial (conservative)
    return true;
  }

  // WebUSB but NOT USB-JTAG = external serial
  return !isUsbJtag;
}

/**
 * Enter console mode (bootloader → firmware)
 * Returns true if port was closed and needs to be reopened
 */
export async function enterConsoleMode(
  esploader: any,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<boolean> {
  const { onLog, onError } = callbacks;

  // Check if enterConsoleMode method exists on esploader
  if (typeof esploader.enterConsoleMode === "function") {
    onLog?.("Using esploader.enterConsoleMode()");
    return await esploader.enterConsoleMode();
  }

  // Fallback implementation if method doesn't exist
  onLog?.("Entering console mode...");

  // Reset baudrate to 115200 for console (firmware always runs at 115200)
  await resetBaudrateForConsole(esploader, callbacks);

  // Check if port is open
  if (!esploader.port?.writable || !esploader.port?.readable) {
    onLog?.("Port is not open - port selection needed");
    return true;
  }

  // Detect USB connection type
  let isUsbJtag = false;
  try {
    if (typeof esploader.detectUsbConnectionType === "function") {
      isUsbJtag = await esploader.detectUsbConnectionType();
      onLog?.(
        `USB connection type: ${isUsbJtag ? "USB-JTAG/OTG" : "External Serial Chip"}`,
      );
    }
  } catch (err: any) {
    onError?.(`USB detection failed: ${err.message}`);
  }

  if (isUsbJtag) {
    // USB-JTAG/OTG: Port will close after reset
    onLog?.("USB-JTAG/OTG device: Port will close after reset");

    // Perform reset to firmware
    try {
      if (typeof esploader.hardReset === "function") {
        await esploader.hardReset(false); // false = firmware mode (GPIO0=HIGH)
      }
    } catch (err: any) {
      onError?.(`Reset failed: ${err.message}`);
    }

    await sleep(500);
    return true; // Port closed, needs reopening
  } else {
    // External serial chip: Port stays open
    onLog?.("External serial chip: Port stays open");

    try {
      if (typeof esploader.hardReset === "function") {
        await esploader.hardReset(false); // false = firmware mode
      }
    } catch (err: any) {
      onError?.(`Reset failed: ${err.message}`);
    }

    await sleep(200);
    return false; // Port stays open
  }
}

/**
 * Exit console mode (firmware → bootloader)
 * Returns true if manual reconnection is needed
 */
export async function exitConsoleMode(
  esploader: any,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<boolean> {
  const { onLog, onError } = callbacks;

  // Check if exitConsoleMode method exists on esploader
  if (typeof esploader.exitConsoleMode === "function") {
    onLog?.("Using esploader.exitConsoleMode()");
    return await esploader.exitConsoleMode();
  }

  // Fallback implementation
  onLog?.("Exiting console mode...");

  // Check if this is a USB-OTG device
  const isOtgChip = isUsbOtgChip(esploader);

  if (isOtgChip) {
    onLog?.(`${esploader.chipName} USB: Resetting to bootloader mode`);

    // Perform hardware reset to bootloader (GPIO0=LOW)
    try {
      if (typeof esploader.hardReset === "function") {
        await esploader.hardReset(true); // true = bootloader mode (GPIO0=LOW)
      }
    } catch (err: any) {
      onError?.(`Reset failed: ${err.message}`);
    }

    await sleep(500);
    onLog?.(`${esploader.chipName}: Port changed. Please select the bootloader port.`);
    return true; // Manual reconnection needed
  }

  // For other devices, use standard reconnect
  if (typeof esploader.reconnectToBootloader === "function") {
    await esploader.reconnectToBootloader();
  }

  return false;
}

/**
 * Reset device in console mode
 * Note: Not supported for ESP32-S2 USB-JTAG/CDC
 */
export async function resetInConsoleMode(
  esploader: any,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<void> {
  const { onLog, onError } = callbacks;

  // Check if resetInConsoleMode method exists
  if (typeof esploader.resetInConsoleMode === "function") {
    onLog?.("Using esploader.resetInConsoleMode()");
    await esploader.resetInConsoleMode();
    return;
  }

  // Check if console reset is supported
  if (!isConsoleResetSupported(esploader)) {
    onLog?.(
      "Console reset not supported for ESP32-S2 USB-JTAG/CDC - port would be lost",
    );
    return;
  }

  // Perform firmware reset
  onLog?.("Resetting device in console mode...");
  try {
    if (typeof esploader.hardReset === "function") {
      await esploader.hardReset(false); // false = firmware mode
    }
    onLog?.("Device reset complete");
  } catch (err: any) {
    onError?.(`Reset failed: ${err.message}`);
    throw err;
  }
}

/**
 * Sync and WDT reset for ESP32-S2 USB-OTG
 * Opens bootloader port, syncs with ROM, and fires WDT reset
 */
export async function syncAndWdtReset(
  esploader: any,
  newPort: SerialPort,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<void> {
  const { onLog, onError } = callbacks;

  // Check if syncAndWdtReset method exists
  if (typeof esploader.syncAndWdtReset === "function") {
    onLog?.("Using esploader.syncAndWdtReset()");
    await esploader.syncAndWdtReset(newPort);
    return;
  }

  // Fallback implementation
  onLog?.("Opening bootloader port at 115200...");

  try {
    await newPort.open({ baudRate: 115200 });
  } catch (err: any) {
    onError?.(`Failed to open port: ${err.message}`);
    throw err;
  }

  await sleep(100);

  // Sync with ROM
  onLog?.("Syncing with bootloader ROM...");
  try {
    if (typeof esploader.sync === "function") {
      await esploader.sync();
    }
    onLog?.("Bootloader sync OK");
  } catch (err: any) {
    onError?.(`Sync failed: ${err.message}`);
    throw err;
  }

  // Fire WDT reset
  onLog?.("Firing WDT reset...");
  try {
    if (typeof esploader.rtcWdtResetChipSpecific === "function") {
      await esploader.rtcWdtResetChipSpecific();
    } else if (typeof esploader.watchdogReset === "function") {
      await esploader.watchdogReset();
    }
    onLog?.("WDT reset fired - device will boot to firmware");
  } catch (err: any) {
    onError?.(`WDT reset failed: ${err.message}`);
    throw err;
  }
}

/**
 * Reconnect to bootloader mode
 * Closes and reopens port, then resets to bootloader
 */
export async function reconnectToBootloader(
  esploader: any,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<void> {
  const { onLog, onError } = callbacks;

  // Check if reconnectToBootloader method exists
  if (typeof esploader.reconnectToBootloader === "function") {
    onLog?.("Using esploader.reconnectToBootloader()");
    await esploader.reconnectToBootloader();
    return;
  }

  // Fallback implementation
  onLog?.("Reconnecting to bootloader mode...");

  const port = esploader.port;
  if (!port) {
    onError?.("No port available");
    throw new Error("No port available");
  }

  // Close port
  try {
    await port.close();
    onLog?.("Port closed");
  } catch (err: any) {
    onLog?.(`Port close error: ${err.message}`);
  }

  await sleep(100);

  // Reopen port
  try {
    await port.open({ baudRate: 115200 });
    onLog?.("Port reopened at 115200 baud");
  } catch (err: any) {
    onError?.(`Failed to reopen port: ${err.message}`);
    throw err;
  }

  await sleep(100);

  // Reset to bootloader
  try {
    if (typeof esploader.hardReset === "function") {
      await esploader.hardReset(true); // true = bootloader mode
    }
    onLog?.("Device reset to bootloader mode");
  } catch (err: any) {
    onError?.(`Reset failed: ${err.message}`);
    throw err;
  }
}

/**
 * Show modal for ESP32-S2 port selection
 * Returns a promise that resolves when user clicks reconnect
 */
export function showS2Modal(
  title: string,
  message: string,
): Promise<void> {
  return new Promise((resolve) => {
    // Create modal element
    const modal = document.createElement("div");
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    const content = document.createElement("div");
    content.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 8px;
      max-width: 400px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    const titleEl = document.createElement("h2");
    titleEl.textContent = title;
    titleEl.style.cssText = "margin: 0 0 16px 0; font-size: 20px;";

    const messageEl = document.createElement("p");
    messageEl.textContent = message;
    messageEl.style.cssText = "margin: 0 0 24px 0; color: #666;";

    const button = document.createElement("button");
    button.textContent = "Reconnect";
    button.style.cssText = `
      background: #0066cc;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;

    button.addEventListener("click", () => {
      document.body.removeChild(modal);
      resolve();
    });

    content.appendChild(titleEl);
    content.appendChild(messageEl);
    content.appendChild(button);
    modal.appendChild(content);
    document.body.appendChild(modal);
  });
}

/**
 * Complete flow for entering console mode with ESP32-S2 handling
 */
export async function enterConsoleModeWithS2Handling(
  esploader: any,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<void> {
  const { onPortChange, onLog, onError } = callbacks;

  onLog?.("Entering console mode...");

  // Enter console mode
  const portClosed = await enterConsoleMode(esploader, callbacks);

  if (portClosed) {
    // Port was closed - need to reopen
    onLog?.("Port closed after reset - waiting for device to boot...");

    const isWebUSB = isUsingWebUSB();
    const waitTime = isWebUSB ? 1000 : 500;
    await sleep(waitTime);

    // Check if this is ESP32-S2 or WebUSB (both need modal)
    const isS2 = isESP32S2(esploader);
    const needsModal = isS2 || isWebUSB;

    if (needsModal) {
      // Show modal for user gesture
      const portLabel = isWebUSB ? "USB device" : "serial port";
      await showS2Modal(
        "Device has been reset to firmware mode",
        `Please click the button below to select the ${portLabel} for console.`,
      );
    }

    // Request new port
    if (onPortChange) {
      const newPort = await onPortChange(
        "Select console port",
        "enter-console",
      );
      esploader.port = newPort;

      // Open port
      try {
        await newPort.open({ baudRate: 115200 });
        onLog?.("Console port opened");
      } catch (err: any) {
        onError?.(`Failed to open console port: ${err.message}`);
        throw err;
      }
    } else {
      throw new Error("Port change callback not provided");
    }
  } else {
    onLog?.("Port stayed open - console mode ready");
  }
}

/**
 * Prepare device for Improv WiFi provisioning
 * Handles all device types: WebSerial, WebUSB CDC, WebUSB external serial
 * @param esploader - ESP loader instance
 * @param espStub - ESP stub instance (optional)
 * @param callbacks - Logging callbacks
 */
export async function prepareForImprovProvisioning(
  esploader: any,
  espStub: any | undefined,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<void> {
  const { onLog } = callbacks;

  onLog?.("Preparing device for Improv WiFi provisioning...");

  // Detect device type
  const isWebUsbExternal = await isWebUsbWithExternalSerial(esploader);
  const isWebUsbCdc =
    esploader.isWebUSB && esploader.isWebUSB() && !isWebUsbExternal;

  if (isWebUsbCdc) {
    // WebUSB CDC: Release locks, hardReset, release locks again
    onLog?.("WebUSB CDC: Resetting device for Wi-Fi setup...");

    try {
      // Release locks BEFORE reset
      await releaseReaderWriter(esploader, espStub, callbacks);

      // Reset device to firmware mode
      await hardResetToFirmware(esploader, callbacks);

      // CRITICAL: hardReset consumes streams, recreate them
      await releaseReaderWriter(esploader, espStub, callbacks);
      onLog?.("Streams recreated after reset");

      // Wait for device to boot
      await sleep(500);
    } catch (err: any) {
      onLog?.(`Reset error: ${err.message}`);
    }
  } else {
    // WebSerial or WebUSB external serial: Just release locks
    if (isWebUsbExternal) {
      onLog?.("WebUSB external serial: Preparing port for Wi-Fi setup...");
    } else {
      onLog?.("WebSerial: Preparing port for Wi-Fi setup...");
    }

    await releaseReaderWriter(esploader, espStub, callbacks);
    await sleep(500);
  }

  onLog?.("Port ready for Improv client");

  // CRITICAL: Flush serial buffer one more time
  // Firmware debug messages can interfere with Improv protocol
  onLog?.("Flushing serial buffer before Improv init...");
  await releaseReaderWriter(esploader, espStub, callbacks);
  await sleep(100);

  onLog?.("Device ready for Improv WiFi provisioning");
}

/**
 * Prepare device for Improv testing
 * Releases locks and optionally resets device
 * @param esploader - ESP loader instance
 * @param espStub - ESP stub instance (optional)
 * @param skipReset - Skip hardware reset (default: false)
 * @param callbacks - Logging callbacks
 */
export async function prepareForImprovTest(
  esploader: any,
  espStub: any | undefined,
  skipReset: boolean = false,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<void> {
  const { onLog } = callbacks;

  if (!skipReset) {
    onLog?.("Resetting device for Improv detection...");

    // Release locks before reset
    await releaseReaderWriter(esploader, espStub, callbacks);

    try {
      await hardResetToFirmware(esploader, callbacks);

      // CRITICAL: hardReset consumes the streams
      // Need to recreate them before Improv can use the port
      await releaseReaderWriter(esploader, espStub, callbacks);
      onLog?.("Streams recreated after reset");

      // Wait for device to boot up
      onLog?.("Waiting for firmware to be ready for Improv test...");
      await sleep(500);
    } catch (resetErr: any) {
      onLog?.(`Failed to reset device: ${resetErr.message}`);
      // Continue anyway
    }
  }

  // CRITICAL: Flush serial buffer one more time
  // Firmware debug messages can interfere with Improv protocol
  onLog?.("Flushing serial buffer before Improv init...");
  await releaseReaderWriter(esploader, espStub, callbacks);
  await sleep(100);

  onLog?.("Device ready for Improv test");
}

/**
 * Complete flow for ESP32-S2 console reset
 * Requires two port selections: bootloader and firmware
 */
export async function resetS2ConsoleMode(
  esploader: any,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<void> {
  const { onPortChange, onLog } = callbacks;

  if (!isESP32S2(esploader)) {
    // Not S2, use simple reset
    await resetInConsoleMode(esploader, callbacks);
    return;
  }

  onLog?.("ESP32-S2 console reset: entering bootloader, then WDT reset to firmware...");

  // Exit console mode (firmware → bootloader)
  const needsReconnect = await exitConsoleMode(esploader, callbacks);

  if (needsReconnect) {
    const isWebUSB = isUsingWebUSB();
    const waitTime = isWebUSB ? 1000 : 500;
    await sleep(waitTime);

    // Step 1: Select bootloader port for WDT reset
    const portLabel = isWebUSB ? "USB device" : "serial port";
    await showS2Modal(
      "Select bootloader port",
      `Select the ${portLabel} (bootloader) to reset the device.`,
    );

    if (!onPortChange) {
      throw new Error("Port change callback not provided");
    }

    const bootloaderPort = await onPortChange(
      "Select bootloader port",
      "s2-reset-bootloader",
    );

    // Sync and WDT reset
    onLog?.("Syncing with bootloader and performing WDT reset...");
    await syncAndWdtReset(esploader, bootloaderPort, callbacks);

    try {
      await bootloaderPort.close();
    } catch (e) {
      // Port may already be gone
    }

    onLog?.("Waiting for device to boot into firmware...");
    await sleep(waitTime);

    // Step 2: Select firmware port for console
    await showS2Modal(
      "Select console port",
      `Select the ${portLabel} (firmware) for console.`,
    );

    const consolePort = await onPortChange(
      "Select console port",
      "s2-reset-console",
    );

    await consolePort.open({ baudRate: 115200 });
    esploader.port = consolePort;
    onLog?.("Console reconnected after S2 reset");
  }
}

/**
 * Switch device from bootloader mode to firmware mode
 * Handles USB-JTAG/OTG devices (port closes) and external serial (port stays open)
 * @param esploader - ESP loader instance
 * @param espStub - ESP stub instance (optional)
 * @param callbacks - Logging callbacks
 * @returns true if port was closed and needs user to select new port, false otherwise
 */
export async function switchToFirmwareMode(
  esploader: any,
  espStub: any | undefined,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<boolean> {
  const { onLog, onError } = callbacks;

  const inBootloaderMode = esploader.chipFamily !== null;

  if (!inBootloaderMode) {
    onLog?.("Device already in firmware mode");
    // Even if already in firmware mode, ensure streams are ready
    await releaseReaderWriter(esploader, espStub, callbacks);
    return false; // No switch needed
  }

  onLog?.("Device is in bootloader mode - switching to firmware mode");

  // CRITICAL: Ensure chipFamily is set
  if (!esploader.chipFamily) {
    onLog?.("Detecting chip type...");
    await esploader.initialize();
    onLog?.(`Chip detected: ${esploader.chipFamily}`);
  }

  // Create stub before reset if not exists
  if (!espStub || !espStub.IS_STUB) {
    onLog?.("Creating stub for firmware mode switch...");
    espStub = await esploader.runStub();
    onLog?.(`Stub created: IS_STUB=${espStub.IS_STUB}`);
  }

  // Check if USB-JTAG/OTG device
  let isUsbJtagOrOtg = false;
  try {
    if (typeof esploader.detectUsbConnectionType === "function") {
      isUsbJtagOrOtg = await esploader.detectUsbConnectionType();
      onLog?.(
        `USB connection type: ${isUsbJtagOrOtg ? "USB-JTAG/OTG" : "External Serial Chip"}`,
      );
    }
  } catch (err: any) {
    onError?.(`USB detection failed: ${err.message}`);
  }

  if (isUsbJtagOrOtg) {
    // USB-JTAG/OTG: Need WDT reset and port reconnection
    onLog?.("USB-JTAG/OTG device: Port will close after reset");

    // CRITICAL: Release locks BEFORE calling resetToFirmware()
    await releaseReaderWriter(esploader, espStub, callbacks);

    try {
      // CRITICAL: Forget the old port so browser doesn't show it in selection
      const port = esploader.port;
      if (port && typeof port.forget === "function") {
        try {
          await port.forget();
          onLog?.("Old port forgotten");
        } catch (forgetErr: any) {
          onLog?.(`Port forget failed: ${forgetErr.message}`);
        }
      }

      // Use resetToFirmware() for CDC - does WDT reset
      if (typeof esploader.resetToFirmware === "function") {
        await esploader.resetToFirmware();
        onLog?.("Device reset to firmware mode - port closed");
      }
    } catch (err: any) {
      onLog?.(`Reset to firmware error (expected): ${err.message}`);
    }

    // Reset ESP state
    await sleep(100);
    return true; // Port closed, needs reopening
  } else {
    // External serial chip: Can reset to firmware without port change
    onLog?.("External serial chip - resetting to firmware mode");

    // Call hardReset BEFORE releasing locks (so it can communicate)
    await hardResetToFirmware(esploader, callbacks);

    // Wait for reset to complete
    await sleep(500);

    // NOW release locks AFTER reset
    onLog?.("Releasing reader/writer after reset...");
    await releaseReaderWriter(esploader, espStub, callbacks);

    return false; // No port reconnection needed
  }
}

/**
 * Prepare streams for Improv or console operations
 * Just releases locks and waits - simple wrapper for common pattern
 * @param esploader - ESP loader instance
 * @param espStub - ESP stub instance (optional)
 * @param callbacks - Logging callbacks
 */
export async function prepareStreamsForOperation(
  esploader: any,
  espStub: any | undefined,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<void> {
  const { onLog } = callbacks;

  onLog?.("Preparing streams for operation...");
  await releaseReaderWriter(esploader, espStub, callbacks);
  await sleep(200);
  onLog?.("Streams ready");
}

/**
 * Ensure stub is initialized and ready for FLASH operations
 * Sets HIGH SPEED baudrate for fast flashing (bootloader mode)
 * 
 * @param esploader - ESP loader instance
 * @param existingStub - Existing stub instance (optional)
 * @param baudRate - Target baudrate for flash operations (e.g. 460800)
 * @param callbacks - Logging callbacks
 * @returns ESP stub instance ready for flash operations
 */
export async function ensureStubForFlash(
  esploader: any,
  existingStub: any | undefined,
  baudRate: number | undefined,
  callbacks: ModeSwitchingCallbacks = {},
): Promise<any> {
  const { onLog, onError } = callbacks;

  // Check if stub already exists and is valid
  if (existingStub && existingStub.IS_STUB) {
    onLog?.(`Existing stub: IS_STUB=${existingStub.IS_STUB}`);

    // Ensure HIGH SPEED baudrate is set for FLASH operations (bootloader mode)
    await ensureFlashBaudrate(existingStub, baudRate, callbacks);

    return existingStub;
  }

  // Initialize if not already done
  if (!esploader.chipFamily) {
    onLog?.("Initializing ESP loader...");

    // Try twice before giving up
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (attempt > 1) {
          onLog?.(`Retry attempt ${attempt}/2...`);
          await sleep(500); // Wait before retry
        }
        await esploader.initialize();
        onLog?.(`Found chip: ${esploader.chipFamily}`);
        break; // Success!
      } catch (err: any) {
        onError?.(`Connection failed to stub (attempt ${attempt}/2): ${err.message}`);
        if (attempt === 2) {
          // Both attempts failed
          throw new Error(`Failed to connect to ESP after 2 attempts: ${err.message}`);
        }
      }
    }
  }

  // Run stub - chip properties are now automatically inherited from parent
  onLog?.("Running stub...");
  const espStub = await esploader.runStub();

  onLog?.(`Stub created: IS_STUB=${espStub.IS_STUB}`);

  // Set HIGH SPEED baudrate for FLASH operations (bootloader mode)
  await ensureFlashBaudrate(espStub, baudRate, callbacks);

  onLog?.("Stub ready for flash operations");
  return espStub;
}
