import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {BluetoothDevice} from '../modules/bluetooth/bluetooth.types';
import {FavoriteToggle} from './FavoriteToggle';
import {useFavoritesStore} from '../store/favorites.store';

type DeviceCardProps = {
  device: BluetoothDevice;
  onPress?: (device: BluetoothDevice) => void;
};

export function DeviceCard({device, onPress}: DeviceCardProps) {
  const isFavorite = useFavoritesStore(state => state.isFavorite(device.id));
  const toggle = useFavoritesStore(state => state.toggle);

  return (
    <Pressable style={styles.card} onPress={() => onPress?.(device)}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {device.name || 'Dispositivo sem nome'}
        </Text>
        <View style={styles.headerRight}>
          {typeof device.rssi === 'number' ? (
            <Text style={styles.rssi}>{device.rssi} dBm</Text>
          ) : null}
          <FavoriteToggle
            isFavorite={isFavorite}
            onToggle={() => toggle(device)}
            size="sm"
          />
        </View>
      </View>
      <Text style={styles.id}>{device.id}</Text>
      <Text style={styles.status}>
        {device.isConnectable === false ? 'Nao conectavel' : 'Conectavel'}
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
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
