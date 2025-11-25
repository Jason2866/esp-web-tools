# Baud Rate Configuration

## Übersicht

Die Baud-Rate für das Flashen ist jetzt **konfigurierbar** über das HTML-Attribut `baud-rate`.

**Standard**: 115.200 Baud (keine Änderung) - maximale Kompatibilität mit allen Systemen

## HTML-Verwendung

### Standard (115200 - maximale Kompatibilität)
```html
<esp-web-install-button manifest="manifest.json">
  <button slot="activate">Install</button>
</esp-web-install-button>
```
Keine Baud-Rate-Änderung, funktioniert mit allen Chips.

### Schnelles Flashen (2 Mbps - empfohlen)
```html
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="2000000">
  <button slot="activate">Install</button>
</esp-web-install-button>
```
~17x schneller, funktioniert mit modernen USB-Serial-Chips.

### Für ältere Chips (921600)
```html
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="921600">
  <button slot="activate">Install</button>
</esp-web-install-button>
```
~8x schneller, kompatibel mit älteren Chips.

## Verfügbare Baud-Raten

| Baud Rate | Geschwindigkeit | Flash-Zeit (3 MB) | Empfehlung |
|-----------|----------------|-------------------|------------|
| 115200 | ~11 KB/s | ~4,5 Minuten | Nur für Debugging |
| 230400 | ~22 KB/s | ~2,3 Minuten | Sehr kompatibel |
| 460800 | ~44 KB/s | ~70 Sekunden | Hohe Kompatibilität |
| 921600 | ~88 KB/s | ~35 Sekunden | Sicher für ältere Chips |
| 1500000 | ~143 KB/s | ~21 Sekunden | Moderne Chips |
| 2000000 | ~200 KB/s | ~15 Sekunden | Empfohlen für Geschwindigkeit |

## Anwendungsfälle

### 1. Standard-Verwendung (maximale Kompatibilität)
```html
<esp-web-install-button manifest="manifest.json">
  <button slot="activate">Install Firmware</button>
</esp-web-install-button>
```
- ✅ Funktioniert mit allen Chips und USB-Serial-Adaptern
- ✅ Keine Konfiguration nötig
- ✅ Maximale Zuverlässigkeit

### 2. Schnelles Flashen (empfohlen für Geschwindigkeit)
```html
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="2000000">
  <button slot="activate">Install Firmware</button>
</esp-web-install-button>
```
- ✅ ~17x schneller als Standard
- ✅ Funktioniert mit modernen USB-Serial-Chips
- ✅ Spart viel Zeit bei großen Firmware-Dateien

### 3. Für ältere USB-Serial-Chips
```html
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="921600">
  <button slot="activate">Install Firmware</button>
</esp-web-install-button>
```
- ✅ Kompatibel mit älteren CP2102 (nicht CP2102N)
- ✅ Immer noch 8x schneller als 115200
- ✅ Sehr zuverlässig

### 4. Gute Balance
```html
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="460800">
  <button slot="activate">Install Firmware</button>
</esp-web-install-button>
```
- ✅ Funktioniert mit fast allen USB-Serial-Chips
- ✅ Gute Balance zwischen Geschwindigkeit und Kompatibilität
- ✅ 4x schneller als 115200



## Programmatische Verwendung

### JavaScript
```javascript
const button = document.querySelector('esp-web-install-button');
button.baudRate = 921600;
```

### Dynamische Anpassung
```javascript
// Erkenne USB-Serial-Chip und setze optimale Baud-Rate
const button = document.querySelector('esp-web-install-button');

// Beispiel: Basierend auf User-Auswahl
document.getElementById('speed-select').addEventListener('change', (e) => {
  button.baudRate = parseInt(e.target.value);
});
```

## USB-Serial-Chip Kompatibilität

### 2 Mbps (2000000) - Empfohlen für Geschwindigkeit
✅ **Unterstützt von:**
- CP2102N (neuere Version)
- CP2104
- CH340C/G/E (neuere Versionen)
- FT232H
- Native USB (ESP32-C3, ESP32-S3, ESP32-C6)

