/**
 * Tests for Mode Switching functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isESP32S2,
  isESP32P4,
  isUsbOtgChip,
  isConsoleResetSupported,
  isUsingWebUSB,
  enterConsoleMode,
  exitConsoleMode,
  resetInConsoleMode,
} from "./mode-switching";

describe("Mode Switching - Device Detection", () => {
  it("should detect ESP32-S2", () => {
    const esploader = { chipFamily: 0x00000002 }; // CHIP_FAMILY_ESP32S2
    expect(isESP32S2(esploader)).toBe(true);
  });

  it("should detect ESP32-P4", () => {
    const esploader = { chipFamily: 0x00000012 }; // CHIP_FAMILY_ESP32P4
    expect(isESP32P4(esploader)).toBe(true);
  });

  it("should detect USB-OTG chip (S2)", () => {
    const esploader = { chipFamily: 0x00000002 };
    expect(isUsbOtgChip(esploader)).toBe(true);
  });

  it("should detect USB-OTG chip (P4)", () => {
    const esploader = { chipFamily: 0x00000012 };
    expect(isUsbOtgChip(esploader)).toBe(true);
  });

  it("should not detect non-OTG chip as OTG", () => {
    const esploader = { chipFamily: 0x00000005 }; // ESP32-C3
    expect(isUsbOtgChip(esploader)).toBe(false);
  });
});

describe("Mode Switching - Console Reset Support", () => {
  it("should not support console reset for ESP32-S2 USB-JTAG", () => {
    const esploader = {
      chipFamily: 0x00000002,
      isUsbJtagOrOtg: true,
    };
    expect(isConsoleResetSupported(esploader)).toBe(false);
  });

  it("should support console reset for ESP32-S2 with external serial", () => {
    const esploader = {
      chipFamily: 0x00000002,
      isUsbJtagOrOtg: false,
    };
    expect(isConsoleResetSupported(esploader)).toBe(true);
  });

  it("should support console reset for ESP32-C3", () => {
    const esploader = {
      chipFamily: 0x00000005,
      isUsbJtagOrOtg: true,
    };
    expect(isConsoleResetSupported(esploader)).toBe(true);
  });

  it("should assume no support when isUsbJtagOrOtg is undefined for S2", () => {
    const esploader = {
      chipFamily: 0x00000002,
      isUsbJtagOrOtg: undefined,
    };
    expect(isConsoleResetSupported(esploader)).toBe(false);
  });
});

describe("Mode Switching - WebUSB Detection", () => {
  beforeEach(() => {
    // Reset global state
    delete (globalThis as any).requestSerialPort;
  });

  it("should detect WebUSB when requestSerialPort exists", () => {
    (globalThis as any).requestSerialPort = vi.fn();
    expect(isUsingWebUSB()).toBe(true);
  });

  it("should not detect WebUSB when requestSerialPort doesn't exist", () => {
    expect(isUsingWebUSB()).toBe(false);
  });
});

describe("Mode Switching - Enter Console Mode", () => {
  it("should use esploader.enterConsoleMode if available", async () => {
    const enterConsoleModeMock = vi.fn().mockResolvedValue(true);
    const esploader = {
      enterConsoleMode: enterConsoleModeMock,
      port: { writable: true, readable: true },
    };

    const result = await enterConsoleMode(esploader);

    expect(enterConsoleModeMock).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("should return true if port is not open", async () => {
    const esploader = {
      port: { writable: false, readable: false },
    };

    const result = await enterConsoleMode(esploader);

    expect(result).toBe(true);
  });

  it("should handle USB-JTAG devices", async () => {
    const hardResetMock = vi.fn().mockResolvedValue(undefined);
    const detectUsbConnectionTypeMock = vi.fn().mockResolvedValue(true);
    
    const esploader = {
      port: { writable: true, readable: true },
      detectUsbConnectionType: detectUsbConnectionTypeMock,
      hardReset: hardResetMock,
    };

    const result = await enterConsoleMode(esploader);

    expect(detectUsbConnectionTypeMock).toHaveBeenCalled();
    expect(hardResetMock).toHaveBeenCalledWith(false); // false = firmware mode
    expect(result).toBe(true); // Port closed
  });

  it("should handle external serial chip devices", async () => {
    const hardResetMock = vi.fn().mockResolvedValue(undefined);
    const detectUsbConnectionTypeMock = vi.fn().mockResolvedValue(false);
    
    const esploader = {
      port: { writable: true, readable: true },
      detectUsbConnectionType: detectUsbConnectionTypeMock,
      hardReset: hardResetMock,
    };

    const result = await enterConsoleMode(esploader);

    expect(detectUsbConnectionTypeMock).toHaveBeenCalled();
    expect(hardResetMock).toHaveBeenCalledWith(false);
    expect(result).toBe(false); // Port stays open
  });

  it("should call callbacks", async () => {
    const onLogMock = vi.fn();
    const onErrorMock = vi.fn();
    
    const esploader = {
      port: { writable: true, readable: true },
      detectUsbConnectionType: vi.fn().mockResolvedValue(false),
      hardReset: vi.fn().mockResolvedValue(undefined),
    };

    await enterConsoleMode(esploader, {
      onLog: onLogMock,
      onError: onErrorMock,
    });

    expect(onLogMock).toHaveBeenCalled();
  });
});

describe("Mode Switching - Exit Console Mode", () => {
  it("should use esploader.exitConsoleMode if available", async () => {
    const exitConsoleModeMock = vi.fn().mockResolvedValue(false);
    const esploader = {
      exitConsoleMode: exitConsoleModeMock,
    };

    const result = await exitConsoleMode(esploader);

    expect(exitConsoleModeMock).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("should handle USB-OTG devices (S2)", async () => {
    const hardResetMock = vi.fn().mockResolvedValue(undefined);
    
    const esploader = {
      chipFamily: 0x00000002, // ESP32-S2
      chipName: "ESP32-S2",
      hardReset: hardResetMock,
    };

    const result = await exitConsoleMode(esploader);

    expect(hardResetMock).toHaveBeenCalledWith(true); // true = bootloader mode
    expect(result).toBe(true); // Manual reconnection needed
  });

  it("should handle USB-OTG devices (P4)", async () => {
    const hardResetMock = vi.fn().mockResolvedValue(undefined);
    
    const esploader = {
      chipFamily: 0x00000012, // ESP32-P4
      chipName: "ESP32-P4",
      hardReset: hardResetMock,
    };

    const result = await exitConsoleMode(esploader);

    expect(hardResetMock).toHaveBeenCalledWith(true);
    expect(result).toBe(true);
  });

  it("should handle non-OTG devices", async () => {
    const reconnectToBootloaderMock = vi.fn().mockResolvedValue(undefined);
    
    const esploader = {
      chipFamily: 0x00000005, // ESP32-C3
      reconnectToBootloader: reconnectToBootloaderMock,
    };

    const result = await exitConsoleMode(esploader);

    expect(reconnectToBootloaderMock).toHaveBeenCalled();
    expect(result).toBe(false); // No manual reconnection needed
  });
});

describe("Mode Switching - Reset in Console Mode", () => {
  it("should use esploader.resetInConsoleMode if available", async () => {
    const resetInConsoleModeMock = vi.fn().mockResolvedValue(undefined);
    const esploader = {
      resetInConsoleMode: resetInConsoleModeMock,
    };

    await resetInConsoleMode(esploader);

    expect(resetInConsoleModeMock).toHaveBeenCalled();
  });

  it("should not reset if console reset is not supported", async () => {
    const hardResetMock = vi.fn();
    const onLogMock = vi.fn();
    
    const esploader = {
      chipFamily: 0x00000002, // ESP32-S2
      isUsbJtagOrOtg: true,
      hardReset: hardResetMock,
    };

    await resetInConsoleMode(esploader, { onLog: onLogMock });

    expect(hardResetMock).not.toHaveBeenCalled();
    expect(onLogMock).toHaveBeenCalledWith(
      expect.stringContaining("not supported")
    );
  });

  it("should reset if console reset is supported", async () => {
    const hardResetMock = vi.fn().mockResolvedValue(undefined);
    
    const esploader = {
      chipFamily: 0x00000005, // ESP32-C3
      isUsbJtagOrOtg: false,
      hardReset: hardResetMock,
    };

    await resetInConsoleMode(esploader);

    expect(hardResetMock).toHaveBeenCalledWith(false); // false = firmware mode
  });

  it("should throw error on reset failure", async () => {
    const hardResetMock = vi.fn().mockRejectedValue(new Error("Reset failed"));
    
    const esploader = {
      chipFamily: 0x00000005,
      isUsbJtagOrOtg: false,
      hardReset: hardResetMock,
    };

    await expect(resetInConsoleMode(esploader)).rejects.toThrow("Reset failed");
  });
});

describe("Mode Switching - Error Handling", () => {
  it("should handle USB detection failure", async () => {
    const onErrorMock = vi.fn();
    const detectUsbConnectionTypeMock = vi
      .fn()
      .mockRejectedValue(new Error("Detection failed"));
    
    const esploader = {
      port: { writable: true, readable: true },
      detectUsbConnectionType: detectUsbConnectionTypeMock,
      hardReset: vi.fn().mockResolvedValue(undefined),
    };

    await enterConsoleMode(esploader, { onError: onErrorMock });

    expect(onErrorMock).toHaveBeenCalledWith(
      expect.stringContaining("Detection failed")
    );
  });

  it("should handle reset failure", async () => {
    const onErrorMock = vi.fn();
    const hardResetMock = vi.fn().mockRejectedValue(new Error("Reset failed"));
    
    const esploader = {
      port: { writable: true, readable: true },
      detectUsbConnectionType: vi.fn().mockResolvedValue(false),
      hardReset: hardResetMock,
    };

    await enterConsoleMode(esploader, { onError: onErrorMock });

    expect(onErrorMock).toHaveBeenCalledWith(
      expect.stringContaining("Reset failed")
    );
  });
});
