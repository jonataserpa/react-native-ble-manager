import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {BluetoothDevice} from '../modules/bluetooth/bluetooth.types';

type DeviceCardProps = {
  device: BluetoothDevice;
  onPress?: (device: BluetoothDevice) => void;
};

export function DeviceCard({device, onPress}: DeviceCardProps) {
  return (
    <Pressable style={styles.card} onPress={() => onPress?.(device)}>
      <View style={styles.header}>
        <Text style={styles.name}>{device.name || 'Dispositivo sem nome'}</Text>
        {typeof device.rssi === 'number' ? (
          <Text style={styles.rssi}>{device.rssi} dBm</Text>
        ) : null}
      </View>
      <Text style={styles.id}>{device.id}</Text>
      <Text style={styles.status}>
        {device.isConnectable === false ? 'Não conectável' : 'Conectável'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  rssi: {
    color: '#4b5563',
    fontSize: 12,
  },
  id: {
    color: '#6b7280',
    marginTop: 6,
    fontSize: 12,
  },
  status: {
    color: '#2563eb',
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
});
