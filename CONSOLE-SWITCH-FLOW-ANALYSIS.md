# ESP32Tool Console Switch Flow Analysis

## Complete Step-by-Step Documentation of `clickConsole()` Flow

This document analyzes exactly what happens when a user clicks the "Switch Console" button in esp32tool (esp32tool/js/script.js).

---

## PHASE 1: Pre-Switch State Saving

### Step 1.1: Check if console should be enabled
```javascript
const shouldEnable = consoleSwitch.checked;
if (shouldEnable) {
  // Continue to enable console
}
```

### Step 1.2: Verify connection and prerequisites
```javascript
if (isConnected && espStub && espStub.port && !consoleInstance) {
  // Device is connected, stub exists, port is open, console not yet created
  // Continue with console initialization
}
```

### Step 1.3: **CRITICAL** - Save current state BEFORE any changes
```javascript
// CRITICAL: Save current state BEFORE changing anything
// If espStub has a parent, we need to get the baudrate from the parent!
// The stub child can not be used for restoring the stub. the parent must be used!
const loaderToSave = espStub._parent || espStub;
const currentBaudrate = loaderToSave.currentBaudRate;
const currentChipFamily = espStub.chipFamily;

// CRITICAL: Save the PARENT loader (not the stub child!)
espLoaderBeforeConsole = loaderToSave;
baudRateBeforeConsole = currentBaudrate;
chipFamilyBeforeConsole = currentChipFamily;
```

**KEY INSIGHT**: esp32tool saves the PARENT loader (espStub._parent), not the stub itself. This is critical for proper restoration later.

---

## PHASE 2: Baudrate Preparation

### Step 2.1: Set baudrate to 115200 BEFORE entering console mode
```javascript
// Console ALWAYS runs at 115200 baud (firmware default)
// Always set baudrate to 115200 before opening console
try {
  await espStub.setBaudrate(115200);
  debugMsg("Baudrate set to 115200 for console");
} catch (baudErr) {
  logMsg(`Failed to set baudrate to 115200: ${baudErr.message}`);
}
```

**KEY INSIGHT**: Baudrate is set to 115200 BEFORE calling enterConsoleMode(). This ensures the stub is ready for firmware communication.

---

## PHASE 3: Enter Console Mode (Mode Switch)

### Step 3.1: Call enterConsoleMode()
```javascript
const portWasClosed = await espStub.enterConsoleMode();
```

**What enterConsoleMode() does**:
- For USB-JTAG/OTG devices: Triggers WDT reset, closes port, returns `true`
- For external serial chips: Triggers hardware reset, keeps port open, returns `false`

### Step 3.2: Handle USB-JTAG/OTG devices (portWasClosed === true)
```javascript
if (portWasClosed) {
  // USB-JTAG/OTG device: Port was closed after WDT reset
  debugMsg("Device reset to firmware mode (port closed)");
  
  // Wait for device to boot and USB port to become available
  // Android/WebUSB needs more time than Desktop for USB enumeration
  const isWebUSB = isUsingWebUSB();
  const waitTime = isWebUSB ? 1000 : 500; // 1s for Android, 500ms for Desktop
  debugMsg(`Waiting ${waitTime}ms for device to boot and USB to enumerate...`);
  await sleep(waitTime);
```

**KEY INSIGHT**: After WDT reset, esp32tool waits for USB enumeration (500ms Desktop, 1000ms Android).

---

## PHASE 4: Port Selection (USB-JTAG/OTG Only)

### Step 4.1: Determine if modal is needed
```javascript
// Check if this is ESP32-S2 or if we're on Android (WebUSB)
// Both need modal for user gesture
const isS2 = chipFamilyBeforeConsole === 0x3252; // CHIP_FAMILY_ESP32S2 = 0x3252
const needsModal = isS2 || isWebUSB;
```

