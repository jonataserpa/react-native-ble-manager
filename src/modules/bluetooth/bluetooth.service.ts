import BleManager from 'react-native-ble-manager';

export class BluetoothService {
  async start(): Promise<void> {
    await BleManager.start({showAlert: false});
  }

  async scan(seconds = 5): Promise<void> {
    await BleManager.scan([], seconds, true);
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

export const bluetoothService = new BluetoothService();
