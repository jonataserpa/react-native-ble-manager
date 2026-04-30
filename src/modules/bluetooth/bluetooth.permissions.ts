import {PermissionsAndroid, Platform} from 'react-native';

export type PermissionResult = {
  granted: boolean;
  /** Lista das permissoes negadas, util para a UI mostrar mensagem especifica. */
  denied: string[];
};

/**
 * Pede as permissoes BLE corretas para a versao do Android.
 *
 * Android 12+ (API 31+): BLUETOOTH_SCAN + BLUETOOTH_CONNECT.
 *   Como o manifest declara `neverForLocation`, nao precisa pedir LOCATION aqui.
 *
 * Android 6 a 11 (API 23-30): ACCESS_FINE_LOCATION (sem ela o scan retorna 0
 *   resultados, mesmo com `BLUETOOTH` legacy garantido pelo manifest).
 */
export async function requestBluetoothPermissions(): Promise<PermissionResult> {
  if (Platform.OS !== 'android') {
    return {granted: true, denied: []};
  }

  const apiLevel = Number(Platform.Version);

  if (apiLevel >= 31) {
    return requestPermissionGroup([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
  }

  if (apiLevel >= 23) {
    return requestPermissionGroup([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
  }

  return {granted: true, denied: []};
}

async function requestPermissionGroup(
  permissions: Array<keyof typeof PermissionsAndroid.PERMISSIONS | string>,
): Promise<PermissionResult> {
  const result = await PermissionsAndroid.requestMultiple(
    permissions as Parameters<typeof PermissionsAndroid.requestMultiple>[0],
  );

  const denied = Object.entries(result)
    .filter(([, status]) => status !== PermissionsAndroid.RESULTS.GRANTED)
    .map(([permission]) => permission);

  return {granted: denied.length === 0, denied};
}
