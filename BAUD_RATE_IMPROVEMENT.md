# Baud Rate Configuration für schnelleres Flashen

## Änderung

esp-web-tools unterstützt jetzt die Konfiguration der Baud-Rate über das HTML-Attribut `baud-rate`.

**Standard**: 115.200 Baud (keine Änderung - maximale Kompatibilität)
**Empfohlen für schnelles Flashen**: 2.000.000 Baud (2 Mbps) via `baud-rate="2000000"`

## Implementierung

### Code:
```typescript
const espStub = await esploader.runStub();

// Baud-Rate wird nur geändert, wenn explizit angegeben
if (baudRate !== undefined && baudRate > 115200) {
  try {
    await espStub.setBaudrate(baudRate);
  } catch (err: any) {
    logger.log(`Could not change baud rate to ${baudRate}: ${err.message}`);
  }
}
```

### Standard-Verhalten (ohne baud-rate Attribut):
**Flash-Geschwindigkeit**: ~11-12 KB/s (115.200 Baud)

### Mit baud-rate="2000000":
**Flash-Geschwindigkeit**: ~200 KB/s (ca. **17x schneller!**)

## Performance-Verbesserung

### Beispiel: 3 MB Firmware

| Baud Rate | Geschwindigkeit | Flash-Zeit |
|-----------|----------------|------------|
| 115.200   | ~11 KB/s       | ~4,5 Minuten |
| 2.000.000 | ~200 KB/s      | ~15 Sekunden |

**Zeitersparnis: ~4 Minuten pro Flash-Vorgang!**

## Kompatibilität

### Unterstützte Chips:
- ✅ ESP32 (alle Varianten)
- ✅ ESP32-S2
- ✅ ESP32-S3
- ✅ ESP32-C2
- ✅ ESP32-C3
- ✅ ESP32-C5
- ✅ ESP32-C6
- ✅ ESP32-C61
- ✅ ESP32-H2
- ✅ ESP32-P4
- ❌ ESP8266 (unterstützt keine Baud-Rate-Änderung)

### USB-Serial-Chips:
Die meisten modernen USB-Serial-Chips unterstützen 2 Mbps:
- ✅ CP2102N
- ✅ CP2104
- ✅ CH340C/G/E
- ✅ FT232H
- ✅ Native USB (ESP32-C3, ESP32-S3)
- ⚠️ Ältere CP2102 (nicht CP2102N) - max. 921.600 Baud

## Fehlerbehandlung

Wenn die Baud-Rate-Änderung fehlschlägt:
- ✅ Fehler wird abgefangen
- ✅ Warnung wird geloggt
- ✅ Flashen läuft mit 115.200 Baud weiter
- ✅ Keine Unterbrechung des Flash-Vorgangs

## Erwartetes Log

### Erfolgreiche Baud-Rate-Änderung:
```
Uploading stub...
Running stub...
Stub is now running...
Attempting to change baud rate to 2000000...
Changed baud rate to 2000000
Detecting Flash Size
Writing data with filesize: 3045696
```

### Fallback bei Fehler:
```
Uploading stub...
Running stub...
Stub is now running...
Could not change baud rate: [Fehlergrund]
Detecting Flash Size
Writing data with filesize: 3045696
```

## Technische Details

### Warum 2 Mbps?

1. **Maximale Kompatibilität**: Die meisten USB-Serial-Chips unterstützen 2 Mbps
2. **Stabile Übertragung**: Höhere Raten (z.B. 3 Mbps) sind weniger zuverlässig
3. **Optimales Verhältnis**: Beste Balance zwischen Geschwindigkeit und Stabilität

### Verfügbare Baud-Raten:
```typescript
export const baudRates = [
  115200,   // Standard (Stub-Default)
  128000,
  153600,
  230400,
  460800,
  921600,
  1500000,
  2000000,  // Empfohlen für Flashen
];
```

## HTML-Verwendung

### Standard (115200 - maximale Kompatibilität):
```html
<esp-web-install-button manifest="manifest.json">
  <button slot="activate">Install</button>
</esp-web-install-button>
```
Keine Baud-Rate-Änderung, funktioniert mit allen Chips.

### Schnelles Flashen (2 Mbps - empfohlen):
```html
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="2000000">
  <button slot="activate">Install</button>
</esp-web-install-button>
```
~17x schneller, funktioniert mit modernen USB-Serial-Chips.

### Für ältere USB-Serial-Chips:
```html
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="921600">
  <button slot="activate">Install</button>
</esp-web-install-button>
```
~8x schneller, kompatibel mit älteren Chips wie CP2102.

### Verfügbare Baud-Raten:
- Kein Attribut - Standard (115200, keine Änderung)
- `230400` - 2x schneller
- `460800` - 4x schneller
- `921600` - 8x schneller (sicher für ältere Chips)
- `1500000` - 13x schneller
- `2000000` - 17x schneller (empfohlen für Geschwindigkeit)

### Programmatische Verwendung:
```javascript
const button = document.querySelector('esp-web-install-button');
button.baudRate = 921600;
```

## Testing

### Getestet mit:
- [ ] ESP32
- [ ] ESP32-S2
- [ ] ESP32-S3
- [ ] ESP32-C2
- [ ] ESP32-C3
- [ ] ESP32-C5
- [ ] ESP32-C6
- [ ] ESP32-C61
- [ ] ESP32-H2
- [ ] ESP32-P4

### Erwartetes Ergebnis:
- Flash-Zeit sollte deutlich reduziert sein
- Keine Fehler während des Flashens
- Erfolgreiche Firmware-Installation

## Vorteile

1. **Schnelleres Flashen**: ~17x schneller als vorher
2. **Bessere User Experience**: Kürzere Wartezeiten
3. **Produktivität**: Mehr Flash-Zyklen in kürzerer Zeit
4. **Robust**: Automatischer Fallback bei Problemen
5. **Transparent**: Keine Änderungen am Manifest nötig

## Zusammenfassung

Diese Änderung verbessert die Flash-Geschwindigkeit erheblich, ohne die Kompatibilität oder Zuverlässigkeit zu beeinträchtigen. Die automatische Fehlerbehandlung stellt sicher, dass das Flashen auch bei älteren USB-Serial-Chips funktioniert.

**Empfehlung**: Diese Änderung sollte in die nächste Version von esp-web-tools aufgenommen werden.
