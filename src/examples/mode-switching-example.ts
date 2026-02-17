/**
 * Example usage of Mode Switching Flows
 * This file demonstrates how to use the mode switching functionality
 * in esp-web-tools for ESP32 devices
 */

import {
  enterConsoleModeWithS2Handling,
  exitConsoleMode,
  resetInConsoleMode,
  resetS2ConsoleMode,
  isESP32S2,
  isConsoleResetSupported,
  isUsingWebUSB,
  type ModeSwitchingCallbacks,
} from "../mode-switching";

/**
 * Example 1: Enter Console Mode (Bootloader → Firmware)
 * Use this when you want to switch from bootloader to firmware mode
 * to access console/logs
 */
export async function exampleEnterConsoleMode(esploader: any) {
  console.log("=== Example: Enter Console Mode ===");

  const callbacks: ModeSwitchingCallbacks = {
    onLog: (msg) => console.log(`[LOG] ${msg}`),
    onError: (msg) => console.error(`[ERROR] ${msg}`),
    onPortChange: async (message, reason) => {
      console.log(`Port change requested: ${message} (${reason})`);
      
      // Show modal to user
      alert(message);
      
      // Request new port
      if (isUsingWebUSB()) {
        const requestSerialPort = (globalThis as any).requestSerialPort;
        return await requestSerialPort();
      } else {
        return await navigator.serial.requestPort();
      }
    },
  };

  try {
    await enterConsoleModeWithS2Handling(esploader, callbacks);
    console.log("✓ Successfully entered console mode");
  } catch (err: any) {
    console.error("✗ Failed to enter console mode:", err.message);
  }
}

/**
 * Example 2: Exit Console Mode (Firmware → Bootloader)
 * Use this when you want to return from console mode to bootloader
 * for flashing or other operations
 */
export async function exampleExitConsoleMode(esploader: any) {
  console.log("=== Example: Exit Console Mode ===");

  const callbacks: ModeSwitchingCallbacks = {
    onLog: (msg) => console.log(`[LOG] ${msg}`),
    onError: (msg) => console.error(`[ERROR] ${msg}`),
    onPortChange: async (message, reason) => {
      console.log(`Port change requested: ${message} (${reason})`);
      alert(message);
      
      if (isUsingWebUSB()) {
        const requestSerialPort = (globalThis as any).requestSerialPort;
        return await requestSerialPort();
      } else {
        return await navigator.serial.requestPort();
      }
    },
  };

  try {
    const needsReconnect = await exitConsoleMode(esploader, callbacks);
    if (needsReconnect) {
      console.log("✓ Exited console mode - manual reconnection performed");
    } else {
      console.log("✓ Exited console mode - port stayed open");
    }
  } catch (err: any) {
    console.error("✗ Failed to exit console mode:", err.message);
  }
}

/**
 * Example 3: Reset in Console Mode
 * Use this to reset the device while in console mode
 * Note: Not supported for ESP32-S2 USB-JTAG/CDC
 */
export async function exampleResetConsoleMode(esploader: any) {
  console.log("=== Example: Reset in Console Mode ===");

  // Check if console reset is supported
  if (!isConsoleResetSupported(esploader)) {
    console.warn("⚠ Console reset not supported for this device");
    console.log("Use resetS2ConsoleMode() for ESP32-S2 instead");
    return;
  }

  const callbacks: ModeSwitchingCallbacks = {
    onLog: (msg) => console.log(`[LOG] ${msg}`),
    onError: (msg) => console.error(`[ERROR] ${msg}`),
  };

  try {
    await resetInConsoleMode(esploader, callbacks);
    console.log("✓ Device reset in console mode");
  } catch (err: any) {
    console.error("✗ Failed to reset in console mode:", err.message);
  }
}

/**
 * Example 4: ESP32-S2 Console Reset (Special Flow)
 * Use this for ESP32-S2 devices which require special handling
 * Requires two port selections: bootloader and firmware
 */
export async function exampleS2ConsoleReset(esploader: any) {
  console.log("=== Example: ESP32-S2 Console Reset ===");

  if (!isESP32S2(esploader)) {
    console.log("Not an ESP32-S2 device, using standard reset");
    await exampleResetConsoleMode(esploader);
    return;
  }

  const callbacks: ModeSwitchingCallbacks = {
    onLog: (msg) => console.log(`[LOG] ${msg}`),
    onError: (msg) => console.error(`[ERROR] ${msg}`),
    onPortChange: async (message, reason) => {
      console.log(`Port change requested: ${message} (${reason})`);
      
      // Show appropriate message based on reason
      if (reason === "s2-reset-bootloader") {
        alert("Step 1/2: Select bootloader port for WDT reset");
      } else if (reason === "s2-reset-console") {
        alert("Step 2/2: Select firmware port for console");
      } else {
        alert(message);
      }
      
      if (isUsingWebUSB()) {
        const requestSerialPort = (globalThis as any).requestSerialPort;
        return await requestSerialPort();
      } else {
        return await navigator.serial.requestPort();
      }
    },
  };

  try {
    await resetS2ConsoleMode(esploader, callbacks);
    console.log("✓ ESP32-S2 console reset complete");
  } catch (err: any) {
    console.error("✗ Failed to reset ESP32-S2 console:", err.message);
  }
}

/**
 * Example 5: Complete Console Session Flow
 * Demonstrates a complete flow: enter console, do work, exit console
 */
