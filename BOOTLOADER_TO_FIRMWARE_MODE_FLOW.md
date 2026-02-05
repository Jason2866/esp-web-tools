# ESP32 Bootloader zu Firmware Mode Wechsel - Dokumentation

## Übersicht

Dieser Dokument beschreibt, wie esp32tool den Wechsel vom Bootloader-Modus in den Firmware-Modus für die Console durchführt, insbesondere für ESP32-S2/S3/C3/C5/C6/H2/P4 mit USB-JTAG/OTG.

## Problem

ESP32-S2/S3/C3/C5/C6/H2/P4 Chips mit USB-JTAG/OTG haben eine Besonderheit:
- Im **Bootloader-Modus**: USB-Serial-JTAG Interface aktiv
- Im **Firmware-Modus**: USB-CDC Interface aktiv (wenn Firmware es unterstützt)
- **Beim Wechsel zwischen Modi ändert sich die USB-Gerät-ID** → Port wird ungültig!

## Lösung in esp32tool

### 1. `enterConsoleMode()` Methode

Die Methode `enterConsoleMode()` in `esp_loader.ts` führt den Wechsel durch:

```typescript
async enterConsoleMode(): Promise<boolean> {
  // Prüfen ob USB-JTAG/OTG Device
  const isUsbJtag = await this.detectUsbConnectionType();
  
  if (isUsbJtag) {
    // USB-JTAG/OTG: Watchdog Timer Reset verwenden
    // Dies startet die Firmware und schließt den Port
    await this.resetViaWatchdog();
    return true; // Port wurde geschlossen
  } else {
    // Externe Serial Chips: Normaler Hardware Reset
    await this.hardReset(false);
    return false; // Port bleibt offen
  }
}
```

### 2. Watchdog Timer Reset für USB-JTAG/OTG

```typescript
async resetViaWatchdog(): Promise<void> {
  // RTC_CNTL Register für Watchdog Timer
  const RTC_CNTL_WDTWPROTECT_REG = 0x6000809c;
  const RTC_CNTL_WDTCONFIG0_REG = 0x60008090;
  const RTC_CNTL_WDTFEED_REG = 0x600080a4;
  
  // 1. Watchdog schreibschutz deaktivieren
  await this.writeReg(RTC_CNTL_WDTWPROTECT_REG, 0x50d83aa1);
  
  // 2. Watchdog konfigurieren (kurzes Timeout)
  await this.writeReg(RTC_CNTL_WDTCONFIG0_REG, 0x8000001f);
  
  // 3. Watchdog füttern (startet Timer)
  await this.writeReg(RTC_CNTL_WDTFEED_REG, 1);
  
  // 4. Watchdog schreibschutz wieder aktivieren
  await this.writeReg(RTC_CNTL_WDTWPROTECT_REG, 0);
  
  // Watchdog löst Reset aus → Firmware startet
  // USB-Gerät wird neu aufgezählt → Port wird ungültig
}
```

### 3. Port-Reconnect Flow in script.js

Nach dem Watchdog Reset muss ein neuer Port ausgewählt werden:

```javascript
async function clickConsole() {
  // 1. Aktuellen Zustand speichern
  espLoaderBeforeConsole = espStub._parent || espStub;
  baudRateBeforeConsole = espLoaderBeforeConsole.currentBaudRate;
  chipFamilyBeforeConsole = espStub.chipFamily;
  
  // 2. Console Mode aktivieren
  const portWasClosed = await espStub.enterConsoleMode();
  
  if (portWasClosed) {
    // 3. USB-JTAG/OTG: Port wurde geschlossen
    
    // 3a. Alte Port-Referenzen löschen
    espStub.port = null;
    espStub.connected = false;
    
    // 3b. Warten auf USB Re-Enumeration
    const isWebUSB = isUsingWebUSB();
    const waitTime = isWebUSB ? 1000 : 500; // Android braucht länger
    await sleep(waitTime);
    
    // 3c. Modal für User Gesture anzeigen
    const isS2 = chipFamilyBeforeConsole === 0x3252;
    const needsModal = isS2 || isWebUSB;
    
    if (needsModal) {
      // ESP32-S2 oder Android: Modal verwenden
      showModalForPortSelection();
    } else {
      // Desktop mit S3/C3/etc: Direkt requestPort
      const newPort = await navigator.serial.requestPort();
      await openConsolePortAndInit(newPort);
    }
  } else {
    // 4. Externe Serial Chips: Port bleibt offen
    await initConsoleUI();
  }
}
```