### Step 4.2a: Modal flow (ESP32-S2 or Android)
```javascript
if (needsModal) {
  // Close old port if still open
  try {
    if (espStub.port && espStub.port.readable) {
      await espStub.port.close();
      debugMsg("Old port closed");
    }
  } catch (closeErr) {
    debugMsg(`Port close error (ignored): ${closeErr.message}`);
  }
  
  // Wait a bit for browser to process
  await sleep(100);
  
  // Show modal for port selection (requires user gesture)
  const modal = document.getElementById("esp32s2Modal");
  const reconnectBtn = document.getElementById("butReconnectS2");
  
  // Update modal text for console mode
  const modalTitle = modal.querySelector("h2");
  const modalText = modal.querySelector("p");
  if (modalTitle) modalTitle.textContent = "Device has been reset to firmware mode";
  if (modalText) {
    modalText.textContent = isWebUSB 
      ? "Please click the button below to select the USB device for console."
      : "Please click the button below to select the serial port for console.";
  }
  
  modal.classList.remove("hidden");
  
  // Handle reconnect button click (single-fire to prevent multiple prompts)
  const handleReconnect = async () => {
    modal.classList.add("hidden");
    
    try {
      // Request the NEW port (user gesture from button click)
      debugMsg("Please select the port for console mode...");
      const newPort = isWebUSB
        ? await WebUSBSerial.requestPort((...args) => logMsg(...args))
        : await navigator.serial.requestPort();
      
      // Use helper to open port and initialize console
      await openConsolePortAndInit(newPort);
    } catch (err) {
      errorMsg(`Failed to open port for console: ${err.message}`);
      consoleSwitch.checked = false;
      saveSetting("console", false);
    }
  };
  
  // Use { once: true } to ensure single-fire and automatic cleanup
  reconnectBtn.addEventListener("click", handleReconnect, { once: true });
}
```

### Step 4.2b: Direct requestPort flow (Desktop with S3/C3/C5/C6/H2/P4)
```javascript
else {
  // Desktop (Web Serial) with ESP32-S3/C3/C5/C6/H2/P4: Direct requestPort
  try {
    // Request port selection from user (direct)
    debugMsg("Please select the serial port again for console mode...");
    const newPort = await navigator.serial.requestPort();
    
    // Use helper to open port and initialize console
    await openConsolePortAndInit(newPort);
  } catch (err) {
    errorMsg(`Failed to open port for console: ${err.message}`);
    consoleSwitch.checked = false;
    saveSetting("console", false);
  }
}

return; // Exit here for USB-JTAG/OTG devices
```

**KEY INSIGHT**: For Desktop with S3/C3/C5/C6/H2/P4, esp32tool calls `navigator.serial.requestPort()` DIRECTLY without a modal. The function then RETURNS immediately after calling `openConsolePortAndInit()`.

---

## PHASE 5: Port Opening and Console Initialization (Helper Function)

### Step 5.1: openConsolePortAndInit() - Open port at 115200
```javascript
async function openConsolePortAndInit(newPort) {
  // Open the port at 115200 for console
  await newPort.open({ baudRate: 115200 });
  espStub.port = newPort;
  espStub.connected = true;
  
  // Keep parent/loader in sync (used by closeConsole)
  if (espStub._parent) {
    espStub._parent.port = newPort;
  }
  if (espLoaderBeforeConsole) {
    espLoaderBeforeConsole.port = newPort;
  }
  
  debugMsg("Port opened for console at 115200 baud");
```

**KEY INSIGHT**: After opening the new port, esp32tool updates:
1. `espStub.port = newPort`
2. `espStub._parent.port = newPort` (if parent exists)
3. `espLoaderBeforeConsole.port = newPort` (the saved loader)

### Step 5.2: Update console switch state
```javascript
  // Device is already in firmware mode, port is open at 115200
  // Initialize console directly
  consoleSwitch.checked = true;
  saveSetting("console", true);
```

### Step 5.3: Initialize console UI
```javascript
  // Initialize console UI and handlers
  await initConsoleUI();
}
```

---

## PHASE 6: Console UI Initialization (Helper Function)

### Step 6.1: initConsoleUI() - Wait for port to be ready
```javascript
async function initConsoleUI() {
  // Wait for port to be ready
  await sleep(200);
```

### Step 6.2: Show console UI
```javascript
  // Show console container and hide commands
  consoleContainer.classList.remove("hidden");
  
  // Add console-active class to body for mobile styling
  document.body.classList.add("console-active");
  const commands = document.getElementById("commands");
  if (commands) commands.classList.add("hidden");
```

