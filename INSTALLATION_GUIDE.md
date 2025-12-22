# LittleFS Integration - Installation and Build Guide

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Git

## Installation

### 1. Install Dependencies

```bash
cd esp-web-tools
npm install
```

This installs all required packages from `package.json`:
- TypeScript Compiler
- Rollup and plugins
- Lit Framework
- Material Web Components
- ESPTool Package

### 2. Perform Build

```bash
npm run prepublishOnly
```

This command performs the following steps:
1. Deletes the `dist/` directory
2. Compiles TypeScript to JavaScript (`tsc`)
3. Bundles with Rollup (`rollup -c`)
4. Copies WASM files to `dist/web/wasm/littlefs/`

### 3. Expected Output

After a successful build, the following structure should be present:

```
dist/
├── install-button.js
├── install-button.d.ts
├── install-dialog.js
├── install-dialog.d.ts
├── partition.js
├── partition.d.ts
├── components/
│   ├── ewt-littlefs-manager.js
│   ├── ewt-littlefs-manager.d.ts
│   └── ...
├── util/
│   ├── partition.js
│   └── ...
├── wasm/
│   └── littlefs/
│       ├── index.js
│       ├── index.d.ts
│       ├── littlefs.js
│       └── littlefs.wasm
└── web/
    ├── install-button.js (bundled)
    └── wasm/
        └── littlefs/
            └── littlefs.wasm (copied)
```

## Development

### Start Development Server

```bash
npm run develop
```

This starts a local server on `http://localhost:5001`.

### Test Changes

1. Open `http://localhost:5001` in browser (Chrome or Edge)
2. Click "Connect" and select an ESP device
3. After successful connection, the "Manage Filesystem" button appears
4. Test the LittleFS functionality

## Troubleshooting

### Problem: "tsc: command not found"

**Solution:**
```bash
npm install
```

Ensure all dependencies are installed.

### Problem: "Cannot find module 'lit'"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

Delete node_modules and reinstall.

### Problem: "WASM file not found"

**Solution:**

Check if the WASM file exists:
```bash
ls -la src/wasm/littlefs/littlefs.wasm
```

If not present, copy it from WebSerial_ESPTool:
```bash
cp ../WebSerial_ESPTool/src/wasm/littlefs/littlefs.wasm src/wasm/littlefs/
```

### Problem: TypeScript Compilation Errors

**Solution:**

Check the TypeScript configuration:
```bash
cat tsconfig.json
```

Ensure all paths are correct.

### Problem: Rollup Bundle Errors

**Solution:**

Check the Rollup configuration:
```bash
cat rollup.config.mjs
```

Ensure the WASM copy plugin is configured correctly.

## Testing

### Manual Tests

1. **Partition Table Reading:**
   - Connect ESP device
   - Click "Manage Filesystem"
   - Verify partitions are displayed

2. **LittleFS Mount:**
   - Click "Open FS" on a LittleFS partition
   - Verify files are displayed

3. **File Operations:**
   - Upload: Select file and click "Upload File"
   - Download: Click "Download" on a file
   - Delete: Click "Delete" on a file
   - Create Folder: Click "New Folder"

4. **Backup & Restore:**
   - Click "Backup Image"
   - Verify .bin file is downloaded

5. **Write to Flash:**
   - Modify files
   - Click "Write to Flash"
   - Confirm dialog
   - Verify write operation is successful

### Automated Tests (TODO)

```bash
# Unit Tests
npm test

# Integration Tests
npm run test:integration

# E2E Tests
npm run test:e2e
```

## Deployment

### Publish NPM Package

```bash
# Increment version
npm version patch  # or minor/major

# Build
npm run prepublishOnly

# Publish
npm publish
```

### Deploy to GitHub Pages

```bash
# Build
npm run prepublishOnly

# Push to gh-pages branch
git checkout gh-pages
cp -r dist/web/* .
git add .
git commit -m "Update build"
git push origin gh-pages
```

## Usage in Your Own Projects

### Via NPM

```bash
npm install tasmota-esp-web-tools
```

```javascript
import "tasmota-esp-web-tools/dist/web/install-button.js";
```

### Via CDN

```html
<script type="module" src="https://unpkg.com/tasmota-esp-web-tools/dist/web/install-button.js"></script>
```

### Local Development

```html
<script type="module" src="./dist/web/install-button.js"></script>
```

## Additional Resources

- **ESP Web Tools Documentation:** [README.md](README.md)
- **LittleFS Feature Documentation:** [LITTLEFS_FEATURE.md](LITTLEFS_FEATURE.md)
- **Filesystem Detection:** [FS_DETECTION.md](FS_DETECTION.md)
- **Integration Guide:** [LITTLEFS_INTEGRATION.md](LITTLEFS_INTEGRATION.md)
- **Implementation Status:** [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)

## Support

For problems or questions:
1. Check the documentation
2. Search in GitHub Issues
3. Create a new issue with detailed description

---

**Last Updated:** December 22, 2024
