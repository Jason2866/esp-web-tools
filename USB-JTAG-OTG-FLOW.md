# USB-JTAG/OTG Device Flow Documentation

## Overview
This document explains how esp-web-tools handles USB-JTAG and USB-OTG devices (ESP32-S2, S3, C3, C6, H2) which change USB ports when switching between bootloader and firmware modes.

## Key Differences from External Serial Chips

### External Serial Chips (CP2102, CH340, etc.)
- USB port stays the same when switching modes
- DTR/RTS signals control reset/boot pins
- No user gesture needed for mode changes

### USB-JTAG/OTG Devices
- USB port **changes** when switching between bootloader ↔ firmware
- Port closes and reopens with different identifier
- **User Gesture required** every time port changes (browser security)
- Uses watchdog reset or USB reconnection for mode switching

## Complete Flow for USB-JTAG/OTG Devices

### 1. Initial Connection
```
User clicks "Connect" button
  ↓
Browser shows port selection dialog (User Gesture #1)
  ↓
Device connects in BOOTLOADER mode
  ↓
install-dialog.ts: firstUpdated() → _initialize(false)
  ↓
Detects USB-JTAG/OTG device via usingUsbJtagSerial() or usingUsbOtg()
  ↓
Calls esploader.enterConsoleMode() to switch to FIRMWARE mode
  ↓
Port closes (device reboots to firmware)
  ↓
Dispatches "request-port-selection" event
  ↓
connect.ts: handlePortSelection() receives event
  ↓
Closes current dialog
  ↓
Calls esptoolConnect() to trigger port selection (User Gesture #2)
  ↓
Browser shows port selection dialog again
  ↓
User selects the NEW port (firmware mode)
  ↓
Creates new install-dialog with new port
  ↓
_initialize() runs again, device is now in firmware mode
  ↓
Improv test runs successfully at 115200 baud
  ↓
Dashboard shown with device info
```

### 2. Flash Operation
```
User clicks "Install Firmware"
  ↓
Device is in FIRMWARE mode (from Improv test)
  ↓
_prepareForFlashOperations() called
  ↓
Calls esploader.reconnectToBootloader()
  ↓
Port closes and reopens in BOOTLOADER mode
  ↓
Stub loaded, baudrate increased (e.g., 460800)
  ↓
Flash operation proceeds
  ↓
Flash completes successfully
  ↓
_handleFlashComplete() called
  ↓
Detects USB-JTAG/OTG device
  ↓
Calls esploader.resetToFirmware()
  ↓
Port closes (device reboots to new firmware)
  ↓
Shows message: "Installation complete! Please close and reconnect"
  ↓
User closes dialog and clicks "Connect" again (User Gesture #3)
  ↓
Browser shows port selection dialog
  ↓
User selects port (new firmware running)
  ↓
Improv test runs to verify new firmware
  ↓
Dashboard shown with new firmware info
```

### 3. WiFi Provisioning (After Flash)
```
User reconnects after flash
  ↓
Device in FIRMWARE mode, Improv test successful
  ↓
User clicks "Connect to Wi-Fi"
  ↓
Device already in firmware mode (no reset needed)
  ↓
Improv client re-initialized
  ↓
WiFi provisioning proceeds
  ↓
After provisioning: Device stays in FIRMWARE mode
  ↓
"Visit Device" and "Add to HA" links work (firmware running)
```

### 4. Change WiFi (From Dashboard)
```
User clicks "Change Wi-Fi" button
  ↓
Device already in FIRMWARE mode
  ↓
Improv client closed and re-initialized
  ↓
No reset needed (firmware already running)
  ↓
WiFi provisioning screen shown
```

## Critical Requirements

### 1. Improv Test Requirements
- **MUST** run in firmware mode at 115200 baud
- **MUST** happen immediately after device connection
- Device must be running firmware (not bootloader)

