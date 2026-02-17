# Mode Switching Flows Implementation

Diese Dokumentation beschreibt die aus esp32tool implementierten Mode-Switching-Flows in esp-web-tools.

## Übersicht

Die Mode-Switching-Flows ermöglichen den Wechsel zwischen Bootloader-Modus und Firmware-Modus für ESP32-Chips, insbesondere für USB-JTAG/OTG-Geräte wie ESP32-S2, ESP32-S3 und ESP32-P4.

## Implementierte Flows

### 1. Bootloader → Firmware Mode (enterConsoleMode)

**Datei**: `WebSerial_ESPTool/src/esp_loader.ts`

**Methode**: `enterConsoleMode(): Promise<boolean>`

**Beschreibung**: Bereitet das Gerät für den Console-Modus vor, indem es vom Bootloader in den Firmware-Modus wechselt.

**Verhalten**:
- **USB-JTAG/OTG Geräte**: Verwendet Watchdog-Reset, Port wird geschlossen
- **Externe Serial-Chips**: Port bleibt offen, einfacher Hardware-Reset

**Rückgabewert**: 
- `true` = Port wurde geschlossen (USB-JTAG), Caller muss Port neu öffnen
- `false` = Port bleibt offen (Serial-Chip)

**Flow für ESP32-S2 USB-OTG**:
1. USB-Verbindungstyp erkennen
2. Console-Mode-Flag setzen
3. Watchdog-Reset durchführen (WDT)
4. Port wird automatisch geschlossen
5. USB-Gerät re-enumeriert sich
6. Benutzer muss neuen Port auswählen

### 2. Firmware → Bootloader Mode (exitConsoleMode)

**Datei**: `WebSerial_ESPTool/src/esp_loader.ts`

**Methode**: `exitConsoleMode(): Promise<boolean>`

**Beschreibung**: Verlässt den Console-Modus und kehrt zum Bootloader zurück.

**Verhalten für ESP32-S2/P4 USB-OTG**:
1. Console-Mode-Flag löschen
2. Hardware-Reset zum Bootloader (GPIO0=LOW)
3. Port wechselt von CDC (Firmware) zu JTAG (Bootloader)
4. Event "usb-otg-port-change" wird ausgelöst
5. Benutzer muss Bootloader-Port auswählen

**Rückgabewert**:
- `true` = Manuelle Reconnection erforderlich (ESP32-S2)
- `false` = Keine manuelle Reconnection erforderlich

### 3. Reset im Console Mode (resetInConsoleMode)

**Datei**: `WebSerial_ESPTool/src/esp_loader.ts`

**Methode**: `resetInConsoleMode(): Promise<void>`

**Beschreibung**: Setzt das Gerät zurück, während es sich im Console-Modus (Firmware-Modus) befindet.

**Wichtig**: 
- **ESP32-S2 USB-JTAG/CDC**: NICHT unterstützt! Jeder Reset führt zum Verlust des USB-Ports (Hardware-Limitation)
- Verwenden Sie `isConsoleResetSupported()` zur Prüfung vor dem Aufruf

**Verhalten**:
- Für ESP32-S2: Keine Aktion (nicht unterstützt)
- Für andere Geräte: Standard-Firmware-Reset

### 4. Sync und WDT Reset (syncAndWdtReset)

**Datei**: `WebSerial_ESPTool/src/esp_loader.ts`

**Methode**: `syncAndWdtReset(newPort: SerialPort): Promise<void>`

**Beschreibung**: Öffnet einen neuen Bootloader-Port, synchronisiert mit ROM und führt WDT-Reset durch.

**Verwendung**: Speziell für ESP32-S2 USB-OTG-Geräte, die WDT-Reset zum Mode-Wechsel benötigen.

**Flow**:
1. Neuen Port öffnen bei 115200 Baud
2. Mit Bootloader-ROM synchronisieren (kein Stub, keine Reset-Strategien)
3. WDT-Reset auslösen
4. Gerät bootet in Firmware-Modus
5. Port re-enumeriert sich erneut
6. Benutzer muss neuen Port auswählen

### 5. Reconnect zum Bootloader (reconnectToBootloader)

**Datei**: `WebSerial_ESPTool/src/esp_loader.ts`

**Methode**: `reconnectToBootloader(): Promise<void>`

**Beschreibung**: Schließt und öffnet den Port neu, dann Reset zum Bootloader-Modus.

**Verwendung**: Nach Improv oder anderen Operationen, die ESP im Firmware-Modus lassen.

**Flow**:
1. Console-Mode-Flag löschen
2. Port schließen
3. Port bei 115200 Baud öffnen
4. Read-Loop starten
5. Reset zum Bootloader mit mehreren Strategien
6. Chip-Typ erkennen

## ESP32-S2 Modal Changes Flow

**Datei**: `esp32tool/js/script.js`

