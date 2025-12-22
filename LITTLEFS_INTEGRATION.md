# LittleFS Integration in ESP Web Tools

## Summary

LittleFS support was successfully ported from WebSerial_ESPTool (Version 7.3.0, Branch electron) to ESP Web Tools.

## Added Files

### WASM Modules
- `src/wasm/littlefs/littlefs.js` - Emscripten-generated LittleFS WASM module
- `src/wasm/littlefs/littlefs.wasm` - Compiled LittleFS WebAssembly binary
- `src/wasm/littlefs/index.js` - TypeScript-friendly API for LittleFS
- `src/wasm/littlefs/index.d.ts` - TypeScript definitions

### TypeScript Source
- `src/partition.ts` - ESP32 partition table parser

### Documentation
- `LITTLEFS_FEATURE.md` - Complete feature documentation
- `FS_DETECTION.md` - Filesystem detection algorithm
- `LITTLEFS_INTEGRATION.md` - This file

## Implementation Notes

### Architecture Differences

ESP Web Tools uses a different architecture than WebSerial_ESPTool:

**WebSerial_ESPTool:**
- Standalone web application
- Direct DOM access
- Global variables for state management
- Vanilla JavaScript

**ESP Web Tools:**
- Web Components Library (Lit)
- Encapsulated components
- State management in components
- TypeScript

### Required Adjustments

To integrate LittleFS functionality into ESP Web Tools, the following steps must be performed:

1. **Create New Web Component:**
   - `src/components/ewt-littlefs-manager.ts` - LittleFS Manager Component
   - Uses Lit for rendering
   - Encapsulated state management

2. **Extend Install Dialog:**
   - Adapt `src/install-dialog.ts`
   - Add partition table reading
   - LittleFS Manager integration

3. **Add Styles:**
   - Add LittleFS-specific styles to `src/styles.ts`
   - Or create separate style file

4. **Build Configuration:**
   - Adapt `rollup.config.mjs` to copy WASM files
   - Ensure WASM files end up in dist folder

## Next Steps

### 1. Create LittleFS Manager Component

```typescript
// src/components/ewt-littlefs-manager.ts
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createLittleFSFromImage } from '../wasm/littlefs/index.js';

@customElement('ewt-littlefs-manager')
export class EwtLittleFSManager extends LitElement {
  @property() partition: any;
  @property() espStub: any;
  
  @state() private currentPath = '/';
  @state() private files: any[] = [];
  @state() private fs: any = null;
  
  // Implementation...
}
```

### 2. Add Partition Table Support

```typescript
// In install-dialog.ts
import { parsePartitionTable } from './partition.js';

async readPartitionTable() {
  const PARTITION_TABLE_OFFSET = 0x8000;
  const PARTITION_TABLE_SIZE = 0x1000;
  
  const data = await this.espStub.readFlash(
    PARTITION_TABLE_OFFSET, 
    PARTITION_TABLE_SIZE
  );
  
  const partitions = parsePartitionTable(data);
  // Display partitions...
}
```

### 3. Integrate Filesystem Detection

```typescript
async detectFilesystemType(offset: number, size: number): Promise<string> {
  const readSize = Math.min(8192, size);
  const data = await this.espStub.readFlash(offset, readSize);
  
  // Method 1: String signature
  const decoder = new TextDecoder('ascii', { fatal: false });
  const dataStr = decoder.decode(data);
  
  if (dataStr.includes('littlefs')) {
    return 'littlefs';
  }
  
  // Method 2 & 3: Structure analysis and SPIFFS magic
  // ... (see FS_DETECTION.md)
  
  return 'spiffs'; // Fallback
}
```

### 4. Adjust Build Configuration

```javascript
// rollup.config.mjs
export default {
  // ...
  plugins: [
    // ...
    copy({
      targets: [
        { 
          src: 'src/wasm/littlefs/*.wasm', 
          dest: 'dist/web/wasm/littlefs' 
        }
      ]
    })
  ]
}
```

## Usage Example

After integration, the LittleFS functionality can be used as follows:

```html
<esp-web-install-button
  manifest="https://example.com/manifest.json"
  show-log
>
  <button slot="activate">Install & Manage Filesystem</button>
</esp-web-install-button>
```

## Testing

### Manual Tests
1. Connect device
2. Read partition table
3. Open LittleFS partition
4. Upload/download files
5. Create backup
6. Write to flash

### Automated Tests
- Unit tests for partition parser
- Unit tests for filesystem detection
- Integration tests for LittleFS operations

## Known Limitations

1. **SPIFFS Support:** Not yet implemented
2. **Large Partitions:** Can require significant browser RAM
3. **Write Operations:** Require complete re-flash of partition
4. **Browser Compatibility:** Requires Web Serial API (Chrome/Edge)

## References

- [WebSerial_ESPTool](https://github.com/Jason2866/WebSerial_ESPTool)
- [LittleFS](https://github.com/littlefs-project/littlefs)
- [littlefs-wasm](https://github.com/littlefs-project/littlefs)
- [ESP-IDF Partition Tables](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/partition-tables.html)

## License

The LittleFS integration retains the MIT license from WebSerial_ESPTool.
