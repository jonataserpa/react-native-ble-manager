import React, {useEffect} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {bluetoothService} from '../modules/bluetooth/bluetooth.service';
import {requestBluetoothPermissions} from '../modules/bluetooth/bluetooth.permissions';
import {onAdapterStateChange} from '../modules/bluetooth/bluetooth.boot';
import {PermissionStatus} from '../components/PermissionStatus';
import {useBluetoothStore} from '../store/bluetooth.store';
import type {RootStackParamList} from '../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({navigation}: Props) {
  const permissionsGranted = useBluetoothStore(state => state.permissionsGranted);
  const setPermissionsGranted = useBluetoothStore(state => state.setPermissionsGranted);
  const addLog = useBluetoothStore(state => state.addLog);

  useEffect(() => {
    const unsubscribe = onAdapterStateChange(state => {
      addLog('info', `Adapter Bluetooth mudou para "${state}".`);
    });

    async function bootstrap() {
      try {
        const {granted, denied} = await requestBluetoothPermissions();
        setPermissionsGranted(granted);

        if (!granted) {
          addLog(
            'warning',
            `Permissões Bluetooth negadas: ${denied.join(', ') || 'desconhecidas'}.`,
          );
          return;
        }

        await bluetoothService.start();
        addLog('success', 'Módulo BLE inicializado.');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        addLog('error', `Falha ao inicializar BLE: ${message}`);
      }
    }

    bootstrap();

    return () => {
      unsubscribe();
    };
  }, [addLog, setPermissionsGranted]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BLE Device Monitor</Text>
      <Text style={styles.description}>
        Escaneie, conecte e monitore dispositivos Bluetooth Low Energy próximos.
      </Text>

      <PermissionStatus granted={permissionsGranted} />

      <Pressable style={styles.button} onPress={() => navigation.navigate('Scan')}>
        <Text style={styles.buttonText}>Buscar dispositivos</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Logs')}>
        <Text style={styles.secondaryButtonText}>Ver logs</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    color: '#4b5563',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontWeight: '700',
  },
});
