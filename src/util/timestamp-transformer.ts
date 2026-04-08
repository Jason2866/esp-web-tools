// Matches lines that already carry a wall-clock or tick timestamp so we don't
// add a redundant one. Does NOT match bare log-level prefixes like ESPHome's
// [I][tag:line]: — those have no time information.
//
// Covered formats:
//   (123456)          FreeRTOS ms-tick  e.g. "(12345) "
//   [HH:MM:SS]        wall-clock bracket
//   [HH:MM:SS.mmm]    wall-clock bracket with millis
//   I (1234) tag:     ESP-IDF log level + tick  e.g. "I (1234) wifi: ..."
//   HH:MM:SS.mmm      plain wall-clock
const DEVICE_TIMESTAMP_RE =
  /^\s*(?:\(\d+\)\s|\[\d{2}:\d{2}:\d{2}(?:\.\d+)?\]|[DIWEACV] \(\d+\) \w|(?:\d{2}:){2}\d{2}\.\d)/;

export class TimestampTransformer implements Transformer<string, string> {
  transform(
    chunk: string,
    controller: TransformStreamDefaultController<string>,
  ) {
    // Pass through pure newline (blank-line sentinel) and empty chunks unchanged
    // so that carriage-return overwrite logic in console-color.ts can still
    // detect them via line !== "\n".
    if (chunk === "" || chunk === "\n") {
      controller.enqueue(chunk);
      return;
    }
    // Skip prefixing if the line already starts with a timestamp
    if (DEVICE_TIMESTAMP_RE.test(chunk)) {
      controller.enqueue(chunk);
      return;
    }
    const date = new Date();
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    const s = date.getSeconds().toString().padStart(2, "0");
    controller.enqueue(`[${h}:${m}:${s}]${chunk}`);
  }
}
