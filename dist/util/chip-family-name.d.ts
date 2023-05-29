import { ESPLoader } from "tasmota-webserial-esptool";
import type { BaseFlashState } from "../const";
export declare const getChipFamilyName: (esploader: ESPLoader) => NonNullable<BaseFlashState["chipFamily"]>;
