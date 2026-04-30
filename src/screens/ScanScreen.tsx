import React, {useEffect, useRef} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {DeviceCard} from '../components/DeviceCard';
import {ScanButton} from '../components/ScanButton';
import {bluetoothService} from '../modules/bluetooth/bluetooth.service';
import {onDiscoverPeripheral, onStopScan} from '../modules/bluetooth/bluetooth.events';
import {useBluetoothStore} from '../store/bluetooth.store';
import type {RootStackParamList} from '../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Scan'>;

const SCAN_DURATION_SECONDS = 8;
/** Buffer extra acima de SCAN_DURATION para destravar a UI caso o evento nativo
 *  `BleManagerStopScan` nao chegue (Xiaomi/HyperOS as vezes engole). */
const SCAN_SAFETY_TIMEOUT_MS = (SCAN_DURATION_SECONDS + 3) * 1000;

export function ScanScreen({navigation}: Props) {
  const devices = useBluetoothStore(state => state.devices);
  const isScanning = useBluetoothStore(state => state.isScanning);
  const addDevice = useBluetoothStore(state => state.addDevice);
  const clearDevices = useBluetoothStore(state => state.clearDevices);
  const setIsScanning = useBluetoothStore(state => state.setIsScanning);
  const addLog = useBluetoothStore(state => state.addLog);

  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearSafetyTimeout() {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  }

  useEffect(() => {
    const discoverSubscription = onDiscoverPeripheral(device => {
      addDevice({
        id: device.id,
        name: device.name || 'Dispositivo sem nome',
        rssi: device.rssi,
        advertising: device.advertising,
        isConnectable: device.isConnectable,
      });
      addLog('info', `Encontrado: ${device.name || device.id} (rssi=${device.rssi})`);
    });

    const stopScanSubscription = onStopScan(() => {
      clearSafetyTimeout();
      setIsScanning(false);
      addLog('info', 'Scan BLE finalizado.');
    });

    return () => {
      discoverSubscription.remove();
      stopScanSubscription.remove();
      clearSafetyTimeout();
    };
  }, [addDevice, addLog, setIsScanning]);

  async function handleScan() {
    try {
      const adapter = await bluetoothService.getAdapterState();
      if (adapter !== 'on') {
        addLog(
          'warning',
          `Bluetooth ${adapter}. Ative o Bluetooth nas configuracoes do sistema e tente novamente.`,
        );
        return;
      }

      clearDevices();
      setIsScanning(true);
      addLog('info', `Iniciando scan BLE por ${SCAN_DURATION_SECONDS}s.`);
      await bluetoothService.scan(SCAN_DURATION_SECONDS);

      clearSafetyTimeout();
      safetyTimeoutRef.current = setTimeout(() => {
        if (useBluetoothStore.getState().isScanning) {
          addLog('warning', 'Scan nao emitiu StopScan; resetando UI por seguranca.');
          setIsScanning(false);
        }
      }, SCAN_SAFETY_TIMEOUT_MS);
    } catch (error) {
      clearSafetyTimeout();
      setIsScanning(false);
      const message = error instanceof Error ? error.message : String(error);
      addLog('error', `Erro ao iniciar scan BLE: ${message}`);
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