### 2. Flash Operation Requirements
- **MUST** run in bootloader mode
- Stub loaded for faster operations
- Higher baudrate (e.g., 460800) for speed

### 3. User Gesture Requirements
- **MUST** request port selection whenever port changes
- Cannot programmatically select port (browser security)
- User must manually select port from browser dialog

## Functions Used from tasmota-webserial-esptool v9.2.10

### Detection Functions
- `esploader.usingUsbJtagSerial()` - Detects USB-JTAG devices
- `esploader.usingUsbOtg()` - Detects USB-OTG devices

### Mode Switching Functions
- `esploader.enterConsoleMode()` - Bootloader → Firmware (returns true if port closed)
- `esploader.resetToFirmware()` - Bootloader → Firmware (always closes port)
- `esploader.reconnectToBootloader()` - Firmware → Bootloader (closes and reopens port)

### Baudrate Functions
- `esploader.setBaudrate(baud)` - Now supports ESP32-S2 on Android (WebUSB)
- `esploader.currentBaudRate` - Get current baudrate

## Event Flow

### request-port-selection Event
Dispatched by install-dialog.ts when port change is detected:
```typescript
fireEvent(this, "request-port-selection" as any, {
  afterFlash: false,
  testImprov: true,
});
```

Handled by connect.ts:
```typescript
const handlePortSelection = async (event: Event) => {
  // Close current dialog
  // Disconnect current port
  // Trigger new port selection (User Gesture)
  // Create new dialog with new port
  // Recursively attach event handler
};
```

## State Variables

### _isUsbJtagOrOtgDevice
- Type: `boolean`
- Purpose: Cache USB-JTAG/OTG detection result
- Used by: UI rendering to hide "Logs & Console" button (not supported for USB-JTAG/OTG)

### _improvChecked
- Type: `boolean`
- Purpose: Track if Improv test was already performed
- Prevents repeated Improv tests on same connection

### _improvSupported
- Type: `boolean`
- Purpose: Track if device supports Improv
- Separate from `_client` (client can be closed but support remains)

## UI Differences for USB-JTAG/OTG

### Hidden Features
- "Logs & Console" button - Not shown for USB-JTAG/OTG devices
  - Reason: Console requires firmware mode, but returning to dashboard would require bootloader mode
  - Would need another port change and User Gesture

### Modified Messages
- After flash: "Please close this dialog and reconnect"
  - Reason: Port changed, need User Gesture to select new port
  - Alternative: Automatic port selection via request-port-selection event

## Testing Checklist

### Initial Connection
- [ ] Device detected as USB-JTAG/OTG
- [ ] Port selection requested automatically
- [ ] User selects new port
- [ ] Improv test runs successfully
- [ ] Dashboard shows device info

### Flash Operation
- [ ] Device switches to bootloader mode
- [ ] Stub loads successfully
- [ ] Flash completes
- [ ] Device resets to firmware mode
- [ ] Message shown to reconnect
- [ ] User reconnects successfully
- [ ] New firmware detected

### WiFi Provisioning
- [ ] "Connect to Wi-Fi" works without reset
- [ ] WiFi credentials accepted
- [ ] "Visit Device" link works
- [ ] "Add to HA" link works
- [ ] Device stays in firmware mode

### Error Handling
- [ ] User cancels port selection → Error shown
- [ ] enterConsoleMode() fails → Error shown
- [ ] Improv test fails → Dashboard shown without Improv
- [ ] Flash fails → Error shown, can retry

## Known Limitations

1. **Logs & Console**: Not available for USB-JTAG/OTG devices
   - Would require additional port changes and User Gestures
   - Users can use external serial monitor tools

2. **Automatic Reconnection**: Limited by browser security
   - Cannot programmatically select port
   - User must manually select from browser dialog
   - Each port change requires User Gesture

3. **Port Selection Timing**: Must happen immediately after mode change
   - Cannot delay or batch port selections
   - Each mode change triggers immediate port selection request
