import AsyncStorage from '@react-native-async-storage/async-storage';
import type {BluetoothDevice} from '../modules/bluetooth/bluetooth.types';

const FAVORITES_KEY = '@ble-device-monitor:favorites';

export async function getFavoriteDevices(): Promise<BluetoothDevice[]> {
  const value = await AsyncStorage.getItem(FAVORITES_KEY);
  return value ? JSON.parse(value) : [];
}

export async function saveFavoriteDevice(device: BluetoothDevice): Promise<void> {
  const favorites = await getFavoriteDevices();
  const alreadyExists = favorites.some(item => item.id === device.id);

  if (alreadyExists) {
    return;
  }

  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites, device]));
}

export async function removeFavoriteDevice(deviceId: string): Promise<void> {
  const favorites = await getFavoriteDevices();
  await AsyncStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(favorites.filter(device => device.id !== deviceId)),
  );
}
