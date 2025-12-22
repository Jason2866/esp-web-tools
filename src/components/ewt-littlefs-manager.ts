import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Partition } from "../partition.js";
import "./ewt-button";
import "./ewt-textfield";

// Dynamic import for LittleFS WASM module
let _wasmBasePath: string | null = null;

async function loadLittleFS() {
  // Determine WASM base path
  // When deployed on GitHub Pages or other CDNs, the WASM files need to be
  // loaded from the correct relative path
  if (!_wasmBasePath) {
    const scriptUrl = new URL(import.meta.url);
    _wasmBasePath = new URL('./wasm/littlefs/', scriptUrl).href;
  }
  
  const module = await import("../wasm/littlefs/index.js");
  return module;
}

@customElement("ewt-littlefs-manager")
export class EwtLittleFSManager extends LitElement {
  @property({ type: Object }) partition!: Partition;
  @property({ type: Object }) espStub: any;
  @property({ type: Function }) logger: any = console;
  @property({ type: Function }) onClose?: () => void;

  @state() private _currentPath = "/";
  @state() private _files: any[] = [];
  @state() private _fs: any = null;
  @state() private _blockSize = 4096;
  @state() private _usage = { capacityBytes: 0, usedBytes: 0, freeBytes: 0 };
  @state() private _diskVersion = "";
  @state() private _busy = false;
  @state() private _selectedFile: File | null = null;
  @state() private _flashProgress = 0; // 0-100 for flash progress, -1 when not flashing
  @state() private _isFlashing = false;

  async connectedCallback() {
    super.connectedCallback();
    await this._openFilesystem();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanup();
  }

  private async _openFilesystem() {
    try {
      this._busy = true;
      this.logger.log(
        `Reading LittleFS partition "${this.partition.name}" (${this._formatSize(this.partition.size)})...`,
      );

      // Read entire partition
      const data = await this.espStub.readFlash(
        this.partition.offset,
        this.partition.size,
      );

      this.logger.log("Mounting LittleFS filesystem...");

      // Load LittleFS module dynamically
      const { createLittleFSFromImage, formatDiskVersion } = await loadLittleFS();

      // Try to mount with different block sizes
      const blockSizes = [4096, 2048, 1024, 512];
      let fs = null;
      let blockSize = 0;

      for (const bs of blockSizes) {
        try {
          const blockCount = Math.floor(this.partition.size / bs);
          
          // Pass WASM URL if available
          const options: any = {
            blockSize: bs,
            blockCount: blockCount,
          };
          
          if (_wasmBasePath) {
            options.wasmURL = new URL('littlefs.wasm', _wasmBasePath).href;
          }
          
          fs = await createLittleFSFromImage(data, options);

          // Try to list root to verify it works
          fs.list("/");
          blockSize = bs;
          this.logger.log(
            `Successfully mounted LittleFS with block size ${bs}`,
          );
          break;
        } catch (err) {
          // Try next block size
          fs = null;
        }
      }

      if (!fs) {
        throw new Error("Failed to mount LittleFS with any block size");
      }

      this._fs = fs;
      this._blockSize = blockSize;

      // Get disk version
      try {
        const diskVer = fs.getDiskVersion();
        this._diskVersion = formatDiskVersion(diskVer);
      } catch (e) {
        this._diskVersion = "";
      }

      this._refreshFiles();
      this.logger.log("LittleFS filesystem opened successfully");
    } catch (e: any) {
      this.logger.error(`Failed to open LittleFS: ${e.message || e}`);
      if (this.onClose) {
        this.onClose();
      }
    } finally {
      this._busy = false;
    }
  }

  private _refreshFiles() {
    if (!this._fs) return;

    try {
      // Calculate usage
      const allFiles = this._fs.list("/");
      const usedBytes = this._estimateUsage(allFiles);
      const totalBytes = this.partition.size;

      this._usage = {
        capacityBytes: totalBytes,
        usedBytes: usedBytes,
        freeBytes: totalBytes - usedBytes,
      };

      // List files in current directory
      const entries = this._fs.list(this._currentPath);

      // Sort: directories first, then files
      entries.sort((a: any, b: any) => {
        if (a.type === "dir" && b.type !== "dir") return -1;
        if (a.type !== "dir" && b.type === "dir") return 1;
        return a.path.localeCompare(b.path);
      });

      this._files = entries;
    } catch (e: any) {
      this.logger.error(`Failed to refresh file list: ${e.message || e}`);
    }
  }

