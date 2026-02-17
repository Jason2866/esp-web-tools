# Mode Switching Usage Guide

Diese Anleitung zeigt, wie die Mode-Switching-Flows in esp-web-tools verwendet werden.

## Installation

Die Mode-Switching-Funktionalität ist bereits in esp-web-tools integriert. Sie müssen nur die entsprechenden Module importieren:

```typescript
import {
  enterConsoleModeWithS2Handling,
  exitConsoleMode,
  resetInConsoleMode,
  resetS2ConsoleMode,
  isESP32S2,
  isConsoleResetSupported,
  isUsingWebUSB,
  type ModeSwitchingCallbacks,
} from "./mode-switching";
```

## Grundlegende Verwendung

### 1. Console Mode aktivieren (Bootloader → Firmware)

```typescript
const callbacks: ModeSwitchingCallbacks = {
  onLog: (msg) => console.log(msg),
  onError: (msg) => console.error(msg),
  onPortChange: async (message, reason) => {
    // Zeige Modal/Dialog für Port-Auswahl
    alert(message);
    
    // Fordere neuen Port an
    return await navigator.serial.requestPort();
  },
};

await enterConsoleModeWithS2Handling(esploader, callbacks);
```

### 2. Console Mode verlassen (Firmware → Bootloader)

```typescript
const callbacks: ModeSwitchingCallbacks = {
  onLog: (msg) => console.log(msg),
  onError: (msg) => console.error(msg),
  onPortChange: async (message, reason) => {
    alert(message);
    return await navigator.serial.requestPort();
  },
};

const needsReconnect = await exitConsoleMode(esploader, callbacks);
if (needsReconnect) {
  console.log("Port wurde gewechselt");
}
```

### 3. Reset im Console Mode

```typescript
// Prüfen ob unterstützt
if (isConsoleResetSupported(esploader)) {
  const callbacks: ModeSwitchingCallbacks = {
    onLog: (msg) => console.log(msg),
    onError: (msg) => console.error(msg),
  };
  
  await resetInConsoleMode(esploader, callbacks);
} else {
  console.log("Console Reset nicht unterstützt für dieses Gerät");
}
```

## ESP32-S2 Spezial-Handling

ESP32-S2 USB-OTG-Geräte benötigen besondere Behandlung, da der USB-Port bei jedem Mode-Wechsel neu enumeriert wird.

### ESP32-S2 Console Reset

```typescript
const callbacks: ModeSwitchingCallbacks = {
  onLog: (msg) => console.log(msg),
  onError: (msg) => console.error(msg),
  onPortChange: async (message, reason) => {
    // Zeige unterschiedliche Nachrichten je nach Schritt
    if (reason === "s2-reset-bootloader") {
      alert("Schritt 1/2: Wähle Bootloader-Port");
    } else if (reason === "s2-reset-console") {
      alert("Schritt 2/2: Wähle Firmware-Port");
    }
    
    return await navigator.serial.requestPort();
  },
};

await resetS2ConsoleMode(esploader, callbacks);
```

## Integration in UI-Komponenten

### Mit LitElement

```typescript
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { enterConsoleModeWithS2Handling } from "./mode-switching";
import "./components/ewt-s2-modal";

@customElement("my-console")
export class MyConsole extends LitElement {
  @state() private _esploader: any;

  private async _openConsole() {
    const callbacks = {
      onLog: (msg: string) => console.log(msg),
      onError: (msg: string) => console.error(msg),
      onPortChange: async (message: string, reason: string) => {
        // Zeige S2 Modal
        const modal = this.shadowRoot?.querySelector("ewt-s2-modal");
        if (modal) {
          await (modal as any).show();
        }
        
        // Fordere Port an
        return await navigator.serial.requestPort();
      },
    };

    try {
      await enterConsoleModeWithS2Handling(this._esploader, callbacks);
      console.log("Console Mode aktiv");
    } catch (err) {
      console.error("Fehler:", err);
    }
  }

  render() {
    return html`
      <button @click=${this._openConsole}>Open Console</button>
      <ewt-s2-modal></ewt-s2-modal>
    `;
  }
}
```

