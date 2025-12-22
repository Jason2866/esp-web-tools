# ESP32-S2 Native USB Reconnect Feature

## Overview

The ESP32-S2 features a built-in USB peripheral that can be software-configured. When using Native USB (TinyUSB), the USB connection operates in two different modes:

1. **ROM Bootloader Mode**: Uses Espressif's default USB descriptors (VID: 0x303a, PID: 0x0002)
2. **Application Mode**: Uses TinyUSB CDC, which may appear as a different port

When accessing the ESP32-S2 filesystem or performing operations that require initialization, the device may switch from ROM bootloader mode to application mode. This causes the serial port to disconnect and reappear as a potentially different port.

## Problem

Without proper handling, this port switch results in a "Couldn't sync to ESP. Try resetting." error during initialization, causing the operation to fail.

## Solution

esp-web-tools now detects when an ESP32-S2 Native USB device fails to sync due to this port switch and presents the user with a dialog to select the new USB port.

### Detection

The system identifies ESP32-S2 Native USB devices by their USB identifiers:
- **Vendor ID**: `0x303a` (Espressif)
- **Product ID**: `0x0002` (ESP32-S2 Native USB)

### Flow

1. User clicks "Manage Filesystem" button
2. esp-web-tools attempts to initialize the ESP loader
3. If initialization fails with a sync error AND the device is ESP32-S2 Native USB:
   - The old port is closed and forgotten
   - A dialog appears: "ESP32-S2 USB Port Changed"
   - User clicks "Select New Port" button
   - Browser's port selection dialog opens
   - User selects the new USB CDC port
   - Initialization continues with the new port
4. Partition table is read and filesystem manager opens

## Technical Implementation

### State Management (install-dialog.ts)

Added new state `ESP32S2_RECONNECT` to handle the reconnection flow:

```typescript
@state() private _state:
  | "ERROR"
  | "DASHBOARD"
  | "PROVISION"
  | "INSTALL"
  | "ASK_ERASE"
  | "LOGS"
  | "PARTITIONS"
  | "LITTLEFS"
  | "ESP32S2_RECONNECT" = "DASHBOARD";
```

### Partition Table Reading (_readPartitionTable)

The method now includes error handling for ESP32-S2 reconnection:

```typescript
try {
  await esploader.initialize();
} catch (err: any) {
  const errorMsg = err.message || String(err);
  const portInfo = currentPort.getInfo();
  const isESP32S2 = portInfo.usbVendorId === 0x303a && portInfo.usbProductId === 0x2;
  
  if (isESP32S2 && (errorMsg.includes("sync") || errorMsg.includes("disconnect"))) {
    // Close and forget old port
    await currentPort.close();
    await currentPort.forget();
    
    // Show reconnect dialog
    this._state = "ESP32S2_RECONNECT";
    return;
  }
  throw err;
}
```

### Reconnect Dialog (_renderESP32S2Reconnect)

Displays a user-friendly dialog with:
- Warning icon and explanation message
- "Select New Port" button (triggers port selection)
- "Cancel" button (returns to dashboard)

### Reconnect Handler (_handleESP32S2ReconnectClick)

Handles the user clicking "Select New Port":

```typescript
private async _handleESP32S2ReconnectClick() {
  try {
    // Request new port (triggered by user click - required for Web Serial API)
    const newPort = await navigator.serial.requestPort();
    await newPort.open({ baudRate: 115200 });
    
    // Update port reference
    this.port = newPort;
    
    // Restart partition table reading with new port
    this._state = "PARTITIONS";
    await this._readPartitionTable();
  } catch (err: any) {
    if (err.name === "NotFoundError") {
      // User cancelled port selection
      this._state = "DASHBOARD";
    } else {
      this._error = `Failed to reconnect: ${err.message}`;
      this._state = "ERROR";
    }
  }
}
```

## User Experience

When the reconnect scenario occurs:

1. User clicks "Manage Filesystem" on the dashboard
2. System attempts to read partition table
3. ESP32-S2 port switch is detected
4. Dialog appears: **"ESP32-S2 USB Port Changed"**
   - Message: "The ESP32-S2 has switched to USB CDC mode. Please select the new USB port to continue."
   - Button: **"Select New Port"** (primary action)
   - Button: **"Cancel"** (secondary action)
5. User clicks "Select New Port"
6. Browser's native port selection dialog opens
7. User selects the new USB CDC port
8. System continues with partition table reading
9. Filesystem manager opens normally

## Browser Compatibility

This feature requires the Web Serial API:
- `navigator.serial.requestPort()`: Must be triggered by user gesture (button click)
- `port.getInfo()`: To check USB VID/PID
- `port.close()`: To close the old port
- `port.forget()`: To release the old port (may not be available in all browsers)

**Important**: `navigator.serial.requestPort()` can only be called in response to a user gesture (e.g., button click). This is why we show a dialog with a button instead of automatically requesting the port.

## Integration with tasmota-webserial-esptool

This feature uses the ESPLoader from `tasmota-webserial-esptool`:
- Detects ESP32-S2 Native USB via USB VID/PID
- Catches sync errors during initialization
- Handles port reconnection transparently

The `esp32s2-usb-reconnect` event from ESPLoader is registered but may not fire in all scenarios. The catch block provides a fallback detection mechanism.

## Testing

To test this feature:
1. Use an ESP32-S2 board with Native USB (e.g., ESP32-S2-DevKitC, ESP32-S2-Saola)
2. Connect via the Native USB port (not UART)
3. Flash firmware that uses TinyUSB CDC
4. Click "Manage Filesystem" button
5. The reconnect dialog should appear
6. Click "Select New Port"
7. Select the new USB CDC port from the browser dialog
8. Filesystem manager should open successfully

## Troubleshooting

### Port selection dialog doesn't appear
- Ensure you're clicking the "Select New Port" button
- Check browser console for errors
- Verify Web Serial API is supported (Chrome/Edge only)

### "Port selection cancelled" error
- User clicked "Cancel" in the browser's port selection dialog
- Click "Manage Filesystem" again to retry

### Still getting sync errors after reconnection
- Try resetting the ESP32-S2 device
- Disconnect and reconnect the USB cable
- Ensure the correct port is selected (should show different PID after switch)

## Related Files

- `src/install-dialog.ts`: Main implementation with reconnect logic
- `src/partition.ts`: Partition table parsing
- `src/util/partition.ts`: Filesystem detection utilities

## Future Improvements

- Add automatic retry mechanism
- Show port information (VID/PID) in selection dialog
- Add timeout handling for port selection
- Improve error messages with more specific guidance
