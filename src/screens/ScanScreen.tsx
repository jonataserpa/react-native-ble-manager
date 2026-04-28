import React, {useEffect} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {DeviceCard} from '../components/DeviceCard';
import {ScanButton} from '../components/ScanButton';
import {bluetoothService} from '../modules/bluetooth/bluetooth.service';
import {onDiscoverPeripheral, onStopScan} from '../modules/bluetooth/bluetooth.events';
import {useBluetoothStore} from '../store/bluetooth.store';
import type {RootStackParamList} from '../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Scan'>;

export function ScanScreen({navigation}: Props) {
  const devices = useBluetoothStore(state => state.devices);
  const isScanning = useBluetoothStore(state => state.isScanning);
  const addDevice = useBluetoothStore(state => state.addDevice);
  const clearDevices = useBluetoothStore(state => state.clearDevices);
  const setIsScanning = useBluetoothStore(state => state.setIsScanning);
  const addLog = useBluetoothStore(state => state.addLog);

  useEffect(() => {
    const discoverSubscription = onDiscoverPeripheral(device => {
      addDevice({
        id: device.id,
        name: device.name || 'Dispositivo sem nome',
        rssi: device.rssi,
        advertising: device.advertising,
        isConnectable: device.isConnectable,
      });
      addLog('info', `Dispositivo encontrado: ${device.name || device.id}`);
    });

    const stopScanSubscription = onStopScan(() => {
      setIsScanning(false);
      addLog('info', 'Scan BLE finalizado.');
    });

    return () => {
      discoverSubscription.remove();
      stopScanSubscription.remove();
    };
  }, [addDevice, addLog, setIsScanning]);

  async function handleScan() {
    try {
      clearDevices();
      setIsScanning(true);
      addLog('info', 'Iniciando scan BLE por 5 segundos.');
      await bluetoothService.scan(5);
    } catch (error) {
      setIsScanning(false);
      addLog('error', 'Erro ao iniciar scan BLE.');
    }
  }

  return (
    <View style={styles.container}>
      <ScanButton isScanning={isScanning} onPress={handleScan} />
      <Text style={styles.counter}>{devices.length} dispositivo(s) encontrado(s)</Text>

      <FlatList
        data={devices}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <DeviceCard
            device={item}
            onPress={device => navigation.navigate('DeviceDetails', {device})}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum dispositivo encontrado ainda.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  counter: {
    color: '#374151',
    fontWeight: '600',
    marginBottom: 12,
  },
  empty: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 48,
  },
});
