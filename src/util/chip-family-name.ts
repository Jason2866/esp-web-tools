import {
  CHIP_FAMILY_ESP32,
  CHIP_FAMILY_ESP32S2,
  CHIP_FAMILY_ESP32S3,
  CHIP_FAMILY_ESP32C2,
  CHIP_FAMILY_ESP32C3,
  CHIP_FAMILY_ESP32C5,
  CHIP_FAMILY_ESP32C6,
  CHIP_FAMILY_ESP32C61,
  CHIP_FAMILY_ESP32H2,
  CHIP_FAMILY_ESP32P4,
  CHIP_FAMILY_ESP8266,
  ESPLoader,
} from "tasmota-webserial-esptool";
import type { BaseFlashState } from "../const";

export const getChipFamilyName = (
  esploader: ESPLoader,
): NonNullable<BaseFlashState["chipFamily"]> => {
  switch (esploader.chipFamily) {
    case CHIP_FAMILY_ESP32:
      return "ESP32";
    case CHIP_FAMILY_ESP32S2:
      return "ESP32-S2";
    case CHIP_FAMILY_ESP32S3:
      return "ESP32-S3";
    case CHIP_FAMILY_ESP32C2:
      return "ESP32-C2";
    case CHIP_FAMILY_ESP32C3:
      return "ESP32-C3";
    case CHIP_FAMILY_ESP32C5:
      return "ESP32-C5";
    case CHIP_FAMILY_ESP32C6:
      return "ESP32-C6";
    case CHIP_FAMILY_ESP32C61:
      return "ESP32-C61";
    case CHIP_FAMILY_ESP32H2:
      return "ESP32-H2";
    case CHIP_FAMILY_ESP32P4:
      return "ESP32-P4";
    case CHIP_FAMILY_ESP8266:
      return "ESP8266";
    default:
      return "Unknown Chip";
  }
};
