import {bytesToHex, bytesToPrintableString} from '../formatBytes';

describe('bytesToHex', () => {
  it('formata bytes em hex maiusculo separados por espaco', () => {
    expect(bytesToHex([0, 1, 255])).toBe('00 01 FF');
  });

  it('clampa valores fora do range 0-255', () => {
    expect(bytesToHex([-5, 300])).toBe('00 FF');
  });

  it('aceita array vazio', () => {
    expect(bytesToHex([])).toBe('');
  });
});

describe('bytesToPrintableString', () => {
  it('decodifica ASCII imprimivel', () => {
    expect(bytesToPrintableString([72, 105])).toBe('Hi');
  });

  it('retorna null se houver byte nao imprimivel', () => {
    expect(bytesToPrintableString([72, 0, 105])).toBeNull();
  });

  it('retorna string vazia para input vazio', () => {
    expect(bytesToPrintableString([])).toBe('');
  });
});