### Step 6.3: Create console instance
```javascript
  // Initialize console
  consoleInstance = new ESP32ToolConsole(espStub.port, consoleContainer, true);
  await consoleInstance.init();
```

### Step 6.4: Setup console reset button
```javascript
  // Check if console reset is supported and hide button if not
  if (espLoaderBeforeConsole && typeof espLoaderBeforeConsole.isConsoleResetSupported === 'function') {
    const resetSupported = espLoaderBeforeConsole.isConsoleResetSupported();
    const resetBtn = consoleContainer.querySelector("#console-reset-btn");
    if (resetBtn) {
      if (resetSupported) {
        resetBtn.style.display = "";
      } else {
        resetBtn.style.display = "none";
        debugMsg("Console reset disabled for ESP32-S2 USB-JTAG/CDC (hardware limitation)");
      }
    }
  }
```

### Step 6.5: Setup event listeners
```javascript
  // Listen for console reset events
  if (consoleResetHandler) {
    consoleContainer.removeEventListener('console-reset', consoleResetHandler);
  }
  consoleResetHandler = async () => {
    if (espLoaderBeforeConsole && typeof espLoaderBeforeConsole.resetInConsoleMode === 'function') {
      try {
        debugMsg("Resetting device from console...");
        await espLoaderBeforeConsole.resetInConsoleMode();
        debugMsg("Device reset successful");
      } catch (err) {
        errorMsg("Failed to reset device: " + err.message);
      }
    }
  };
  consoleContainer.addEventListener('console-reset', consoleResetHandler);
  
  // Listen for console close events
  if (consoleCloseHandler) {
    consoleContainer.removeEventListener('console-close', consoleCloseHandler);
  }
  consoleCloseHandler = async () => {
    if (!consoleSwitch.checked) return;
    debugMsg("Closing console...");
    consoleSwitch.checked = false;
    saveSetting("console", false);
    await closeConsole();
  };
  consoleContainer.addEventListener('console-close', consoleCloseHandler);
  
  logMsg("Console initialized");
}
```

---

## PHASE 7: External Serial Chip Flow (portWasClosed === false)

### Step 7.1: Handle external serial chips
```javascript
} else {
  // Serial chip device: Port stays open
  debugMsg("Device reset to firmware mode");
}
```

### Step 7.2: Wait for firmware to start
```javascript
// Wait for:
// - Firmware to start after reset
// - Port to be ready for new reader
await sleep(200);
```

### Step 7.3: Initialize console UI directly
```javascript
// Initialize console UI and handlers
await initConsoleUI();

saveSetting("console", true);
```

**KEY INSIGHT**: For external serial chips, the port stays open, so esp32tool just waits 200ms and initializes the console UI directly.

---

## SUMMARY: Key Differences Between esp32tool and esp-web-tools

### 1. **State Saving**
- **esp32tool**: Saves `espStub._parent` (the parent loader), not the stub itself

### 2. **Baudrate Setting**
- **esp32tool**: Sets baudrate to 115200 BEFORE calling `enterConsoleMode()`

### 3. **Wait Times**
- **esp32tool**: Waits 500ms (Desktop) or 1000ms (Android) after WDT reset for USB enumeration

### 4. **Port Updates**
- **esp32tool**: Updates THREE references after port selection:
  1. `espStub.port = newPort`
  2. `espStub._parent.port = newPort`
  3. `espLoaderBeforeConsole.port = newPort`

### 5. **Console Initialization**
- **esp32tool**: Creates `ESP32ToolConsole` instance with `espStub.port`

### 6. **Flow Control**
- **esp32tool**: Uses `return` statement after calling `openConsolePortAndInit()` for USB-JTAG/OTG devices

---

## CRITICAL MISSING PIECES IN esp-web-tools

### 1. **No stub creation before WDT reset**
fixed

### 2. **Baudrate not set before enterConsoleMode()**
fixed

### 3. **Parent loader not saved**
fixed

### 4. **Saved loader port not updated**
fixed

### 5. **No wait for USB enumeration**
fixed

### 6. **Improv test timing**
fixed
---

