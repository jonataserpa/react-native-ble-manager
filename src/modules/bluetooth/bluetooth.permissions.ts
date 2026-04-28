import {PermissionsAndroid, Platform} from 'react-native';

export async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const apiLevel = Number(Platform.Version);

  if (apiLevel >= 31) {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);

    return Object.values(result).every(
      permission => permission === PermissionsAndroid.RESULTS.GRANTED,
    );
  }

  if (apiLevel >= 23) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  return true;
}