  private _estimateUsage(entries: any[]): number {
    const block = this._blockSize || 4096;
    let total = block * 2; // root metadata copies

    for (const entry of entries || []) {
      if (entry.type === "dir") {
        total += block;
      } else {
        const dataBytes =
          Math.max(1, Math.ceil((entry.size || 0) / block)) * block;
        const metadataBytes = block;
        total += dataBytes + metadataBytes;
      }
    }

    return total;
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

  private _navigateUp() {
    if (this._currentPath === "/" || !this._currentPath) return;

    const parts = this._currentPath.split("/").filter(Boolean);
    parts.pop();
    this._currentPath = "/" + parts.join("/");
    if (this._currentPath !== "/" && !this._currentPath.endsWith("/")) {
      this._currentPath += "/";
    }
    this._refreshFiles();
  }

  private _navigateTo(path: string) {
    this._currentPath = path;
    this._refreshFiles();
  }

  private async _uploadFile() {
    if (!this._fs || !this._selectedFile) return;

    try {
      this._busy = true;
      this.logger.log(`Uploading file "${this._selectedFile.name}"...`);

      const data = await this._selectedFile.arrayBuffer();
      const uint8Data = new Uint8Array(data);

      // Construct target path
      let targetPath = this._currentPath;
      if (!targetPath.endsWith("/")) targetPath += "/";
      targetPath += this._selectedFile.name;

      // Ensure parent directories exist
      const segments = targetPath.split("/").filter(Boolean);
      if (segments.length > 1) {
        let built = "";
        for (let i = 0; i < segments.length - 1; i++) {
          built += `/${segments[i]}`;
          try {
            this._fs.mkdir(built);
          } catch (e) {
            // Ignore if directory already exists
          }
        }
      }

      // Write file
      if (typeof this._fs.writeFile === "function") {
        this._fs.writeFile(targetPath, uint8Data);
      } else if (typeof this._fs.addFile === "function") {
        this._fs.addFile(targetPath, uint8Data);
      }

      // Verify by reading back
      const readBack = this._fs.readFile(targetPath);
      this.logger.log(
        `✓ File written: ${readBack.length} bytes at ${targetPath}`,
      );

      // Clear input
      const uploadedFileName = this._selectedFile.name;
      this._selectedFile = null;
      this._refreshFiles();

      this.logger.log(`File "${uploadedFileName}" uploaded successfully`);
    } catch (e: any) {
      this.logger.error(`Failed to upload file: ${e.message || e}`);
    } finally {
      this._busy = false;
    }
  }

  private _createFolder() {
    if (!this._fs) return;

    const dirName = prompt("Enter directory name:");
    if (!dirName || !dirName.trim()) return;

    try {
      let targetPath = this._currentPath;
      if (!targetPath.endsWith("/")) targetPath += "/";
      targetPath += dirName.trim();

      this._fs.mkdir(targetPath);
      this._refreshFiles();

      this.logger.log(`Directory "${dirName}" created successfully`);
    } catch (e: any) {
      this.logger.error(`Failed to create directory: ${e.message || e}`);
    }
  }

  private async _downloadFile(path: string) {
    if (!this._fs) return;

    try {
      this.logger.log(`Downloading file "${path}"...`);

      const data = this._fs.readFile(path);
      const filename = path.split("/").filter(Boolean).pop() || "file.bin";

      // Create download
      const blob = new Blob([data], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.logger.log(`File "${filename}" downloaded successfully`);
    } catch (e: any) {
      this.logger.error(`Failed to download file: ${e.message || e}`);
    }
  }

  private _deleteFile(path: string, type: string) {
    if (!this._fs) return;

    const name = path.split("/").filter(Boolean).pop() || path;
    const confirmed = confirm(`Delete ${type} "${name}"?`);

    if (!confirmed) return;

    try {
      if (type === "dir") {
        this._fs.delete(path, { recursive: true });
      } else {
        this._fs.deleteFile(path);
      }

      this._refreshFiles();
      this.logger.log(
        `${type === "dir" ? "Directory" : "File"} "${name}" deleted successfully`,
      );
    } catch (e: any) {
      this.logger.error(`Failed to delete ${type}: ${e.message || e}`);
    }
  }

  private async _backupImage() {
    if (!this._fs) return;

    try {
      this.logger.log("Creating LittleFS backup image...");
      const image = this._fs.toImage();

      const filename = `${this.partition.name}_littlefs_backup.bin`;

      // Create download
      const blob = new Blob([image], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.logger.log(`LittleFS backup saved as "${filename}"`);
    } catch (e: any) {
      this.logger.error(`Failed to backup LittleFS: ${e.message || e}`);
    }
  }

  private async _writeToFlash() {
    if (!this._fs) return;

    const confirmed = confirm(
      `Write modified LittleFS to flash?\n\n` +
        `Partition: ${this.partition.name}\n` +
        `Offset: 0x${this.partition.offset.toString(16)}\n` +
        `Size: ${this._formatSize(this.partition.size)}\n\n` +
        `This will overwrite the current filesystem on the device!`,
    );

    if (!confirmed) return;

    try {
      this._busy = true;
      this._isFlashing = true;
      this._flashProgress = 0;

      this.logger.log("Creating LittleFS image...");
      const image = this._fs.toImage();
      this.logger.log(`Image created: ${this._formatSize(image.length)}`);

      if (image.length > this.partition.size) {
        this.logger.error(
          `Image size (${this._formatSize(image.length)}) exceeds partition size (${this._formatSize(this.partition.size)})`,
        );
        return;
      }

      this.logger.log(
        `Writing ${this._formatSize(image.length)} to partition "${this.partition.name}" at 0x${this.partition.offset.toString(16)}...`,
      );

      // Convert Uint8Array to ArrayBuffer
      const imageBuffer = image.buffer.slice(
        image.byteOffset,
        image.byteOffset + image.byteLength,
      );

      // Write the image to flash with progress callback
      await this.espStub.flashData(
        imageBuffer,
        (bytesWritten: number, totalBytes: number) => {
          const percent = Math.floor((bytesWritten / totalBytes) * 100);
          this._flashProgress = percent;
          this.logger.log(`Writing: ${percent}%`);
        },
        this.partition.offset,
      );

      this.logger.log(`✓ LittleFS successfully written to flash!`);
      this.logger.log(`To use the new filesystem, reset your device.`);
    } catch (e: any) {
      this.logger.error(`Failed to write LittleFS to flash: ${e.message || e}`);
    } finally {
      this._busy = false;
      this._isFlashing = false;
      this._flashProgress = 0;
    }
  }

  private _cleanup() {
    if (this._fs) {
      try {
        // Don't call destroy() - just let garbage collection handle it
      } catch (e) {
        console.error("Error cleaning up LittleFS:", e);
      }
      this._fs = null;
    }
  }

  private _handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    this._selectedFile = input.files?.[0] || null;
  }

  render() {
    const usedPercent = Math.round(
      (this._usage.usedBytes / this._usage.capacityBytes) * 100,
    );

    return html`
      <div class="littlefs-manager">
        <h3>LittleFS Filesystem Manager</h3>

        <div class="littlefs-info">
          <div class="littlefs-partition-info">
            <strong>Partition:</strong> ${this.partition.name}
            <span class="littlefs-size"
              >(${this._formatSize(this.partition.size)})</span
            >
          </div>
          <div class="littlefs-usage">
            <div class="usage-bar">
              <div
                class="usage-fill ${this._isFlashing ? "flashing" : ""}"
                style="width: ${this._isFlashing
                  ? this._flashProgress
                  : usedPercent}%"
              ></div>
            </div>
            <div class="usage-text">
              ${this._isFlashing
                ? html`<span class="flash-status">
                    ⚡ Writing to flash: ${this._flashProgress}%
                  </span>`
                : html`<span
                      >Used: ${this._formatSize(this._usage.usedBytes)} /
                      ${this._formatSize(this._usage.capacityBytes)}
                      (${usedPercent}%)</span
                    >
                    ${this._diskVersion
                      ? html`<span class="disk-version"
                          >${this._diskVersion}</span
                        >`
                      : ""}`}
            </div>
          </div>
        </div>

        <div class="littlefs-controls">
          <ewt-button
            label="Refresh"
            @click=${this._refreshFiles}
            ?disabled=${this._busy}
          ></ewt-button>
          <ewt-button
            label="Backup Image"
            @click=${this._backupImage}
            ?disabled=${this._busy}
          ></ewt-button>
          <ewt-button
            label="Write to Flash"
            @click=${this._writeToFlash}
            ?disabled=${this._busy}
          ></ewt-button>
          <ewt-button
            label="Close"
            @click=${() => {
              this._cleanup();
              if (this.onClose) this.onClose();
            }}
            ?disabled=${this._busy}
          ></ewt-button>
        </div>

        <div class="littlefs-breadcrumb">
          <ewt-button
            label="↑ Up"
            @click=${this._navigateUp}
            ?disabled=${this._currentPath === "/" || this._busy}
          ></ewt-button>
          <span>${this._currentPath || "/"}</span>
        </div>

        <div class="littlefs-file-upload">
          <input
            type="file"
            @change=${this._handleFileSelect}
            ?disabled=${this._busy}
          />
          <ewt-button
            label="Upload File"
            @click=${this._uploadFile}
            ?disabled=${!this._selectedFile || this._busy}
          ></ewt-button>
          <ewt-button
            label="New Folder"
            @click=${this._createFolder}
            ?disabled=${this._busy}
          ></ewt-button>
        </div>

        <div class="littlefs-files">
          <table class="file-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this._files.length === 0
                ? html`
                    <tr>
                      <td colspan="4" class="empty-state">
                        No files in this directory
                      </td>
                    </tr>
                  `
                : this._files.map(
                    (entry) => html`
                      <tr>
                        <td>
                          <div
                            class="file-name ${entry.type === "dir"
                              ? "clickable"
                              : ""}"
                            @click=${entry.type === "dir"
                              ? () => this._navigateTo(entry.path)
                              : null}
                          >
                            <span class="file-icon"
                              >${entry.type === "dir" ? "📁" : "📄"}</span
                            >
                            <span
                              >${entry.path.split("/").filter(Boolean).pop() ||
                              "/"}</span
                            >
                          </div>
                        </td>
                        <td>${entry.type === "dir" ? "Directory" : "File"}</td>
                        <td>
                          ${entry.type === "file"
                            ? this._formatSize(entry.size)
                            : "-"}
                        </td>
                        <td>
                          <div class="file-actions">
                            ${entry.type === "file"
                              ? html`
                                  <ewt-button
                                    label="Download"
                                    @click=${() =>
                                      this._downloadFile(entry.path)}
                                    ?disabled=${this._busy}
                                  ></ewt-button>
                                `
                              : ""}
                            <ewt-button
                              class="danger"
                              label="Delete"
                              @click=${() =>
                                this._deleteFile(entry.path, entry.type)}
                              ?disabled=${this._busy}
                            ></ewt-button>
                          </div>
                        </td>
                      </tr>
                    `,
                  )}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .littlefs-manager {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      padding: 15px;
      border: 2px solid var(--mdc-theme-primary, #03a9f4);
      border-radius: 10px;
      background-color: rgba(3, 169, 244, 0.05);
      box-sizing: border-box;
    }

    h3 {
      margin: 0 0 15px 0;
      color: var(--mdc-theme-primary, #03a9f4);
      font-size: 18px;
      font-weight: 600;
    }

    .littlefs-info {
      margin-bottom: 15px;
      padding: 12px;
      background-color: rgba(255, 255, 255, 0.5);
      border-radius: 8px;
    }

    .littlefs-partition-info {
      margin-bottom: 10px;
      font-size: 13px;
    }

    .littlefs-size {
      color: #666;
      margin-left: 8px;
    }

    .littlefs-usage {
      margin-top: 8px;
    }

    .usage-bar {
      width: 100%;
      height: 18px;
      background-color: #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 6px;
    }

    .usage-fill {
      height: 100%;
      background: linear-gradient(
        90deg,
        var(--mdc-theme-primary, #03a9f4) 0%,
        var(--mdc-theme-primary, #03a9f4) 100%
      );
      transition: width 0.3s ease;
    }

    .usage-fill.flashing {
      background: linear-gradient(90deg, #ff9800 0%, #ff5722 100%);
      animation: pulse 1s ease-in-out infinite;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }

    .flash-status {
      font-weight: 600;
      color: #ff5722;
    }

    .usage-text {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #555;
      flex-wrap: wrap;
      gap: 5px;
    }

    .disk-version {
      font-size: 11px;
      padding: 2px 6px;
      background-color: var(--mdc-theme-primary, #03a9f4);
      color: white;
      border-radius: 4px;
    }

    .littlefs-controls {
      display: flex;
      gap: 8px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }

    .littlefs-breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      padding: 8px;
      background-color: rgba(255, 255, 255, 0.5);
      border-radius: 8px;
    }

    .littlefs-breadcrumb span {
      font-family: monospace;
      font-size: 13px;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .littlefs-file-upload {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    .littlefs-file-upload input[type="file"] {
      flex: 1;
      min-width: 150px;
      padding: 4px;
      border: 2px solid #ccc;
      border-radius: 8px;
      font-size: 13px;
    }

    .littlefs-files {
      max-height: 350px;
      overflow-y: auto;
      overflow-x: auto;
      border: 1px solid #ccc;
      border-radius: 8px;
    }

    .file-table {
      width: 100%;
      min-width: 500px;
      border-collapse: collapse;
    }

    .file-table thead {
      position: sticky;
      top: 0;
      background-color: #f5f5f5;
      z-index: 10;
    }

    .file-table th {
      padding: 8px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #ccc;
    }

    .file-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #e0e0e0;
    }

    .file-table tbody tr:hover {
      background-color: rgba(3, 169, 244, 0.1);
    }

    .file-table .empty-state {
      text-align: center;
      color: #999;
      padding: 30px;
      font-style: italic;
    }

    .file-name {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .file-name.clickable {
      cursor: pointer;
    }

    .file-name.clickable:hover {
      color: var(--mdc-theme-primary, #03a9f4);
      text-decoration: underline;
    }

    .file-icon {
      font-size: 16px;
    }

    .file-actions {
      display: flex;
      gap: 5px;
    }

    .danger {
      --mdc-theme-primary: var(--improv-danger-color, #db4437);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ewt-littlefs-manager": EwtLittleFSManager;
  }
}
