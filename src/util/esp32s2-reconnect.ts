/**
 * ESP32-S2 Native USB Reconnect Utilities
 * 
 * The ESP32-S2 can switch between ROM bootloader mode and USB CDC mode,
 * causing the serial port to change. These utilities help detect and handle
 * this scenario consistently across the application.
 */

/**
 * Check if a serial port is an ESP32-S2 Native USB device
 * VID 0x303a = Espressif
 * PID 0x0002 = ESP32-S2 Native USB (ROM bootloader)
 */
export const isESP32S2NativeUSB = (port: SerialPort): boolean => {
  const info = port.getInfo();
  return info.usbVendorId === 0x303a && info.usbProductId === 0x0002;
};

/**
 * Check if an error is likely caused by ESP32-S2 port switching
 */
export const isESP32S2ReconnectError = (error: any): boolean => {
  const errorMsg = error.message || String(error);
  return (
    errorMsg.includes("sync") ||
    errorMsg.includes("disconnect") ||
    errorMsg.includes("reconnect required")
  );
};

/**
 * Close and forget a serial port
 * This releases the port so a new one can be selected
 */
export const closeAndForgetPort = async (port: SerialPort): Promise<void> => {
  // Close the port
  try {
    await port.close();
  } catch (e) {
    // Port may already be closed
  }

  // Forget the port to release it from browser permissions
  try {
    await port.forget();
  } catch (e) {
    // Forget may not be supported in all browsers
  }
};
