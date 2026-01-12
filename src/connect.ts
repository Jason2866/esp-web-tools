import type { InstallButton } from "./install-button.js";

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
    script.type = "module"; // CRITICAL: Load as ES6 module to support export statements
    // Load from the installed npm package (tasmota-webserial-esptool)
    script.src =
      "https://unpkg.com/tasmota-webserial-esptool/js/webusb-serial.js";
    script.onload = () => {
      // Verify it loaded correctly
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

/**
 * Request a serial port with automatic platform detection
 */
const requestPort = async (): Promise<SerialPort> => {
  // Android: Use WebUSB
  if (isAndroid() && "usb" in navigator) {
    // Load WebUSB serial wrapper if needed
    await loadWebUSBSerial();

    const customRequestPort = (globalThis as any).requestSerialPort;
    if (typeof customRequestPort === "function") {
      return await customRequestPort();
    }
    throw new Error("WebUSB support could not be loaded");
  }

  // Desktop: Use Web Serial API
  if (!navigator.serial) {
    throw new Error("Web Serial API not supported");
  }
  return await navigator.serial.requestPort();
};

export const connect = async (button: InstallButton) => {
  import("./install-dialog.js");
  let port: SerialPort | undefined;
  try {
    port = await requestPort();
  } catch (err: any) {
    if ((err as DOMException).name === "NotFoundError") {
      import("./no-port-picked/index").then((mod) =>
        mod.openNoPortPickedDialog(() => connect(button)),
      );
      return;
    }
    alert(`Error: ${err.message}`);
    return;
  }

  if (!port) {
    return;
  }

  try {
    // Only open if not already open (WebUSB may return an opened port)
    if (!port.readable || !port.writable) {
      await port.open({ baudRate: 115200 });
    }
  } catch (err: any) {
    alert(err.message);
    return;
  }

  const el = document.createElement("ewt-install-dialog");
  el.port = port;
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
    () => {
      port!.close();
    },
    { once: true },
  );
  document.body.appendChild(el);
};
