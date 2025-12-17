# ESP32-S2 Native USB Reconnect Feature

## Overview

The ESP32-S2 features a built-in USB peripheral that can be software-configured. When using Native USB (TinyUSB), the USB connection operates in two different modes:

1. **ROM Bootloader Mode**: Uses Espressif's default USB descriptors (VID: 0x303a, PID: 0x0002)
2. **Application Mode**: Uses TinyUSB CDC, which may appear as a different port

When flashing firmware to an ESP32-S2 with Native USB, the device temporarily switches from ROM bootloader mode to application mode. This causes the serial port to disconnect and reappear as a potentially different port.

## Problem

Without proper handling, this port switch results in a "Read loop got disconnected" error during the flashing process, causing the operation to fail.

## Solution

esp-web-tools now detects when an ESP32-S2 Native USB device disconnects due to this port switch and presents the user with a dialog to select the new USB port.

### Detection

The system identifies ESP32-S2 Native USB devices by their USB identifiers:
- **Vendor ID**: `0x303a` (Espressif)
- **Product ID**: `0x0002` (ESP32-S2 Native USB)

### Flow

1. During initialization, esp-web-tools checks if the connected device is an ESP32-S2 Native USB
2. If a disconnect occurs during the initialization phase (before successful connection), the system triggers a reconnect flow
3. A dialog appears informing the user that the ESP32-S2 has switched to USB CDC mode
4. The user clicks "Select New Port" to choose the new USB port
5. The flashing process automatically continues with the new port

## Technical Implementation

### State Types (const.ts)

```typescript
export const enum FlashStateType {
  // ... other states
  ESP32_S2_USB_RECONNECT = "esp32_s2_usb_reconnect",
}

export const enum FlashError {
  // ... other errors
  ESP32_S2_USB_RECONNECT = "esp32_s2_usb_reconnect",
}

export interface ESP32S2USBReconnectState extends BaseFlashState {
  state: FlashStateType.ESP32_S2_USB_RECONNECT;
  details: { oldPort: SerialPort };
}
```

### Flash Handler (flash.ts)

The `flash()` function:
1. Checks if the port is an ESP32-S2 Native USB device
2. Registers an event listener for `esp32s2-usb-reconnect` events
3. On disconnect during initialization, fires the reconnect state
4. Properly cleans up event listeners on completion or error

### UI Handler (install-dialog.ts)

The `_handleESP32S2Reconnect()` method:
1. Closes and forgets the old port
2. Requests a new port selection from the user
3. Opens the new port
4. Restarts the installation process

## User Experience

When the reconnect scenario occurs:

1. The user sees a dialog with heading "ESP32-S2 USB Port Changed"
2. The dialog explains that the ESP32-S2 has switched to USB CDC mode
3. Two buttons are available:
   - **Select New Port**: Opens the browser's serial port picker
   - **Cancel**: Returns to the dashboard

## Browser Compatibility

This feature uses the Web Serial API, specifically:
- `navigator.serial.requestPort()`: For port selection
- `port.getInfo()`: To check USB VID/PID
- `port.forget()`: To release the old port (may not be available in all browsers)

## Integration with tasmota-webserial-esptool

This feature works in conjunction with the `esp32s2-usb-reconnect` event dispatched by the ESPLoader class in `tasmota-webserial-esptool`. The event is dispatched when:
- The device is detected as ESP32-S2 Native USB
- A disconnect occurs during the initialization phase
- The initialization did not succeed

## Testing

To test this feature:
1. Use an ESP32-S2 board with Native USB (e.g., ESP32-S2-DevKitC)
2. Connect via the Native USB port (not UART)
3. Start a flashing operation
4. The reconnect dialog should appear when the device switches to CDC mode
5. Select the new port to continue flashing

## Related Files

- `src/const.ts`: Type definitions for reconnect state
- `src/flash.ts`: Reconnect detection logic
- `src/install-dialog.ts`: UI handling for reconnect flow
