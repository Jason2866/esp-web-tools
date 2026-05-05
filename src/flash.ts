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
import { corsProxyFetch } from "./util/cors-proxy";

/**
 * Parse flash size string (e.g., "4MB", "8MB", "16MB") to megabytes number
 */
export function parseFlashSizeToMB(flashSize: string): number | undefined {
  if (!flashSize) return undefined;
  const match = flashSize.match(/^(\d+)(MB|GB)$/);
  if (!match) return undefined;
  const size = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === "GB") return size * 1024;
  return size;
}

/**
 * Select the best build using most-specific-matching algorithm
 * - Builds with matching usbInterface are strongly preferred
 * - Builds with matching flashSizeMB are preferred
 * - Among builds with same specificity, first one wins
 * - Builds without these qualifiers are fallback options
 */
function selectBestBuild(
  builds: Build[],
  detectedFlashSizeMB: number | undefined,
  detectedUsbInterface: "UART" | "CDC" | undefined,
): Build | undefined {
  if (builds.length === 0) return undefined;

  // Score builds: higher score = more specific match
  let bestBuild: Build | undefined;
  let bestScore = -Infinity;

  for (const build of builds) {
    let score = 0;

    // USB interface match - if specified, must match
    if (build.usbInterface !== undefined) {
      if (
        detectedUsbInterface !== undefined &&
        build.usbInterface === detectedUsbInterface
      ) {
        score += 1000; // Strong preference for explicit usbInterface match
      } else {
        // Mismatched usbInterface - disqualify this build
        continue;
      }
    }
    // Builds without usbInterface stay neutral (compatible with any)

    // Flash size match gives second priority
    if (build.flashSizeMB !== undefined && detectedFlashSizeMB !== undefined) {
      if (build.flashSizeMB === detectedFlashSizeMB) {
        score += 100; // Exact flash size match
      } else {
        score -= 1; // Penalize non-matching specific builds
      }
    } else if (build.flashSizeMB !== undefined) {
      // flashSizeMB is defined but detectedFlashSizeMB is undefined
      score -= 1; // Penalize non-matching specific builds
    }
    // Generic builds (flashSizeMB undefined) stay at score 0

    // Prefer this build if it has higher score
    // If same score, keep the first one (stable selection)
    if (score > bestScore) {
      bestScore = score;
      bestBuild = build;
    }
  }

  return bestScore >= 0 ? bestBuild : undefined;
}

/**
 * Extract the most relevant firmware filename from a build's parts.
 * Prefers parts with "factory" in the name.
 * Ignores parts with "bootloader" or "partition" in the name.
 * Returns just the basename (no path prefix).
 */
export function getFirmwareFileName(build: Build): string | undefined {
  const candidates = build.parts
    .map((p) => p.path)
    .filter((path) => {
      const lower = path.toLowerCase();
      return !lower.includes("bootloader") && !lower.includes("partition");
    });
  if (candidates.length === 0) return undefined;
  const factory = candidates.find((p) => p.toLowerCase().includes("factory"));
  const chosen = factory ?? candidates[0];
  // Return only the basename
  return chosen.split("/").pop()!.split("\\").pop()!;
}

/**
 * Find the best matching build for a given chip configuration.
 * This is the single source of truth for build selection used by both
 * the flash routine and the install dialog UI.
 */
export function findMatchingBuild(
  manifest: Manifest,
  chipFamily: string,
  chipVariant: string | null,
  flashSizeMB: number | undefined,
  usbInterface: "UART" | "CDC" | undefined,
): Build | undefined {
  const compatible = manifest.builds.filter((b) => {
    if (b.chipFamily !== chipFamily) return false;
    if (b.chipVariant && b.chipVariant !== chipVariant) return false;
    return true;
  });

  const exactVariant = compatible.filter(
    (b) => b.chipVariant !== undefined && b.chipVariant === chipVariant,
  );
  const variantAgnostic = compatible.filter((b) => b.chipVariant === undefined);

  return (
    selectBestBuild(exactVariant, flashSizeMB, usbInterface) ||
    selectBestBuild(variantAgnostic, flashSizeMB, usbInterface)
  );
}

/**
 * Detect the matching build for the currently connected device.
 * Extracts chip info directly from the esploader instance.
 *
 * @param manifest - The loaded firmware manifest
 * @param esploader - ESPLoader instance (or stub) with chip info
 * @param flashSize - Detected flash size string (e.g. "4MB"), or undefined
 * @param isUsbJtagOrOtg - Whether the device uses native USB (CDC) instead of external serial
 * @param improvChipFamily - Optional chipFamily from Improv Serial info (takes precedence)
 */
export function detectMatchingBuild(
  manifest: Manifest,
  esploader: any,
  flashSize: string | undefined,
  isUsbJtagOrOtg: boolean,
  improvChipFamily?: string,
): Build | undefined {
  const chipFamily =
    improvChipFamily ||
    (esploader.chipFamily ? getChipFamilyName(esploader) : null);
  if (!chipFamily) return undefined;
  const chipVariant: string | null = esploader.chipVariant ?? null;
  const flashSizeMB = flashSize ? parseFlashSizeToMB(flashSize) : undefined;
  const usbInterface: "UART" | "CDC" | undefined = isUsbJtagOrOtg
    ? "CDC"
    : "UART";
  return findMatchingBuild(
    manifest,
    chipFamily,
    chipVariant,
    flashSizeMB,
    usbInterface,
  );
}

