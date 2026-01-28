# Neuer Connection Flow für Serial und CDC/JTAG Devices

## Änderungen

### ALT (Vorher):
1. **Initial Connect** → Sofort in Bootloader-Modus wechseln
2. Improv testen (funktioniert nicht, da im Bootloader)
3. Für USB-JTAG/OTG: Port wechseln, User muss neuen Port wählen
4. Dann erst Improv testen

### NEU (Jetzt):
1. **Initial Connect** → Im Firmware-Modus bleiben (KEIN Bootloader-Wechsel!)
2. **Improv sofort testen** (Device ist bereits in Firmware)
3. **Bootloader nur bei Bedarf**:
   - Beim Klick auf "Install" / "Update"
   - Beim Klick auf "Manage Filesystem"
   - NICHT beim initialen Connect!

## Vorteile

### Für alle Devices:
- ✅ Schnellerer Connect (kein unnötiger Bootloader-Wechsel)
- ✅ Improv funktioniert sofort (Device ist in Firmware)
- ✅ Weniger Komplexität beim initialen Connect

### Für USB-JTAG/OTG Devices (ESP32-S2, S3, C3, C5, C6, H2, P4):
- ✅ KEIN Port-Wechsel beim initialen Connect
- ✅ User muss NICHT zweimal Port auswählen
- ✅ Improv funktioniert ohne Port-Reconnect
- ✅ Nur bei Flash/Filesystem: Port-Wechsel nötig

### Für External Serial Chips (CP2102, CH340, etc.):
- ✅ Kein Unterschied im Verhalten
- ✅ Port bleibt immer gleich
- ✅ Improv funktioniert sofort

## Implementierung

### `_initialize()` - Vereinfacht
```typescript
// NEU: Kein Bootloader-Wechsel mehr!
// Einfach direkt Improv testen
this.logger.log("NEW FLOW: Testing Improv without bootloader switch");

const client = new ImprovSerial(this._port, this.logger);
const info = await client.initialize(timeout);
// Fertig!
```

### `_confirmInstall()` - Bootloader bei Bedarf
```typescript
// CRITICAL: Für Flash-Operationen MÜSSEN wir in Bootloader
this.logger.log("Preparing for flash (switching to bootloader)...");
await this._prepareForFlashOperations();
await this._ensureStub();
// Jetzt flashen
```

### "Manage Filesystem" Button - Bootloader bei Bedarf
```typescript
// CRITICAL: Filesystem-Management braucht Bootloader
this.logger.log("Preparing for filesystem (switching to bootloader)...");
await this._prepareForFlashOperations();
await this._ensureStub();
// Jetzt Partitionen lesen
```

## Flow-Diagramm

### Initial Connect (NEU):
```
User klickt "Connect"
    ↓
esptoolConnect() - Port öffnen
    ↓
Device ist in FIRMWARE-Modus ✅
    ↓
Improv testen (funktioniert sofort!) ✅
    ↓
Dashboard anzeigen
```

### Install/Flash (bei Bedarf):
```
User klickt "Install"
    ↓
_prepareForFlashOperations()
    ↓
Wechsel zu BOOTLOADER-Modus
    ↓
Stub laden
    ↓
Flashen
    ↓
Nach Flash: Zurück zu Firmware
    ↓
Improv neu testen
```

### Manage Filesystem (bei Bedarf):
```
User klickt "Manage Filesystem"
    ↓
_prepareForFlashOperations()
    ↓
Wechsel zu BOOTLOADER-Modus
    ↓
Stub laden
    ↓
Partitionen lesen/schreiben
```

## Geänderte Dateien

- `esp-web-tools/src/install-dialog.ts`:
  - `_initialize()` - Vereinfacht, kein Bootloader-Wechsel
  - `_confirmInstall()` - Bootloader-Wechsel hinzugefügt
  - "Manage Filesystem" Button - Bootloader-Wechsel hinzugefügt
  - `_skipModeSwitch` Variable entfernt (nicht mehr nötig)

## Testing

Teste mit:
1. **USB-JTAG/OTG Device** (ESP32-S3):
   - Connect → Improv sollte sofort funktionieren
   - Install → Bootloader-Wechsel, dann Flash
   - Manage Filesystem → Bootloader-Wechsel, dann Partitionen

2. **External Serial Chip** (CP2102):
   - Connect → Improv sollte sofort funktionieren
   - Install → Bootloader-Wechsel, dann Flash
   - Manage Filesystem → Bootloader-Wechsel, dann Partitionen
