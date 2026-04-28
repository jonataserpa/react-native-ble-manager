import {NativeEventEmitter, NativeModules} from 'react-native';
import type {BluetoothDevice} from './bluetooth.types';

const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);

type Subscription = {
  remove: () => void;
};

export function onDiscoverPeripheral(
  callback: (device: BluetoothDevice) => void,
): Subscription {
  return bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', callback);
}

export function onStopScan(callback: () => void): Subscription {
  return bleManagerEmitter.addListener('BleManagerStopScan', callback);
}

export function onDisconnectPeripheral(
  callback: (event: {peripheral: string}) => void,
): Subscription {
  return bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', callback);
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
