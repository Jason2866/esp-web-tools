# LittleFS Filesystem Manager

ESP Web Tools now includes a complete LittleFS filesystem manager that runs entirely in your browser!

## ✨ Features

- **Automatic Detection**: Automatically detects LittleFS partitions on your ESP device
- **File Browser**: Hierarchical file and folder navigation
- **File Operations**: Upload, download, and delete files
- **Folder Management**: Create and delete folders (recursive)
- **Storage Info**: Real-time storage usage with visual progress bar
- **Disk Version**: Display LittleFS version (v2.0 or v2.1)
- **Backup & Restore**: Save complete filesystem as .bin file
- **Write to Flash**: Write modified filesystem back to device
- **Block Size Detection**: Automatic detection (512, 1024, 2048, 4096 bytes)

## 🚀 Quick Start

1. **Connect your ESP device**
2. Click **"Manage Filesystem"** in the dashboard
3. The partition table will be read automatically
4. Click **"Open FS"** on a LittleFS partition
5. Manage your files!

## 📖 Usage

### Reading Partition Table

After connecting your device, click "Manage Filesystem" in the dashboard. The tool will:
- Read the partition table from offset 0x8000
- Display all partitions with their type, size, and offset
- Show "Open FS" button for filesystem partitions (type: data, subtype: spiffs)

### Opening a Filesystem

Click "Open FS" on a partition. The tool will:
- Automatically detect if it's LittleFS or SPIFFS
- Try different block sizes (4096, 2048, 1024, 512 bytes)
- Mount the filesystem in browser memory
- Display all files and folders

### Managing Files

Once the filesystem is open, you can:

**Upload Files:**
1. Click "Choose File" and select a file
2. Click "Upload File"
3. File is added to the current directory

**Download Files:**
- Click "Download" next to any file

**Delete Files/Folders:**
- Click "Delete" next to any file or folder
- Folders are deleted recursively

**Create Folders:**
1. Click "New Folder"
2. Enter folder name
3. Folder is created in current directory

**Navigate:**
- Click on folder names to open them
- Click "↑ Up" to go to parent directory
- Breadcrumb shows current path

### Saving Changes

**Important:** All operations are performed in browser memory only!

To save changes to your device:
1. Click **"Write to Flash"**
2. Confirm the dialog
3. Wait for write to complete
4. **Restart your device** to activate changes

### Creating Backups

Before making changes, create a backup:
1. Click **"Backup Image"**
2. A .bin file will be downloaded
3. You can restore this later using "Program" in the main interface

## ⚙️ Technical Details

### Filesystem Detection

The tool uses a multi-method approach to detect filesystem type:

**Method 1: String Signature (Primary)**
- Searches for "littlefs" string in superblock metadata
- Most reliable method for LittleFS detection
- 100% accurate, no false positives

**Method 2: Block Structure Analysis**
- Analyzes LittleFS metadata tag structure
- Tag format: `type (12 bits) | id (10 bits) | length (10 bits)`
- Validates block structure patterns

**Method 3: SPIFFS Magic Numbers**
- Searches for SPIFFS-specific magic numbers
- Known values: `0x20140529`, `0x20160529`

**Fallback:**
- If no signature found, assumes SPIFFS (safer default)

### Supported Block Sizes

- 4096 bytes (ESP32 default)
- 2048 bytes
- 1024 bytes
- 512 bytes

The tool automatically tries all sizes and selects the correct one.

### LittleFS Versions

- **v2.0** (0x00020000): Maximum compatibility
- **v2.1** (0x00020001): Latest version with additional features

Both versions are fully supported.

## 🌐 Browser Compatibility

**Supported:**
- Google Chrome (Desktop & Android)
- Microsoft Edge (Desktop)
- Opera (Desktop)
- Brave (Desktop)

**Not Supported:**
- Safari (macOS & iOS) - Web Serial API not available
- Firefox - Web Serial API not implemented
- Mobile browsers on iOS

## 📝 Example Workflows

### Update Configuration Files

```
1. Connect device and open filesystem
2. Create backup (recommended!)
3. Download old config file
4. Edit locally
5. Upload new version
6. Write to flash
7. Restart device
```

### Update Web Interface

```
1. Open filesystem
2. Navigate to /www folder
3. Upload new HTML/CSS/JS files
4. Delete old files (optional)
5. Write to flash
6. Restart device
```

## ⚠️ Limitations

- **SPIFFS**: Not yet implemented (only LittleFS supported)
- **Read-Only Initially**: Changes are made in browser memory first
- **Manual Flash**: Must click "Write to Flash" to save changes
- **Device Restart**: Required after writing to flash
- **Memory Usage**: Large partitions may require significant browser RAM

## 🔧 Troubleshooting

### "Failed to mount LittleFS with any block size"
- Partition may not be formatted
- Partition might be using SPIFFS instead
- Partition could be corrupted

### "Failed to detect filesystem type"
- Check device connection
- Ensure partition exists
- Try reformatting the partition

### Files not displayed
- Click "Refresh" to update view
- Check if you're in the correct directory
- Partition might be empty

## 📚 Additional Documentation

- [Feature Documentation](LITTLEFS_FEATURE.md) - Complete feature overview
- [Detection Algorithm](FS_DETECTION.md) - Filesystem detection details
- [Integration Guide](LITTLEFS_INTEGRATION.md) - Developer integration guide
- [Build Guide](INSTALLATION_GUIDE.md) - Build and installation instructions

## 🎯 Demo

See the [LittleFS Manager Demo](example-littlefs-manager.html) for a live example.

## 💡 Tips

- **Always create a backup** before making changes
- **Test changes locally** before uploading
- **Check storage usage** before uploading large files
- **Use "Refresh"** if files don't appear immediately
- **Restart device** after writing to flash

## 🤝 Contributing

This feature is based on the LittleFS integration from [WebSerial_ESPTool](https://github.com/Jason2866/WebSerial_ESPTool) v7.3.0.

## 📄 License

MIT License - Compatible with ESP Web Tools Apache-2.0 License

---

**Need Help?** Check the [GitHub Issues](https://github.com/Jason2866/esp-web-tools/issues) or create a new issue.