export async function exampleCompleteConsoleSession(esploader: any) {
  console.log("=== Example: Complete Console Session ===");

  const callbacks: ModeSwitchingCallbacks = {
    onLog: (msg) => console.log(`[LOG] ${msg}`),
    onError: (msg) => console.error(`[ERROR] ${msg}`),
    onPortChange: async (message, reason) => {
      console.log(`Port change: ${message} (${reason})`);
      alert(message);
      
      if (isUsingWebUSB()) {
        const requestSerialPort = (globalThis as any).requestSerialPort;
        return await requestSerialPort();
      } else {
        return await navigator.serial.requestPort();
      }
    },
  };

  try {
    // Step 1: Enter console mode
    console.log("Step 1: Entering console mode...");
    await enterConsoleModeWithS2Handling(esploader, callbacks);
    console.log("✓ Console mode active");

    // Step 2: Do console work (read logs, etc.)
    console.log("Step 2: Console is now active - you can read logs here");
    // ... your console work here ...
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate work

    // Step 3: Reset if needed (optional)
    if (isConsoleResetSupported(esploader)) {
      console.log("Step 3: Resetting device in console mode...");
      await resetInConsoleMode(esploader, callbacks);
      console.log("✓ Device reset");
    } else {
      console.log("Step 3: Skipping reset (not supported for this device)");
    }

    // Step 4: Exit console mode
    console.log("Step 4: Exiting console mode...");
    await exitConsoleMode(esploader, callbacks);
    console.log("✓ Returned to bootloader mode");

    console.log("=== Console session complete ===");
  } catch (err: any) {
    console.error("✗ Console session failed:", err.message);
  }
}

/**
 * Example 6: Flash → Console Flow
 * Common pattern: flash firmware, then immediately open console
 */
export async function exampleFlashAndConsole(esploader: any, firmwareData: Uint8Array) {
  console.log("=== Example: Flash and Console ===");

  const callbacks: ModeSwitchingCallbacks = {
    onLog: (msg) => console.log(`[LOG] ${msg}`),
    onError: (msg) => console.error(`[ERROR] ${msg}`),
    onPortChange: async (message, reason) => {
      alert(message);
      if (isUsingWebUSB()) {
        const requestSerialPort = (globalThis as any).requestSerialPort;
        return await requestSerialPort();
      } else {
        return await navigator.serial.requestPort();
      }
    },
  };

  try {
    // Step 1: Flash firmware (assuming esploader is in bootloader mode)
    console.log("Step 1: Flashing firmware...");
    // ... flash firmware here ...
    console.log("✓ Firmware flashed");

    // Step 2: Enter console mode to see boot logs
    console.log("Step 2: Entering console mode to view boot logs...");
    await enterConsoleModeWithS2Handling(esploader, callbacks);
    console.log("✓ Console mode active - boot logs visible");

    // Now you can read console output
    // ... read console here ...

  } catch (err: any) {
    console.error("✗ Flash and console failed:", err.message);
  }
}

/**
 * Example 7: Detect Device Capabilities
 * Check what mode switching features are supported
 */
export function exampleDetectCapabilities(esploader: any) {
  console.log("=== Example: Detect Device Capabilities ===");

  const isS2 = isESP32S2(esploader);
  const consoleResetSupported = isConsoleResetSupported(esploader);
  const usingWebUSB = isUsingWebUSB();

  console.log(`Device: ${esploader.chipName || "Unknown"}`);
  console.log(`Chip Family: 0x${(esploader.chipFamily || 0).toString(16).padStart(8, "0")}`);
  console.log(`Is ESP32-S2: ${isS2 ? "YES" : "NO"}`);
  console.log(`Console Reset Supported: ${consoleResetSupported ? "YES" : "NO"}`);
  console.log(`Using WebUSB (Android): ${usingWebUSB ? "YES" : "NO"}`);

  if (isS2) {
    console.log("\n⚠ ESP32-S2 Special Requirements:");
    console.log("  - Port changes during mode switching");
    console.log("  - Console reset requires two port selections");
    console.log("  - Use resetS2ConsoleMode() for console reset");
  }

  if (!consoleResetSupported) {
    console.log("\n⚠ Console Reset Not Supported:");
    console.log("  - Any reset in console mode will lose USB port");
    console.log("  - Use exitConsoleMode() then enterConsoleMode() instead");
  }
}

/**
 * Example 8: Error Handling
 * Demonstrates proper error handling for mode switching
 */
export async function exampleErrorHandling(esploader: any) {
  console.log("=== Example: Error Handling ===");

  const callbacks: ModeSwitchingCallbacks = {
    onLog: (msg) => console.log(`[LOG] ${msg}`),
    onError: (msg) => console.error(`[ERROR] ${msg}`),
    onPortChange: async (message, reason) => {
      try {
        alert(message);
        if (isUsingWebUSB()) {
          const requestSerialPort = (globalThis as any).requestSerialPort;
          return await requestSerialPort();
        } else {
          return await navigator.serial.requestPort();
        }
      } catch (err: any) {
        // User cancelled port selection
        throw new Error(`Port selection cancelled: ${err.message}`);
      }
    },
  };

  try {
    await enterConsoleModeWithS2Handling(esploader, callbacks);
    console.log("✓ Success");
  } catch (err: any) {
    // Handle different error types
    if (err.message.includes("cancelled")) {
      console.log("ℹ User cancelled operation");
    } else if (err.message.includes("Port")) {
      console.error("✗ Port error:", err.message);
      console.log("Try: Close other applications using the port");
    } else if (err.message.includes("USB")) {
      console.error("✗ USB error:", err.message);
      console.log("Try: Reconnect the device");
    } else {
      console.error("✗ Unknown error:", err.message);
    }
  }
}
