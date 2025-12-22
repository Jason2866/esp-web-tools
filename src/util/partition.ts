/**
 * Detect filesystem type by reading partition header
 */
export async function detectFilesystemType(
  espStub: any,
  offset: number,
  size: number,
  logger: any = console
): Promise<string> {
  try {
    // Read first 8KB or entire partition if smaller
    const readSize = Math.min(8192, size);
    const data = await espStub.readFlash(offset, readSize);

    if (data.length < 32) {
      logger.log("Partition too small, assuming SPIFFS");
      return "spiffs";
    }

    // Method 1: Check for "littlefs" string in metadata
    const decoder = new TextDecoder("ascii", { fatal: false });
    const dataStr = decoder.decode(data);

    if (dataStr.includes("littlefs")) {
      logger.log('✓ LittleFS detected: Found "littlefs" signature');
      return "littlefs";
    }

    // Method 2: Check for LittleFS block structure
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

    const blockSizes = [4096, 2048, 1024, 512];
    for (const blockSize of blockSizes) {
      if (data.length >= blockSize * 2) {
        try {
          for (let i = 0; i < Math.min(blockSize, data.length - 4); i += 4) {
            const tag = view.getUint32(i, true);
            const type = (tag >> 20) & 0xfff;
            const length = tag & 0x3ff;

            if (type <= 0x7ff && length > 0 && length <= 1022) {
              if (i + length + 4 <= data.length) {
                logger.log("✓ LittleFS detected: Found valid metadata structure");
                return "littlefs";
              }
            }
          }
        } catch (e) {
          // Continue checking other methods
        }
      }
    }

    // Method 3: Check for SPIFFS signatures
    for (let i = 0; i < Math.min(4096, data.length - 4); i += 4) {
      const magic = view.getUint32(i, true);
      if (magic === 0x20140529 || magic === 0x20160529) {
        logger.log("✓ SPIFFS detected: Found SPIFFS magic number");
        return "spiffs";
      }
    }

    // Default: assume SPIFFS
    logger.log("⚠ No clear filesystem signature found, assuming SPIFFS");
    return "spiffs";
  } catch (err: any) {
    logger.error(`Failed to detect filesystem type: ${err.message || err}`);
    return "spiffs"; // Safe fallback
  }
}
