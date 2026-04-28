import {create} from 'zustand';
import type {BluetoothDevice, BluetoothLog, BluetoothLogLevel} from '../modules/bluetooth/bluetooth.types';

type BluetoothStore = {
  devices: BluetoothDevice[];
  connectedDevice: BluetoothDevice | null;
  isScanning: boolean;
  logs: BluetoothLog[];
  permissionsGranted: boolean;
  setPermissionsGranted: (value: boolean) => void;
  setIsScanning: (value: boolean) => void;
  addDevice: (device: BluetoothDevice) => void;
  clearDevices: () => void;
  setConnectedDevice: (device: BluetoothDevice | null) => void;
  addLog: (level: BluetoothLogLevel, message: string) => void;
  clearLogs: () => void;
};

export const useBluetoothStore = create<BluetoothStore>(set => ({
  devices: [],
  connectedDevice: null,
  isScanning: false,
  logs: [],
  permissionsGranted: false,

  setPermissionsGranted: value => set({permissionsGranted: value}),

  setIsScanning: value => set({isScanning: value}),

  addDevice: device =>
    set(state => {
      const alreadyExists = state.devices.some(item => item.id === device.id);

      if (alreadyExists) {
        return {
          devices: state.devices.map(item =>
            item.id === device.id ? {...item, ...device} : item,
          ),
        };
      }

      return {devices: [...state.devices, device]};
    }),

  clearDevices: () => set({devices: []}),

  setConnectedDevice: device => set({connectedDevice: device}),

  addLog: (level, message) =>
    set(state => ({
      logs: [
        {
          id: `${Date.now()}-${Math.random()}`,
          level,
          message,
          createdAt: new Date().toISOString(),
        },
        ...state.logs,
      ],
    })),

  clearLogs: () => set({logs: []}),
}));
