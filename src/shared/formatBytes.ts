/** Converte um array de bytes (0-255) em string hex com espacos. Ex: [1, 255] -> "01 FF". */
export function bytesToHex(bytes: readonly number[]): string {
  return bytes
    .map(byte => Math.max(0, Math.min(255, byte)).toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

/**
 * Tenta interpretar bytes como UTF-8 imprimivel; se vier algo nao-imprimivel
 * (controles, etc.), retorna `null` para a UI exibir apenas o hex.
 */
export function bytesToPrintableString(bytes: readonly number[]): string | null {
  if (bytes.length === 0) {
    return '';
  }
  let result = '';
  for (const byte of bytes) {
    if (byte < 0x20 || byte > 0x7e) {
      return null;
    }
    result += String.fromCharCode(byte);
  }
  return result;
}