### Mit React

```typescript
import React, { useState } from "react";
import { enterConsoleModeWithS2Handling } from "./mode-switching";

function ConsoleButton({ esploader }) {
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const openConsole = async () => {
    const callbacks = {
      onLog: (msg) => console.log(msg),
      onError: (msg) => console.error(msg),
      onPortChange: async (message, reason) => {
        setModalMessage(message);
        setShowModal(true);
        
        // Warte auf Modal-Bestätigung
        await new Promise(resolve => {
          window.addEventListener("modal-confirmed", resolve, { once: true });
        });
        
        return await navigator.serial.requestPort();
      },
    };

    try {
      await enterConsoleModeWithS2Handling(esploader, callbacks);
      console.log("Console Mode aktiv");
    } catch (err) {
      console.error("Fehler:", err);
    }
  };

  return (
    <>
      <button onClick={openConsole}>Open Console</button>
      {showModal && (
        <div className="modal">
          <p>{modalMessage}</p>
          <button onClick={() => {
            setShowModal(false);
            window.dispatchEvent(new Event("modal-confirmed"));
          }}>
            Reconnect
          </button>
        </div>
      )}
    </>
  );
}
```

## Vollständiger Workflow

### Flash → Console → Exit

```typescript
async function flashAndConsole(esploader, firmwareData) {
  const callbacks = {
    onLog: (msg) => console.log(msg),
    onError: (msg) => console.error(msg),
    onPortChange: async (message, reason) => {
      alert(message);
      return await navigator.serial.requestPort();
    },
  };

  try {
    // 1. Flash Firmware (esploader ist im Bootloader-Modus)
    console.log("Flashing firmware...");
    // ... flash code hier ...
    
    // 2. Wechsel zu Console Mode
    console.log("Entering console mode...");
    await enterConsoleModeWithS2Handling(esploader, callbacks);
    
    // 3. Lese Console Output
    console.log("Reading console...");
    // ... console reading code hier ...
    
    // 4. Optional: Reset
    if (isConsoleResetSupported(esploader)) {
      await resetInConsoleMode(esploader, callbacks);
    }
    
    // 5. Zurück zum Bootloader
    console.log("Exiting console mode...");
    await exitConsoleMode(esploader, callbacks);
    
    console.log("Complete!");
  } catch (err) {
    console.error("Error:", err);
  }
}
```

## Geräte-Erkennung

### Prüfe Geräte-Fähigkeiten

```typescript
function checkDeviceCapabilities(esploader) {
  const isS2 = isESP32S2(esploader);
  const consoleResetSupported = isConsoleResetSupported(esploader);
  const usingWebUSB = isUsingWebUSB();

  console.log("Device:", esploader.chipName);
  console.log("ESP32-S2:", isS2);
  console.log("Console Reset:", consoleResetSupported);
  console.log("WebUSB:", usingWebUSB);

  if (isS2) {
    console.log("⚠ ESP32-S2 benötigt spezielle Behandlung");
    console.log("  - Port wechselt bei Mode-Änderung");
    console.log("  - Verwende resetS2ConsoleMode() für Reset");
  }

  if (!consoleResetSupported) {
    console.log("⚠ Console Reset nicht unterstützt");
    console.log("  - Verwende exitConsoleMode() + enterConsoleMode()");
  }
}
```

## WebUSB (Android) Support

Für Android/WebUSB müssen Sie die WebUSB-Serial-Wrapper verwenden:

```typescript
// Prüfe ob WebUSB verfügbar ist
if (isUsingWebUSB()) {
  console.log("Running on Android with WebUSB");
  
  // Verwende WebUSB Port-Request
  const requestSerialPort = (globalThis as any).requestSerialPort;
  const port = await requestSerialPort();
} else {
  // Desktop Web Serial
  const port = await navigator.serial.requestPort();
}
```

## Fehlerbehandlung

### Typische Fehler und Lösungen

