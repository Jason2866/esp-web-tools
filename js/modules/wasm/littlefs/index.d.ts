import type { FileSource, BinarySource } from "../shared/types";

/**
 * Maximum filename length (ESP-IDF default: 64)
 */
export declare const LFS_NAME_MAX: number;

/**
 * LittleFS disk version 2.0 (0x00020000)
 * Use this for maximum compatibility with older implementations.
 */
export declare const DISK_VERSION_2_0: number;

/**
 * LittleFS disk version 2.1 (0x00020001)
 * Latest version with additional features.
 */
export declare const DISK_VERSION_2_1: number;

/**
 * Format disk version as human-readable string (e.g., "2.0", "2.1")
 */
export declare function formatDiskVersion(version: number): string;

export interface LittleFSEntry {
  path: string;
  size: number;
  type: "file" | "dir";
}

export interface LittleFSOptions {
  blockSize?: number;
  blockCount?: number;
  lookaheadSize?: number;
  /**
   * Optional override for the wasm asset location. Useful when bundlers move files.
   */
  wasmURL?: string | URL;
  /**
   * Formats the filesystem immediately after initialization.
   */
  formatOnInit?: boolean;
  /**
   * Disk version to use when formatting new filesystems.
   * Use DISK_VERSION_2_0 for compatibility with older ESP implementations.
   * Use DISK_VERSION_2_1 for latest features.
   *
   * IMPORTANT: Setting this prevents automatic migration of older filesystems.
   */
  diskVersion?: number;
}

export interface LittleFS {
  format(): void;
  list(path?: string): LittleFSEntry[];
  addFile(path: string, data: FileSource): void;
  writeFile(path: string, data: FileSource): void;
  deleteFile(path: string): void;
  delete(
    path: string,
    options?: {
      recursive?: boolean;
    },
  ): void;
  mkdir(path: string): void;
  rename(oldPath: string, newPath: string): void;
  toImage(): Uint8Array;
  readFile(path: string): Uint8Array;
  /**
   * Get the disk version of the mounted filesystem.
   * @returns Version as 32-bit number (e.g., 0x00020000 for v2.0, 0x00020001 for v2.1)
   */
  getDiskVersion(): number;
  /**
   * Set the disk version for new filesystems.
   * Must be called before formatting.
   * @param version - Version as 32-bit number (use DISK_VERSION_2_0 or DISK_VERSION_2_1)
   */
  setDiskVersion(version: number): void;
  /**
   * Get filesystem usage statistics.
   */
  getUsage(): { capacityBytes: number; usedBytes: number; freeBytes: number };
  /**
   * Check if a file of given size can fit in the filesystem.
   * @param path - File path (currently unused, reserved for future use)
   * @param size - Size in bytes
   * @returns true if the file can fit, false otherwise
   */
  canFit(path: string, size: number): boolean;
  /**
   * Cleanup and unmount the filesystem.
   * Should be called when done using the filesystem to free resources.
   */
  cleanup(): void;
}

export declare class LittleFSError extends Error {
  readonly code: number;
  constructor(message: string, code: number);
}

export declare function createLittleFS(
  options?: LittleFSOptions,
): Promise<LittleFS>;
export declare function createLittleFSFromImage(
  image: BinarySource,
  options?: LittleFSOptions,
): Promise<LittleFS>;
