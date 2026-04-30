import {NativeEventEmitter, NativeModules} from 'react-native';
import type {BluetoothDevice} from './bluetooth.types';

/**
 * Em Old Arch (newArchEnabled=false), os eventos do react-native-ble-manager
 * sao consumidos via `NativeEventEmitter(NativeModules.BleManager)` com os
 * nomes de eventos legados (`BleManagerXXX`).
 */
const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);

type Subscription = {
  remove: () => void;
};

export function onDiscoverPeripheral(
  callback: (device: BluetoothDevice) => void,
): Subscription {
  return bleManagerEmitter.addListener(
    'BleManagerDiscoverPeripheral',
    (peripheral: {
      id: string;
      name?: string;
      rssi?: number;
      advertising?: unknown;
      isConnectable?: boolean;
    }) => {
      callback({
        id: peripheral.id,
        name: peripheral.name ?? '',
        rssi: peripheral.rssi,
        advertising: peripheral.advertising,
        isConnectable: peripheral.isConnectable,
      });
    },
  );
}

export function onStopScan(callback: () => void): Subscription {
  return bleManagerEmitter.addListener('BleManagerStopScan', callback);
}

export function onDisconnectPeripheral(
  callback: (event: {peripheral: string}) => void,
): Subscription {
  return bleManagerEmitter.addListener(
    'BleManagerDisconnectPeripheral',
    callback,
  );
}

export function onUpdateValueForCharacteristic(
  callback: (event: {
    peripheral: string;
    characteristic: string;
    service: string;
    value: number[];
  }) => void,
): Subscription {
  return bleManagerEmitter.addListener(
    'BleManagerDidUpdateValueForCharacteristic',
    callback,
  );
}
