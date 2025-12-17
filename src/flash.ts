import { ESPLoader, Logger } from "tasmota-webserial-esptool";
import {
  Build,
  FlashError,
  FlashState,
  Manifest,
  FlashStateType,
} from "./const";
import { getChipFamilyName } from "./util/chip-family-name";
import { sleep } from "./util/sleep";

/**
 * Check if a serial port is an ESP32-S2 Native USB device
 * VID 0x303a = Espressif
 * PID 0x0002 = ESP32-S2 Native USB
 */
const isESP32S2NativeUSB = (port: SerialPort): boolean => {
  const info = port.getInfo();
  return info.usbVendorId === 0x303a && info.usbProductId === 0x0002;
};

export const flash = async (
  onEvent: (state: FlashState) => void,
  port: SerialPort,
  logger: Logger,
  manifestPath: string,
  eraseFirst: boolean,
  firmwareBuffer: Uint8Array,
  baudRate?: number,
) => {
  let manifest: Manifest;
  let build: Build | undefined;
  let chipFamily: ReturnType<typeof getChipFamilyName>;
  let chipVariant: string | null = null;
  let esp32s2ReconnectRequired = false;
  const isS2NativeUSB = isESP32S2NativeUSB(port);

  const fireStateEvent = (stateUpdate: FlashState) =>
    onEvent({
      ...stateUpdate,
      manifest,
      build,
      chipFamily,
      chipVariant,
    });

  var manifestProm = null;
  var manifestURL: string = "";

  try {
    manifestProm = JSON.parse(manifestPath);
  } catch {
    manifestURL = new URL(manifestPath, location.toString()).toString();
    manifestProm = fetch(manifestURL).then(
      (resp): Promise<Manifest> => resp.json(),
    );
  }

  const esploader = new ESPLoader(port, logger);

  // For debugging
  (window as any).esploader = esploader;

  // ESP32-S2 Native USB event handler - listen on ESPLoader instance
  const handleESP32S2Reconnect = () => {
    esp32s2ReconnectRequired = true;
    logger.log("ESP32-S2 Native USB disconnect detected - reconnection required");
  };

  // Register event listener for ESP32-S2 Native USB reconnect on ESPLoader
  if (isS2NativeUSB) {
    esploader.addEventListener("esp32s2-usb-reconnect", handleESP32S2Reconnect);
    logger.log("ESP32-S2 Native USB detected - monitoring for port switch");
  }

  // Cleanup function to remove event listener
  const cleanup = () => {
    if (isS2NativeUSB) {
      esploader.removeEventListener("esp32s2-usb-reconnect", handleESP32S2Reconnect);
    }
  };

  fireStateEvent({
    state: FlashStateType.INITIALIZING,
    message: "Initializing...",
    details: { done: false },
  });

  try {
    await esploader.initialize();
  } catch (err: any) {
    logger.error(err);

    // Check if this is an ESP32-S2 Native USB reconnect situation
    if (isS2NativeUSB && esp32s2ReconnectRequired) {
      cleanup();

      // Close the old port if still accessible
      try {
        await port.close();
      } catch {
        // Port may already be closed
      }

      // Forget the old port to allow reselection
      try {
        await port.forget();
      } catch {
        // Forget may not be supported or port already released
      }

      // Fire reconnect event to trigger port reselection dialog
      fireStateEvent({
        state: FlashStateType.ESP32_S2_USB_RECONNECT,
        message: "ESP32-S2 Native USB detected - please select the new port",
        details: { oldPort: port },
      });
      return;
    }

    cleanup();
    fireStateEvent({
      state: FlashStateType.ERROR,
      message:
        "Failed to initialize. Try resetting your device or holding the BOOT button while clicking INSTALL.",
      details: { error: FlashError.FAILED_INITIALIZING, details: err },
    });
    if (esploader.connected) {
      await esploader.disconnect();
    }
    return;
  }

  chipFamily = getChipFamilyName(esploader);
  chipVariant = esploader.chipVariant;

  fireStateEvent({
    state: FlashStateType.INITIALIZING,
    message: `Initialized. Found ${chipFamily}${chipVariant ? ` (${chipVariant})` : ""}`,
    details: { done: true },
  });
  fireStateEvent({
    state: FlashStateType.MANIFEST,
    message: "Fetching manifest...",
    details: { done: false },
  });

  try {
    manifest = await manifestProm;
  } catch (err: any) {
    cleanup();
    fireStateEvent({
      state: FlashStateType.ERROR,
      message: `Unable to fetch manifest: ${err}`,
      details: { error: FlashError.FAILED_MANIFEST_FETCH, details: err },
    });
    await esploader.disconnect();
    return;
  }

  build = manifest.builds.find((b) => {
    // Match chipFamily and optionally chipVariant
    if (b.chipFamily !== chipFamily) {
      return false;
    }
    // If build specifies a chipVariant, it must match
    if (b.chipVariant !== undefined) {
      return b.chipVariant === chipVariant;
    }
    // If build doesn't specify chipVariant, it matches any variant
    return true;
  });

  fireStateEvent({
    state: FlashStateType.MANIFEST,
    message: `Found manifest for ${manifest.name}`,
    details: { done: true },
  });

  if (!build) {
    const chipInfo = chipVariant
      ? `${chipFamily} (${chipVariant})`
      : chipFamily;
    cleanup();
    fireStateEvent({
      state: FlashStateType.ERROR,
      message: `Your ${chipInfo} board is not supported.`,
      details: { error: FlashError.NOT_SUPPORTED, details: chipInfo },
    });
    await esploader.disconnect();
    return;
  }

  fireStateEvent({
    state: FlashStateType.PREPARING,
    message: "Preparing installation...",
    details: { done: false },
  });

  const filePromises = build.parts.map(async (part) => {
    if (firmwareBuffer.length == 0) {
      //No firmware buffer provided, now download ...
      const url = new URL(part.path, manifestURL).toString();
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(
          `Downlading firmware ${part.path} failed: ${resp.status}`,
        );
      }
      return resp.arrayBuffer();
    }
    // buffer from local file upload
    return firmwareBuffer;
  });

  // Run the stub while we wait for files to download
  const espStub = await esploader.runStub();

  // Increase baud rate for faster flashing if specified via baud-rate attribute
  // Default: No change (115200 baud - stub default)
  // Can be set via baud-rate attribute in HTML (e.g., baud-rate="2000000")
  if (baudRate !== undefined && baudRate > 115200) {
    try {
      await espStub.setBaudrate(baudRate);
    } catch (err: any) {
      // If baud rate change fails, continue with default 115200
      logger.log(`Could not change baud rate to ${baudRate}: ${err.message}`);
    }
  }

  const files: (ArrayBuffer | Uint8Array)[] = [];
  let totalSize = 0;

  for (const prom of filePromises) {
    try {
      const data = await prom;
      files.push(data instanceof ArrayBuffer ? new Uint8Array(data) : data);
      totalSize += data.byteLength;
    } catch (err: any) {
      cleanup();
      fireStateEvent({
        state: FlashStateType.ERROR,
        message: err.message,
        details: {
          error: FlashError.FAILED_FIRMWARE_DOWNLOAD,
          details: err.message,
        },
      });
      await esploader.disconnect();
      return;
    }
  }

  fireStateEvent({
    state: FlashStateType.PREPARING,
    message: "Installation prepared",
    details: { done: true },
  });

  if (eraseFirst) {
    fireStateEvent({
      state: FlashStateType.ERASING,
      message: "Erasing device...",
      details: { done: false },
    });
    await espStub.eraseFlash();
    fireStateEvent({
      state: FlashStateType.ERASING,
      message: "Device erased",
      details: { done: true },
    });
  }

  let lastPct = 0;

  fireStateEvent({
    state: FlashStateType.WRITING,
    message: `Writing progress: ${lastPct}%`,
    details: {
      bytesTotal: totalSize,
      bytesWritten: 0,
      percentage: lastPct,
    },
  });

  let totalWritten = 0;

  for (const part of build.parts) {
    const file = files.shift()!;
    const fileBuffer =
      file instanceof Uint8Array ? new Uint8Array(file).buffer : file;
    try {
      await espStub.flashData(
        fileBuffer as ArrayBuffer,
        (bytesWritten: number) => {
          const newPct = Math.floor(
            ((totalWritten + bytesWritten) / totalSize) * 100,
          );
          if (newPct === lastPct) {
            return;
          }
          lastPct = newPct;
          fireStateEvent({
            state: FlashStateType.WRITING,
            message: `Writing progress: ${newPct}%`,
            details: {
              bytesTotal: totalSize,
              bytesWritten: totalWritten + bytesWritten,
              percentage: newPct,
            },
          });
        },
        part.offset,
        true,
      );
    } catch (err: any) {
      cleanup();
      fireStateEvent({
        state: FlashStateType.ERROR,
        message: err.message,
        details: { error: FlashError.WRITE_FAILED, details: err },
      });
      await esploader.disconnect();
      return;
    }
    totalWritten += file.byteLength;
  }

  fireStateEvent({
    state: FlashStateType.WRITING,
    message: "Writing complete",
    details: {
      bytesTotal: totalSize,
      bytesWritten: totalWritten,
      percentage: 100,
    },
  });

  await sleep(100);
  console.log("DISCONNECT");
  await esploader.disconnect();
  console.log("HARD RESET");
  await esploader.hardReset();

  cleanup();
  fireStateEvent({
    state: FlashStateType.FINISHED,
    message: "All done!",
  });
};