export const flash = async (
  onEvent: (state: FlashState) => void,
  esploader: any, // ESPLoader instance from tasmota-webserial-esptool
  logger: Logger,
  manifestPath: string,
  eraseFirst: boolean,
  firmwareBuffer: Uint8Array,
  _baudRate?: number,
) => {
  let manifest: Manifest;
  // eslint-disable-next-line prefer-const
  let build: Build | undefined;
  // eslint-disable-next-line prefer-const
  let chipFamily: ReturnType<typeof getChipFamilyName>;
  let chipVariant: string | null = null;
  // eslint-disable-next-line prefer-const
  let flashSize: string | undefined;

  const fireStateEvent = (stateUpdate: FlashState) =>
    onEvent({
      ...stateUpdate,
      manifest,
      build,
      chipFamily,
      chipVariant,
      flashSize,
    });

  let manifestProm = null;
  let manifestURL: string = "";

  try {
    manifestProm = JSON.parse(manifestPath);
  } catch {
    manifestURL = new URL(manifestPath, location.toString()).toString();
    manifestProm = corsProxyFetch(manifestURL).then(
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

  // Only initialize if not already done
  if (!esploader.chipFamily) {
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
  }

  chipFamily = getChipFamilyName(esploader);
  chipVariant = esploader.chipVariant;

  // Detect flash size if not already detected
  if (!esploader.flashSize && esploader.detectFlashSize) {
    try {
      await esploader.detectFlashSize();
    } catch (err) {
      logger.debug("Failed to detect flash size:", err);
    }
  }

  flashSize = esploader.flashSize; // e.g., "4MB", "8MB"
  const flashSizeMB = flashSize ? parseFlashSizeToMB(flashSize) : undefined;

  // Detect USB connection type to pick CDC vs UART firmware variants
  // - true: native USB (USB-JTAG/USB-OTG) -> CDC
  // - false: external USB-to-Serial bridge -> UART
  let detectedUsbInterface: "UART" | "CDC" | undefined;
  if (typeof esploader.detectUsbConnectionType === "function") {
    try {
      const isUsbJtagOrOtg = await esploader.detectUsbConnectionType();
      detectedUsbInterface = isUsbJtagOrOtg ? "CDC" : "UART";
      logger.debug(`Detected USB interface: ${detectedUsbInterface}`);
    } catch (err) {
      logger.debug("Failed to detect USB connection type:", err);
    }
  }

  fireStateEvent({
    state: FlashStateType.INITIALIZING,
    message: `Initialized. Found ${chipFamily}${chipVariant ? ` (${chipVariant})` : ""}${flashSize ? `, ${flashSize}` : ""}`,
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

  build = findMatchingBuild(
    manifest,
    chipFamily,
    chipVariant,
    flashSizeMB,
    detectedUsbInterface,
  );

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

  fireStateEvent({
    state: FlashStateType.PREPARING,
    message: "Preparing installation...",
    details: { done: false },
  });

  // The esploader passed in is always a stub (from _ensureStub())
  // Baudrate was already set in _ensureStub()
  const espStub = esploader;

  // Verify stub has chipFamily (should be copied in _ensureStub)
  if (!espStub.chipFamily) {
    logger.error("Stub missing chipFamily - this should not happen!");
    fireStateEvent({
      state: FlashStateType.ERROR,
      message: "Internal error: Stub not properly initialized",
      details: {
        error: FlashError.FAILED_INITIALIZING,
        details: "Missing chipFamily",
      },
    });
    return;
  }

  // Fetch firmware files
  const filePromises = build.parts.map(async (part) => {
    const url = new URL(
      part.path,
      manifestURL || location.toString(),
    ).toString();
    const resp = await corsProxyFetch(url);
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

  // CRITICAL: Erase MUST be done BEFORE writing, if requested
  if (eraseFirst) {
    fireStateEvent({
      state: FlashStateType.ERASING,
      message: "Erasing flash...",
      details: { done: false },
    });

    try {
      logger.log("Erasing flash memory. Please wait...");
      await espStub.eraseFlash();
      logger.log("Flash erased successfully");

      fireStateEvent({
        state: FlashStateType.ERASING,
        message: "Flash erased",
        details: { done: true },
      });
    } catch (err: any) {
      logger.error(`Flash erase failed: ${err.message}`);
      fireStateEvent({
        state: FlashStateType.ERROR,
        message: `Failed to erase flash: ${err.message}`,
        details: { error: FlashError.WRITE_FAILED, details: err },
      });
      await esploader.disconnect();
      return;
    }
  }

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
        (bytesWritten: number, _bytesTotal: number) => {
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

  // DON'T release locks after flash!
  // Keep the stub and locks so the port can be used again
  // (e.g., for Improv, Manage Filesystem, or another flash)

  fireStateEvent({
    state: FlashStateType.FINISHED,
    message: "All done!",
  });
};
