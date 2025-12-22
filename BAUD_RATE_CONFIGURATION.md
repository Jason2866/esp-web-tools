# Baud Rate Configuration

## Overview

The baud rate for flashing is now **configurable** via the HTML attribute `baud-rate`.

**Default**: 115,200 Baud (no change) - maximum compatibility with all systems

## HTML Usage

### Default (115200 - maximum compatibility)
```html
<esp-web-install-button manifest="manifest.json">
  <button slot="activate">Install</button>
</esp-web-install-button>
```
No baud rate change, works with all chips.

### Fast Flashing (2 Mbps - recommended)
```html
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="2000000">
  <button slot="activate">Install</button>
</esp-web-install-button>
```
~17x faster, works with modern USB-Serial chips.

### For Older Chips (921600)
```html
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="921600">
  <button slot="activate">Install</button>
</esp-web-install-button>
```
~8x faster, compatible with older chips.

## Available Baud Rates

| Baud Rate | Speed | Flash Time (3 MB) | Recommendation |
|-----------|-------|-------------------|----------------|
| 115200 | ~11 KB/s | ~4.5 minutes | Debugging only |
| 230400 | ~22 KB/s | ~2.3 minutes | Very compatible |
| 460800 | ~44 KB/s | ~70 seconds | High compatibility |
| 921600 | ~88 KB/s | ~35 seconds | Safe for older chips |
| 1500000 | ~143 KB/s | ~21 seconds | Modern chips |
| 2000000 | ~200 KB/s | ~15 seconds | Recommended for speed |

## Use Cases

### 1. Standard Usage (maximum compatibility)
```html
<esp-web-install-button manifest="manifest.json">
  <button slot="activate">Install Firmware</button>
</esp-web-install-button>
```
- ✅ Works with all chips and USB-Serial adapters
- ✅ No configuration needed
- ✅ Maximum reliability

### 2. Fast Flashing (recommended for speed)
```html
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="2000000">
  <button slot="activate">Install Firmware</button>
</esp-web-install-button>
```
- ✅ ~17x faster than default
- ✅ Works with modern USB-Serial chips
- ✅ Saves significant time with large firmware files

### 3. For Older USB-Serial Chips
```html
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="921600">
  <button slot="activate">Install Firmware</button>
</esp-web-install-button>
```
- ✅ Compatible with older CP2102 (not CP2102N)
- ✅ Still 8x faster than 115200
- ✅ Very reliable

### 4. Good Balance
```html
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="460800">
  <button slot="activate">Install Firmware</button>
</esp-web-install-button>
```
- ✅ Works with almost all USB-Serial chips
- ✅ Good balance between speed and compatibility
- ✅ 4x faster than 115200

## Programmatic Usage

### JavaScript
```javascript
const button = document.querySelector('esp-web-install-button');
button.baudRate = 921600;
```

### Dynamic Adjustment
```javascript
// Detect USB-Serial chip and set optimal baud rate
const button = document.querySelector('esp-web-install-button');

// Example: Based on user selection
document.getElementById('speed-select').addEventListener('change', (e) => {
  button.baudRate = parseInt(e.target.value);
});
```

## USB-Serial Chip Compatibility

### 2 Mbps (2000000) - Recommended for Speed
✅ **Supported by:**
- CP2102N (newer version)
- CP2104
- CH340C/G/E (newer versions)
- FT232H
- Native USB (ESP32-C3, ESP32-S3, ESP32-C6)

### 921600 - Safe for Older Chips
✅ **Supported by:**
- All of the above
- CP2102 (older version)
- CH340G (older versions)
- Most USB-Serial chips

### 460800 - Maximum Compatibility
✅ **Supported by:**
- Practically all USB-Serial chips
- Even very old chips

## Error Handling

If baud rate change fails:
1. ✅ Error is automatically caught
2. ✅ Warning is output to log
3. ✅ Flashing continues at 115200 baud
4. ✅ No interruption of process

**Log example on error:**
```
Uploading stub...
Running stub...
Stub is now running...
Could not change baud rate to 2000000: [error reason]
Detecting Flash Size
[Flashing continues at 115200 baud]
```

## Recommendations

### For End-User Websites (recommended: fast)
```html
<!-- Fast flashing for modern hardware -->
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="2000000">
  <button slot="activate">Install</button>
</esp-web-install-button>
```

### For Maximum Compatibility
```html
<!-- Default: Works with all chips -->
<esp-web-install-button manifest="manifest.json">
  <button slot="activate">Install</button>
</esp-web-install-button>
```

### For Developers / Power Users
```html
<!-- Offer choice -->
<select id="baud-rate-select">
  <option value="2000000" selected>Fast (2 Mbps)</option>
  <option value="921600">Safe (921600)</option>
  <option value="460800">Compatible (460800)</option>
  <option value="115200">Slow (115200)</option>
</select>

<esp-web-install-button 
  id="install-button"
  manifest="manifest.json">
  <button slot="activate">Install</button>
</esp-web-install-button>

<script>
  document.getElementById('baud-rate-select').addEventListener('change', (e) => {
    document.getElementById('install-button').baudRate = parseInt(e.target.value);
  });
</script>
```

### For Support Pages
```html
<!-- Lower baud rate for problematic cases -->
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="460800">
  <button slot="activate">Install (Safe Mode)</button>
</esp-web-install-button>
```

## Real-World Example (Tasmota-Style)

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://unpkg.com/esp-web-tools@latest/dist/web/install-button.js?module"></script>
</head>
<body>
  <h1>Install Firmware</h1>
  
  <!-- Default: Fast -->
  <esp-web-install-button manifest="firmware/manifest.json">
    <button slot="activate">Install (Fast)</button>
  </esp-web-install-button>
  
  <!-- For older hardware -->
  <esp-web-install-button 
    manifest="firmware/manifest.json"
    baud-rate="921600">
    <button slot="activate">Install (Compatible)</button>
  </esp-web-install-button>
</body>
</html>
```

## Migration from Hard-Coded to Configurable

### Before (hard-coded):
```typescript
// In flash.ts
await espStub.setBaudrate(2000000);  // Always 2 Mbps
```

### After (configurable):
```typescript
// In flash.ts
const targetBaudRate = baudRate !== undefined ? baudRate : 2000000;
if (targetBaudRate > 115200) {
  await espStub.setBaudrate(targetBaudRate);
}
```

```html
<!-- In HTML -->
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="921600">  <!-- Configurable! -->
  <button slot="activate">Install</button>
</esp-web-install-button>
```

## Benefits of Configurability

1. ✅ **Flexibility**: Each website can choose optimal baud rate
2. ✅ **Compatibility**: Support for older hardware possible
3. ✅ **User Choice**: Users can choose themselves
4. ✅ **Debugging**: Lower rates for troubleshooting
5. ✅ **Backward Compatible**: Default remains 2 Mbps
6. ✅ **No Breaking Changes**: Existing code continues to work

## Testing

Test different baud rates with your hardware:

```html
<esp-web-install-button manifest="test.json" baud-rate="2000000">
  <button slot="activate">Test 2 Mbps</button>
</esp-web-install-button>

<esp-web-install-button manifest="test.json" baud-rate="921600">
  <button slot="activate">Test 921600</button>
</esp-web-install-button>

<esp-web-install-button manifest="test.json" baud-rate="115200">
  <button slot="activate">Test 115200</button>
</esp-web-install-button>
```

Measure flash time and choose the best balance between speed and reliability for your target audience.
