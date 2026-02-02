# ESP Web Tools next generation

Allow flashing Tasmota or other ESP-based firmwares via the browser. Will automatically detect the board type and select a supported firmware. [See website for full documentation.](https://jason2866.github.io/esp-web-tools/))

```html
<esp-web-install-button
  manifest="firmware/manifest.json"
></esp-web-install-button>
```

Example manifest:

```json
{
  "name": "Tasmota",
  "new_install_prompt_erase": true,
  "funding_url": "https://paypal.me/tasmota",
  "new_install_improv_wait_time": 10,
  "builds": [
    {
      "chipFamily": "ESP32",
      "improv": true,
      "parts": [
        { "path": "../firmware/tasmota32/tasmota32.factory.bin", "offset": 0 }
      ]
    },
    {
      "chipFamily": "ESP32-C2",
      "improv": true,
      "parts": [
        { "path": "../firmware/tasmota32/tasmota32c2.factory.bin", "offset": 0 }
      ]
    },
    {
      "chipFamily": "ESP32-C3",
      "improv": true,
      "parts": [
        { "path": "../firmware/tasmota32/tasmota32c3.factory.bin", "offset": 0 }
      ]
    },
    {
      "chipFamily": "ESP32-C5",
      "improv": true,
      "parts": [
        { "path": "../firmware/tasmota32/tasmota32c5.factory.bin", "offset": 0 }
      ]
    },
    {
      "chipFamily": "ESP32-C6",
      "improv": true,
      "parts": [
        { "path": "../firmware/tasmota32/tasmota32c6.factory.bin", "offset": 0 }
      ]
    },
    {
      "chipFamily": "ESP32-C61",
      "improv": true,
      "parts": [
        { "path": "../firmware/tasmota32/tasmota32c61.factory.bin", "offset": 0 }
      ]
    },
    {
      "chipFamily": "ESP32-S2",
      "improv": true,
      "parts": [
        { "path": "../firmware/tasmota32/tasmota32s2.factory.bin", "offset": 0 }
      ]
    },
    {
      "chipFamily": "ESP32-S3",
      "improv": true,
      "parts": [
        { "path": "../firmware/tasmota32/tasmota32s3.factory.bin", "offset": 0 }
      ]
    },
    {
      "chipFamily": "ESP8266",
      "improv": true,
      "parts": [{ "path": "../firmware/tasmota/tasmota.bin", "offset": 0 }]
    }
  ]
}
```

## Chip Variant Support (ESP32-P4)

For chips with multiple hardware revisions (like ESP32-P4), you can specify different firmware builds for each variant:

```json
{
  "name": "My Firmware",
  "builds": [
    {
      "chipFamily": "ESP32-P4",
      "chipVariant": "rev0",
      "parts": [{ "path": "firmware_p4_old.bin", "offset": 0 }]
    },
    {
      "chipFamily": "ESP32-P4",
      "chipVariant": "rev300",
      "parts": [{ "path": "firmware_p4_new.bin", "offset": 0 }]
    }
  ]
}
```

The `chipVariant` field is optional. If omitted, the build will match any variant of that chip family.

See [manifest-example-p4-variants.json](manifest-example-p4-variants.json) for a complete example.

## Performance

ESP Web Tools supports configurable baud rates for flashing. By default, it uses 115200 baud for maximum compatibility. You can increase the baud rate for significantly faster flashing speeds.

### Custom Baud Rate

You can customize the baud rate using the `baud-rate` attribute:

```html
<!-- Default: 115200 baud (maximum compatibility) -->
<esp-web-install-button manifest="manifest.json">
  <button slot="activate">Install</button>
</esp-web-install-button>

<!-- Fast: 2 Mbps (~17x faster, recommended for modern chips) -->
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="2000000">
  <button slot="activate">Install</button>
</esp-web-install-button>

<!-- Safe: 921600 baud (~8x faster, works with older USB-Serial chips) -->
<esp-web-install-button 
  manifest="manifest.json"
  baud-rate="921600">
  <button slot="activate">Install</button>
</esp-web-install-button>
```

Available baud rates: `230400`, `460800`, `921600`, `1500000`, `2000000`

## Development

Run `script/develop`. This starts a server. Open it on http://localhost:5001.
