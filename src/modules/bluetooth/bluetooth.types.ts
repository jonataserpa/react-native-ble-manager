export type BluetoothDevice = {
  id: string;
  name: string;
  rssi?: number;
  advertising?: unknown;
  isConnectable?: boolean;
};

export type BluetoothLogLevel = 'info' | 'warning' | 'error' | 'success';

export type BluetoothLog = {
  id: string;
  level: BluetoothLogLevel;
  message: string;
  createdAt: string;
};

export type BluetoothCharacteristicValue = number[];

export type BluetoothServiceInfo = {
  peripheralId: string;
  services?: unknown[];
  characteristics?: unknown[];
};
