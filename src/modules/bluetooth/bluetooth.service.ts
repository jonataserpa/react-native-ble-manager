import BleManager from 'react-native-ble-manager';

export type AdapterState = 'on' | 'off' | 'unknown' | 'unsupported';

export class BluetoothService {
  async start(): Promise<void> {
    await BleManager.start({showAlert: false});
  }

  /** Disparado pelo modulo nativo: garante que o usuario ative o Bluetooth. */
  async enableBluetooth(): Promise<void> {
    if (typeof BleManager.enableBluetooth === 'function') {
      await BleManager.enableBluetooth();
    }
  }

  /** Le o estado atual do adapter Bluetooth. */
  async getAdapterState(): Promise<AdapterState> {
    if (typeof BleManager.checkState !== 'function') {
      return 'unknown';
    }

    const raw = await BleManager.checkState();
    return normalizeAdapterState(raw);
  }

  /**
   * react-native-ble-manager 11.x usa argumentos posicionais:
   * `scan(serviceUUIDs: string[], seconds: number, allowDuplicates?: boolean)`.
   */
  async scan(seconds = 5): Promise<void> {
    await BleManager.scan([], seconds, false);
  }

  async stopScan(): Promise<void> {
    await BleManager.stopScan();
  }

  async connect(peripheralId: string): Promise<void> {
    await BleManager.connect(peripheralId);
  }

  async disconnect(peripheralId: string): Promise<void> {
    await BleManager.disconnect(peripheralId);
  }

  async retrieveServices(peripheralId: string) {
    return BleManager.retrieveServices(peripheralId);
  }

  async read(
    peripheralId: string,
    serviceUUID: string,
    characteristicUUID: string,
  ): Promise<number[]> {
    return BleManager.read(peripheralId, serviceUUID, characteristicUUID);
  }

  async startNotification(
    peripheralId: string,
    serviceUUID: string,
    characteristicUUID: string,
  ): Promise<void> {
    await BleManager.startNotification(
      peripheralId,
      serviceUUID,
      characteristicUUID,
    );
  }
}

function normalizeAdapterState(raw: unknown): AdapterState {
  if (typeof raw !== 'string') {
    return 'unknown';
  }
  const value = raw.toLowerCase();
  if (value.includes('on')) {
    return 'on';
  }
  if (value.includes('off')) {
    return 'off';
  }
  if (value.includes('unsupported')) {
    return 'unsupported';
  }
  return 'unknown';
}

export const bluetoothService = new BluetoothService();
