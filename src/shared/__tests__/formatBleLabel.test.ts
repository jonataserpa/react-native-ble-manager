import {formatBleDeviceLabel} from '../formatBleLabel';

describe('formatBleDeviceLabel', () => {
  it('usa o nome quando existir', () => {
    expect(formatBleDeviceLabel('  Sensor A  ', 'AA:BB')).toBe('Sensor A');
  });

  it('cai para o id quando o nome for vazio', () => {
    expect(formatBleDeviceLabel('', 'CC:DD')).toBe('CC:DD');
    expect(formatBleDeviceLabel(undefined, 'EE:FF')).toBe('EE:FF');
    expect(formatBleDeviceLabel('   ', '11:22')).toBe('11:22');
  });
});