### 4. Port öffnen für Console

```javascript
async function openConsolePortAndInit(newPort) {
  // 1. Port bei 115200 Baud öffnen (Firmware Standard)
  await newPort.open({ baudRate: 115200 });
  
  // 2. Port-Referenzen aktualisieren
  espStub.port = newPort;
  espStub.connected = true;
  
  if (espStub._parent) {
    espStub._parent.port = newPort;
  }
  if (espLoaderBeforeConsole) {
    espLoaderBeforeConsole.port = newPort;
  }
  
  // 3. Console UI initialisieren
  await initConsoleUI();
}
```

## Wichtige Unterschiede zwischen Chip-Typen

### USB-JTAG/OTG Chips (S2/S3/C3/C5/C6/H2/P4)
- **Reset-Methode**: Watchdog Timer Reset
- **Port-Verhalten**: Port wird geschlossen und neu aufgezählt
- **User Gesture**: Erforderlich für neuen Port (requestPort)
- **Wartezeit**: 500ms (Desktop) / 1000ms (Android)

### Externe Serial Chips (CP2102, CH340, FTDI)
- **Reset-Methode**: DTR/RTS Toggle (hardReset)
- **Port-Verhalten**: Port bleibt offen
- **User Gesture**: Nicht erforderlich
- **Wartezeit**: 200ms

## Plattform-spezifische Besonderheiten

### Desktop (Web Serial)
- ESP32-S3/C3/C5/C6/H2/P4: Direkter `requestPort()` Aufruf möglich
- ESP32-S2: Modal erforderlich (Browser-Einschränkung)

### Android (WebUSB)
- **Alle Chips**: Modal erforderlich für User Gesture
- **Längere Wartezeit**: 1000ms für USB-Enumeration
- **WebUSBSerial.requestPort()**: Spezielle Methode verwenden

## Implementierung in esp-web-tools

Um diesen Flow in esp-web-tools zu implementieren:

1. **`enterConsoleMode()` zu WebSerial_ESPTool hinzufügen**
   - Chip-Typ erkennen (USB-JTAG vs. externe Serial)
   - Entsprechende Reset-Methode verwenden
   - Boolean zurückgeben ob Port geschlossen wurde

2. **`resetViaWatchdog()` implementieren**
   - RTC_CNTL Register schreiben
   - Watchdog Timer konfigurieren

3. **Port-Reconnect Flow in install-dialog.ts**
   - Nach `enterConsoleMode()` prüfen ob Port geschlossen
   - Bei USB-JTAG: User Gesture für neuen Port
   - Bei Serial Chip: Direkt Console öffnen

4. **Plattform-Erkennung**
   - WebUSB vs. Web Serial
   - Entsprechende Wartezeiten
   - Modal vs. direkter requestPort

## Vorteile dieser Lösung

1. **Zuverlässig**: Watchdog Reset funktioniert immer
2. **Sauber**: Firmware startet komplett neu
3. **Kompatibel**: Funktioniert auf Desktop und Android
4. **Transparent**: User versteht was passiert (Modal)

## Referenzen

- esp32tool: `src/esp_loader.ts` - `enterConsoleMode()`, `resetViaWatchdog()`
- esp32tool: `js/script.js` - `clickConsole()`, `openConsolePortAndInit()`
- ESP32 Technical Reference Manual: RTC_CNTL Watchdog Timer