**Funktion**: `showS2Modal(title, text): Promise<void>`

**Beschreibung**: Zeigt ein Modal für ESP32-S2 USB-Port-Wechsel an.

**Verwendung in esp-web-tools**:
Der Modal-Flow sollte in der UI-Komponente implementiert werden, wenn:
1. ESP32-S2 erkannt wird
2. Port-Wechsel nach WDT-Reset erforderlich ist
3. Benutzer-Geste für Port-Auswahl benötigt wird (Android/WebUSB)

**Beispiel-Flow**:
```typescript
// Nach WDT-Reset
if (chipFamily === CHIP_FAMILY_ESP32S2 || isWebUSB) {
  // Modal anzeigen
  await showModal(
    "Device has been reset to firmware mode",
    "Please click the button below to select the serial port for console."
  );
  
  // Neuen Port anfordern
  const newPort = await requestPort();
  await openConsolePortAndInit(newPort);
}
```

## Improv Mode Wechsel

**Datei**: `esp32tool/js/improv.js`

**Klasse**: `ImprovSerial`

**Beschreibung**: Implementiert das Improv Wi-Fi Serial Protocol für ESP-Geräte.

**Verwendung in esp-web-tools**:
Die Improv-Implementierung ist bereits über die `improv-wifi-serial-sdk` Bibliothek verfügbar und wird in `install-dialog.ts` verwendet.

**Flow zum Wechsel in Improv-Modus**:
1. Gerät muss im Firmware-Modus sein
2. `ImprovSerial` Instanz erstellen mit geöffnetem Port
3. `initialize()` aufrufen um Improv zu erkennen
4. Improv-Befehle senden (Wi-Fi-Konfiguration, etc.)
5. Nach Improv: `reconnectToBootloader()` verwenden um zurück zum Bootloader zu wechseln

## Chip-spezifische Besonderheiten

### ESP32-S2
- **USB-OTG**: Port wechselt bei jedem Mode-Wechsel
- **WDT-Reset erforderlich**: Für Bootloader → Firmware
- **Console-Reset NICHT unterstützt**: Port geht bei jedem Reset verloren
- **Modal erforderlich**: Für Port-Auswahl nach Reset

### ESP32-S3
- **USB-JTAG/Serial**: Ähnlich wie S2, aber stabiler
- **WDT-Reset unterstützt**: Für Mode-Wechsel
- **Console-Reset unterstützt**: Für andere Verbindungstypen

### ESP32-P4
- **USB-OTG**: Ähnlich wie S2
- **WDT-Reset unterstützt**: Für Mode-Wechsel
- **Revision-abhängig**: Rev 301 benötigt Flash-Power-On

### ESP32-C3/C5/C6/H2
- **USB-JTAG/Serial**: Kein WDT-Reset erforderlich
- **Classic Reset**: Funktioniert für Mode-Wechsel
- **Port bleibt offen**: Bei Mode-Wechsel

## Events

### usb-otg-port-change
Wird ausgelöst wenn USB-OTG-Gerät Port wechselt.

**Detail**:
```typescript
{
  chipName: string,
  message: string,
  reason: "exit-console-to-bootloader" | "wdt-reset-to-firmware"
}
```

## Hilfsmethoden

### isConsoleResetSupported()
Prüft ob Console-Reset für dieses Gerät unterstützt wird.

**Rückgabe**: `false` für ESP32-S2 USB-JTAG/CDC, sonst `true`

### detectUsbConnectionType()
Erkennt ob Gerät USB-JTAG/OTG oder externen Serial-Chip verwendet.

**Rückgabe**: `true` für USB-JTAG/OTG, `false` für externen Serial-Chip

## Integration in esp-web-tools

Die Flows sind bereits in der `tasmota-webserial-esptool` Bibliothek implementiert, die von esp-web-tools verwendet wird. Die UI-Komponenten in esp-web-tools müssen die entsprechenden Methoden aufrufen und auf Events reagieren.

**Beispiel-Integration**:
```typescript
// Console-Modus aktivieren
const portClosed = await this.esploader.enterConsoleMode();
if (portClosed) {
  // Port wurde geschlossen, neuen Port anfordern
  const newPort = await requestPort();
  // Port öffnen und Console initialisieren
}

// Console-Modus verlassen
const needsReconnect = await this.esploader.exitConsoleMode();
if (needsReconnect) {
  // Manuelle Reconnection erforderlich
  const bootloaderPort = await requestPort();
  // Mit Bootloader verbinden
}
```

## Referenzen

- **esp32tool**: Original-Implementierung in `esp32tool/js/modules/esptool.js`
- **WebSerial_ESPTool**: TypeScript-Port in `WebSerial_ESPTool/src/esp_loader.ts`
- **esp-web-tools**: UI-Integration in `esp-web-tools/src/install-dialog.ts`
