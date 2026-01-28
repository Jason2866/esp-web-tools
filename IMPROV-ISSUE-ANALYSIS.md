# Improv Issue Analysis: Why USB-JTAG/OTG Devices Fail Improv Test

## Problem Statement

After successful WDT reset and port reconnection on USB-JTAG/OTG devices (ESP32-S3), **Improv is NOT detected**. The logs show:
- WDT reset executes successfully
- Port closes and user selects new port
- Port opens at 115200 baud
- Stub port is updated
- **Improv test fails: "Improv Wi-Fi Serial not detected"**

However, Improv WORKS on external serial chip devices.

---

## Root Cause Analysis

### What esp32tool Does (WORKING)

1. **Before WDT reset**:
   - Creates stub: `espStub = await esploader.runStub()`
   - Saves PARENT loader: `espLoaderBeforeConsole = espStub._parent || espStub`
   - Sets baudrate to 115200: `await espStub.setBaudrate(115200)`
   - Calls `enterConsoleMode()` which triggers WDT reset

2. **After port selection**:
   - Opens port at 115200: `await newPort.open({ baudRate: 115200 })`
   - Updates THREE references:
     - `espStub.port = newPort`
     - `espStub._parent.port = newPort`
     - `espLoaderBeforeConsole.port = newPort`
   - Waits 200ms: `await sleep(200)`
   - Creates console: `new ESP32ToolConsole(espStub.port, ...)`

3. **Key insight**: esp32tool uses `espStub.port` for console, NOT `esploader.port`

### What esp-web-tools Does (NOT WORKING)

1. **Before WDT reset**:
   - Creates stub: `this._espStub = await this.esploader.runStub()`
   - Saves PARENT loader: `_savedLoaderBeforeConsole = espStub._parent || espStub`
   - Sets baudrate to 115200: `await loaderToUse.setBaudrate(115200)`
   - Calls `enterConsoleMode()` which triggers WDT reset

2. **After port selection** (in `_handleSelectNewPort`):
   - Opens port at 115200: `await newPort.open({ baudRate: 115200 })`
   - Updates stub references:
     - `this._espStub.port = newPort`
     - `this._espStub._parent.port = newPort`
   - Creates ESPLoader: `new ESPLoader(newPort, ...)`
   - Waits for boot: `await sleep(this._additionalBootDelay)` (4000ms)
   - Flushes buffers
   - Tests Improv: `new ImprovSerial(this._port, ...)`

3. **CRITICAL BUG**: esp-web-tools uses `this._port` for Improv test, which returns `this.esploader.port`

### The Bug

```typescript
// In install-dialog.ts:
private get _port(): SerialPort {
  return this.esploader.port;  // ← THIS IS THE OLD PORT!
}

// Later in _initialize():
const client = new ImprovSerial(this._port, this.logger);  // ← WRONG PORT!
```

**The problem**: `this.esploader.port` is NEVER updated after port selection! It still points to the OLD bootloader port that was closed during WDT reset.

**What should happen**: Improv should use the NEW port that was selected by the user and opened at 115200 baud.

---

## Comparison Table

| Step | esp32tool (WORKING) | esp-web-tools (BROKEN) |
|------|---------------------|------------------------|
| Port reference for console/Improv | `espStub.port` (updated) | `this.esploader.port` (NOT updated) |
| Port updates after selection | 3 references updated | 2 references updated (missing `esploader.port`) |
| Wait time after port open | 200ms | 4000ms |
| Console/Improv initialization | Uses `espStub.port` | Uses `this._port` → `this.esploader.port` |

---

## The Fix

### Option 1: Update `esploader.port` after port selection (RECOMMENDED)

```typescript
// In _handleSelectNewPort(), after opening new port:
this.esploader.port = newPort;  // ← ADD THIS LINE
this._espStub.port = newPort;
if (this._espStub._parent) {
  this._espStub._parent.port = newPort;
}
```

### Option 2: Change `_port` getter to use stub port

```typescript
private get _port(): SerialPort {
  // Use stub port if available (it's updated after reconnection)
  if (this._espStub && this._espStub.port) {
    return this._espStub.port;
  }
  return this.esploader.port;
}
```

### Option 3: Pass port directly to Improv (CLEANEST)

```typescript
// In _initialize(), after port reconnection:
const portToUse = this._espStub?.port || this._port;
const client = new ImprovSerial(portToUse, this.logger);
```

---

## Additional Issues Found

### Issue 2: Wait time too long
- esp32tool waits 200ms after port open before initializing console
- esp-web-tools waits 4000ms (default `_additionalBootDelay`)
- **Recommendation**: Reduce to 500ms (Desktop) or 1000ms (Android)

### Issue 3: Saved loader port not updated
- esp32tool updates `espLoaderBeforeConsole.port` after port selection
- esp-web-tools saves `_savedLoaderBeforeConsole` but never updates its port
- **Impact**: If user later tries to restore bootloader mode, it will use the old port
- **Fix**: Add `this._savedLoaderBeforeConsole.port = newPort;`

### Issue 4: ESPLoader recreation unnecessary
- esp-web-tools creates a new ESPLoader instance after port selection
- This is unnecessary - just update the port reference
- **Recommendation**: Remove `new ESPLoader(...)` and just update `this.esploader.port`

---

## Recommended Implementation

```typescript
async _handleSelectNewPort() {
  try {
    this._busy = true;
    this.logger.log("User clicked 'Select Port' button - requesting new port...");

    // Request port selection (User Gesture)
    const newPort = await navigator.serial.requestPort();
    this.logger.log("Port selected by user");

    // Open port at 115200 baud for firmware mode
    this.logger.log("Opening port at 115200 baud for firmware mode...");
    await newPort.open({ baudRate: 115200 });
    this.logger.log("Port opened successfully at 115200 baud");

    // CRITICAL: Update ALL port references (like esp32tool does)
    this.esploader.port = newPort;  // ← FIX: Update esploader port
    this._espStub.port = newPort;
    if (this._espStub._parent) {
      this._espStub._parent.port = newPort;
    }
    if (this._savedLoaderBeforeConsole) {
      this._savedLoaderBeforeConsole.port = newPort;
    }

    // Wait for firmware to be ready (like esp32tool: 200ms)
    this.logger.log("Waiting for device to fully boot into firmware...");
    await sleep(500);  // 500ms instead of 4000ms

    // Now continue with Improv test
    this._skipModeSwitch = true;
    this._state = "DASHBOARD";
    await this._initialize();
    
    this._busy = false;
  } catch (err: any) {
    this.logger.error(`Port selection error: ${err.message}`, err);
    this._state = "ERROR";
    this._error = `Failed to select port: ${err.message}`;
    this._busy = false;
  }
}
```

---

## Testing Checklist

After implementing the fix, verify:

1. ✅ USB-JTAG/OTG device (ESP32-S3): Improv detected after WDT reset and port selection
2. ✅ External serial chip device: Improv still works (no regression)
3. ✅ Flash operation works after Improv test
4. ✅ Console/Logs work after Improv test
5. ✅ Filesystem manager works after Improv test
6. ✅ Wi-Fi provisioning works after Improv test

---

## Conclusion

The root cause is that **`this.esploader.port` is never updated after port selection**, so Improv test uses the old closed port instead of the new open port. The fix is simple: add `this.esploader.port = newPort;` after opening the new port.

This is exactly what esp32tool does - it updates all three port references (`espStub.port`, `espStub._parent.port`, and `espLoaderBeforeConsole.port`) after port selection.
