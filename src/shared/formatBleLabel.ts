/**
 * Rótulo estável para listas BLE quando o nome vem vazio do scan.
 */
export function formatBleDeviceLabel(
  name: string | null | undefined,
  deviceId: string,
): string {
  const trimmed = name?.trim();
  if (trimmed) {
    return trimmed;
  }
  return deviceId;
}