### 921600 - Sicher für ältere Chips
✅ **Unterstützt von:**
- Alle oben genannten
- CP2102 (ältere Version)
- CH340G (ältere Versionen)
- Die meisten USB-Serial-Chips

### 460800 - Maximale Kompatibilität
✅ **Unterstützt von:**
- Praktisch alle USB-Serial-Chips
- Auch sehr alte Chips

## Fehlerbehandlung

Wenn die Baud-Rate-Änderung fehlschlägt:
1. ✅ Fehler wird automatisch abgefangen
2. ✅ Warnung wird im Log ausgegeben
3. ✅ Flashen läuft mit 115200 Baud weiter
4. ✅ Keine Unterbrechung des Vorgangs

**Log-Beispiel bei Fehler:**
```
Uploading stub...
Running stub...
Stub is now running...
Could not change baud rate to 2000000: [Fehlergrund]
Detecting Flash Size
[Flashen läuft mit 115200 Baud weiter]
```

## Empfehlungen

### Für Endbenutzer-Websites (empfohlen: schnell)
```html
<!-- Schnelles Flashen für moderne Hardware -->
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="2000000">
  <button slot="activate">Install</button>
</esp-web-install-button>
```

### Für maximale Kompatibilität
```html
<!-- Standard: Funktioniert mit allen Chips -->
<esp-web-install-button manifest="manifest.json">
  <button slot="activate">Install</button>
</esp-web-install-button>
```

### Für Entwickler / Power-User
```html
<!-- Biete Auswahl an -->
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

### Für Support-Seiten
```html
<!-- Niedrigere Baud-Rate für problematische Fälle -->
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="460800">
  <button slot="activate">Install (Safe Mode)</button>
</esp-web-install-button>
```

## Real-World Beispiel (Tasmota-Style)

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://unpkg.com/esp-web-tools@latest/dist/web/install-button.js?module"></script>
</head>
<body>
  <h1>Install Firmware</h1>
  
  <!-- Standard: Schnell -->
  <esp-web-install-button manifest="firmware/manifest.json">
    <button slot="activate">Install (Fast)</button>
  </esp-web-install-button>
  
  <!-- Für ältere Hardware -->
  <esp-web-install-button 
    manifest="firmware/manifest.json"
    baud-rate="921600">
    <button slot="activate">Install (Compatible)</button>
  </esp-web-install-button>
</body>
</html>
```

## Migration von hart-codiert zu konfigurierbar

### Vorher (hart-codiert):
```typescript
// In flash.ts
await espStub.setBaudrate(2000000);  // Immer 2 Mbps
```

### Nachher (konfigurierbar):
```typescript
// In flash.ts
const targetBaudRate = baudRate !== undefined ? baudRate : 2000000;
if (targetBaudRate > 115200) {
  await espStub.setBaudrate(targetBaudRate);
}
```

```html
<!-- Im HTML -->
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="921600">  <!-- Konfigurierbar! -->
  <button slot="activate">Install</button>
</esp-web-install-button>
```

## Vorteile der Konfigurierbarkeit

1. ✅ **Flexibilität**: Jede Website kann die optimale Baud-Rate wählen
2. ✅ **Kompatibilität**: Unterstützung für ältere Hardware möglich
3. ✅ **User-Auswahl**: Benutzer können selbst wählen
4. ✅ **Debugging**: Niedrigere Raten für Fehlersuche
5. ✅ **Abwärtskompatibel**: Standard bleibt 2 Mbps
6. ✅ **Keine Breaking Changes**: Bestehender Code funktioniert weiter

## Testing

Testen Sie verschiedene Baud-Raten mit Ihrer Hardware:

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

Messen Sie die Flash-Zeit und wählen Sie die beste Balance zwischen Geschwindigkeit und Zuverlässigkeit für Ihre Zielgruppe.
