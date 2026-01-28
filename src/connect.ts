import type { InstallButton } from "./install-button.js";
import { connect as esptoolConnect } from "tasmota-webserial-esptool";

/**
 * Detect if running on Android
 */
const isAndroid = (): boolean => {
  const userAgent = navigator.userAgent || "";
  return /Android/i.test(userAgent);
};

/**
 * Load WebUSB serial wrapper for Android
 */
const loadWebUSBSerial = async (): Promise<void> => {
  // Check if already loaded
  if ((globalThis as any).requestSerialPort) {
    return;
  }

  // Dynamically load the WebUSB serial script from the npm package
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/tasmota-webserial-esptool/js/webusb-serial.js";
    script.onload = () => {
      if ((globalThis as any).requestSerialPort) {
        resolve();
      } else {
        reject(
          new Error(
            "WebUSB serial script loaded but requestSerialPort not found",
          ),
        );
      }
    };
    script.onerror = () =>
      reject(new Error("Failed to load WebUSB serial script"));
    document.head.appendChild(script);
  });
};

export const connect = async (button: InstallButton) => {
  import("./install-dialog.js");
  // Android: Load WebUSB support first
  if (isAndroid() && "usb" in navigator) {
    try {
      await loadWebUSBSerial();
    } catch (err: any) {
      alert(`Failed to load WebUSB support: ${err.message}`);
      return;
    }
  }

  // Use tasmota-webserial-esptool's connect() - handles ALL port logic
  let esploader;
  try {
    esploader = await esptoolConnect({
      log: () => {}, // Silent logger for connection
      debug: () => {},
      error: (msg: string) => console.error(msg),
    });
  } catch (err: any) {
    if ((err as DOMException).name === "NotFoundError") {
      import("./no-port-picked/index").then((mod) =>
        mod.openNoPortPickedDialog(() => connect(button)),
      );
      return;
    }
    alert(`Connection failed: ${err.message}`);
    return;
  }

  if (!esploader) {
    alert("Failed to connect to device");
    return;
  }

  const el = document.createElement("ewt-install-dialog");
  el.esploader = esploader; // Pass ESPLoader instead of port
  el.manifestPath = button.manifest || button.getAttribute("manifest")!;
  el.overrides = button.overrides;
  el.firmwareFile = button.firmwareFile;

  // Get baud rate from attribute or use default
  const baudRateAttr = button.getAttribute("baud-rate");
  if (baudRateAttr) {
    const baudRate = parseInt(baudRateAttr, 10);
    if (!isNaN(baudRate)) {
      el.baudRate = baudRate;
    }
  } else if (button.baudRate !== undefined) {
    el.baudRate = button.baudRate;
  }

  el.addEventListener(
    "closed",
    async () => {
      try {
        await esploader.disconnect();
      } catch (err) {
        // Ignore disconnect errors
      }
    },
    { once: true },
  );
  document.body.appendChild(el);
};
