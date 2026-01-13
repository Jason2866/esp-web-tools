import { Logger } from "tasmota-webserial-esptool";
import {
  Build,
  FlashError,
  FlashState,
  Manifest,
  FlashStateType,
} from "./const";
import { getChipFamilyName } from "./util/chip-family-name";
import { sleep } from "./util/sleep";

export const flash = async (
  onEvent: (state: FlashState) => void,
  esploader: any, // ESPLoader instance from tasmota-webserial-esptool
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

  // Use the provided ESPLoader instance - NO port logic here!
  // For debugging
  (window as any).esploader = esploader;

  fireStateEvent({
    state: FlashStateType.INITIALIZING,
    message: "Initializing...",
    details: { done: false },
  });

  try {
    await esploader.initialize();
  } catch (err: any) {
    logger.error(err);

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

    // If build specifies chipVariant, it must match
    if (b.chipVariant && b.chipVariant !== chipVariant) {
      return false;
    }

    return true;
  });

  if (!build) {
    fireStateEvent({
      state: FlashStateType.ERROR,
      message: `Your ${chipFamily}${chipVariant ? ` (${chipVariant})` : ""} is not supported by this firmware.`,
      details: { error: FlashError.NOT_SUPPORTED, details: chipFamily },
    });
    await esploader.disconnect();
    return;
  }

  fireStateEvent({
    state: FlashStateType.MANIFEST,
    message: "Manifest fetched",
    details: { done: true },
  });

  if (eraseFirst) {
    fireStateEvent({
      state: FlashStateType.ERASING,
      message: "Erasing device...",
      details: { done: false },
    });
    await esploader.eraseFlash();
    fireStateEvent({
      state: FlashStateType.ERASING,
      message: "Device erased",
      details: { done: true },
    });
  }

  fireStateEvent({
    state: FlashStateType.PREPARING,
    message: "Preparing installation...",
    details: { done: false },
  });

  // Run the stub
  const espStub = await esploader.runStub();

  // Change baud rate if specified (must be done AFTER runStub, BEFORE flashing)
  if (baudRate !== undefined && baudRate > 115200) {
    try {
      await espStub.setBaudrate(baudRate);
      logger.log(`Baud rate changed to ${baudRate}`);
    } catch (err: any) {
      logger.log(`Could not change baud rate to ${baudRate}: ${err.message}`);
    }
  }

  // Fetch firmware files
  const filePromises = build.parts.map(async (part) => {
    const url = new URL(
      part.path,
      manifestURL || location.toString(),
    ).toString();
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(
        `Downlading firmware ${part.path} failed: ${resp.status}`,
      );
    }
    return resp.arrayBuffer();
  });

  // If firmwareBuffer is provided, use it instead of fetching
  if (firmwareBuffer) {
    filePromises.push(Promise.resolve(firmwareBuffer.buffer as ArrayBuffer));
  }

  const files: (ArrayBuffer | Uint8Array)[] = [];
  let totalSize = 0;

  for (const prom of filePromises) {
    try {
      const data = await prom;
      files.push(data);
      totalSize += data.byteLength;
    } catch (err: any) {
      fireStateEvent({
        state: FlashStateType.ERROR,
        message: err.message,
        details: { error: FlashError.FAILED_FIRMWARE_DOWNLOAD, details: err },
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

  fireStateEvent({
    state: FlashStateType.WRITING,
    message: `Writing progress: 0 %`,
    details: {
      bytesTotal: totalSize,
      bytesWritten: 0,
      percentage: 0,
    },
  });

  let lastPct = 0;
  let totalBytesWritten = 0;

  try {
    for (let i = 0; i < build.parts.length; i++) {
      const part = build.parts[i];
      const data = files[i];

      await espStub.flashData(
        data,
        (bytesWritten: number, bytesTotal: number) => {
          const newPct = Math.floor(
            ((totalBytesWritten + bytesWritten) / totalSize) * 100,
          );
          if (newPct === lastPct) {
            return;
          }
          lastPct = newPct;
          fireStateEvent({
            state: FlashStateType.WRITING,
            message: `Writing progress: ${newPct} %`,
            details: {
              bytesTotal: totalSize,
              bytesWritten: totalBytesWritten + bytesWritten,
              percentage: newPct,
            },
          });
        },
        part.offset,
      );

      totalBytesWritten += data.byteLength;
    }
  } catch (err: any) {
    fireStateEvent({
      state: FlashStateType.ERROR,
      message: err.message,
      details: { error: FlashError.WRITE_FAILED, details: err },
    });
    await esploader.disconnect();
    return;
  }

  fireStateEvent({
    state: FlashStateType.WRITING,
    message: "Writing complete",
    details: {
      bytesTotal: totalSize,
      bytesWritten: totalSize,
      percentage: 100,
    },
  });

  await sleep(100);

  logger.log("Hard resetting device...");
  await espStub.hardReset();

  await sleep(100);

  fireStateEvent({
    state: FlashStateType.FINISHED,
    message: "All done!",
  });
};
