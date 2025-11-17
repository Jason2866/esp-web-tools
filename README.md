# ESP Web Tools

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

## Development

Run `script/develop`. This starts a server. Open it on http://localhost:5001.