```typescript
try {
  await enterConsoleModeWithS2Handling(esploader, callbacks);
} catch (err) {
  if (err.message.includes("cancelled")) {
    // Benutzer hat Port-Auswahl abgebrochen
    console.log("Operation cancelled by user");
  } else if (err.message.includes("Port")) {
    // Port-Fehler (z.B. bereits geöffnet)
    console.error("Port error:", err.message);
    alert("Bitte schließen Sie andere Anwendungen, die den Port verwenden");
  } else if (err.message.includes("USB")) {
    // USB-Verbindungsfehler
    console.error("USB error:", err.message);
    alert("Bitte verbinden Sie das Gerät erneut");
  } else {
    // Unbekannter Fehler
    console.error("Unknown error:", err.message);
  }
}
```

## Best Practices

### 1. Immer Callbacks bereitstellen

```typescript
// ✓ Gut
const callbacks = {
  onLog: (msg) => console.log(msg),
  onError: (msg) => console.error(msg),
  onPortChange: async (message, reason) => {
    // Handle port change
  },
};

// ✗ Schlecht
const callbacks = {}; // Fehlende Callbacks
```

### 2. Geräte-Fähigkeiten prüfen

```typescript
// ✓ Gut
if (isConsoleResetSupported(esploader)) {
  await resetInConsoleMode(esploader, callbacks);
} else {
  // Alternative Methode verwenden
  await exitConsoleMode(esploader, callbacks);
  await enterConsoleModeWithS2Handling(esploader, callbacks);
}

// ✗ Schlecht
await resetInConsoleMode(esploader, callbacks); // Kann fehlschlagen
```

### 3. ESP32-S2 speziell behandeln

```typescript
// ✓ Gut
if (isESP32S2(esploader)) {
  await resetS2ConsoleMode(esploader, callbacks);
} else {
  await resetInConsoleMode(esploader, callbacks);
}

// ✗ Schlecht
await resetInConsoleMode(esploader, callbacks); // Funktioniert nicht für S2
```

### 4. Port-Änderungen behandeln

```typescript
// ✓ Gut
const callbacks = {
  onPortChange: async (message, reason) => {
    // Zeige Benutzer-freundliche Nachricht
    const modal = document.querySelector("ewt-s2-modal");
    await modal.show();
    
    // Fordere neuen Port an
    return await navigator.serial.requestPort();
  },
};

// ✗ Schlecht
const callbacks = {
  onPortChange: async () => {
    // Keine Benutzer-Benachrichtigung
    return await navigator.serial.requestPort();
  },
};
```

## Debugging

### Aktiviere ausführliches Logging

```typescript
const callbacks = {
  onLog: (msg) => {
    console.log(`[MODE-SWITCH] ${msg}`);
    // Optional: Zeige in UI
    document.getElementById("log").textContent += msg + "\n";
  },
  onError: (msg) => {
    console.error(`[MODE-SWITCH ERROR] ${msg}`);
    // Optional: Zeige Fehler-Toast
    showErrorToast(msg);
  },
};
```

### Verfolge Port-Änderungen

```typescript
const callbacks = {
  onPortChange: async (message, reason) => {
    console.log("=== PORT CHANGE ===");
    console.log("Message:", message);
    console.log("Reason:", reason);
    console.log("Chip:", esploader.chipName);
    console.log("==================");
    
    return await navigator.serial.requestPort();
  },
};
```

## Weitere Ressourcen

- [MODE_SWITCHING_FLOWS.md](./MODE_SWITCHING_FLOWS.md) - Technische Details der Implementierung
- [mode-switching.ts](./src/mode-switching.ts) - Quellcode der Mode-Switching-Funktionen
- [mode-switching-example.ts](./src/examples/mode-switching-example.ts) - Vollständige Beispiele
- [ewt-s2-modal.ts](./src/components/ewt-s2-modal.ts) - S2 Modal-Komponente

## Support

Bei Problemen oder Fragen:
1. Prüfen Sie die Geräte-Fähigkeiten mit `checkDeviceCapabilities()`
2. Aktivieren Sie ausführliches Logging
3. Prüfen Sie die Browser-Konsole auf Fehler
4. Stellen Sie sicher, dass keine andere Anwendung den Port verwendet
