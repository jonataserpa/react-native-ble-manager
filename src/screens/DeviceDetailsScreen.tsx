import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {bluetoothService} from '../modules/bluetooth/bluetooth.service';
import {useBluetoothStore} from '../store/bluetooth.store';
import type {RootStackParamList} from '../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'DeviceDetails'>;

export function DeviceDetailsScreen({route}: Props) {
  const {device} = route.params;
  const connectedDevice = useBluetoothStore(state => state.connectedDevice);
  const setConnectedDevice = useBluetoothStore(state => state.setConnectedDevice);
  const addLog = useBluetoothStore(state => state.addLog);
  const [servicesJson, setServicesJson] = useState<string>('');
  const isConnected = connectedDevice?.id === device.id;

  async function handleConnect() {
    try {
      await bluetoothService.stopScan().catch(() => undefined);
      await bluetoothService.connect(device.id);
      setConnectedDevice(device);
      addLog('success', `Conectado ao dispositivo ${device.name || device.id}.`);

      const services = await bluetoothService.retrieveServices(device.id);
      setServicesJson(JSON.stringify(services, null, 2));
      addLog('info', `Serviços recuperados para ${device.name || device.id}.`);
    } catch (error) {
      addLog('error', `Erro ao conectar ao dispositivo ${device.name || device.id}.`);
    }
  }

  async function handleDisconnect() {
    try {
      await bluetoothService.disconnect(device.id);
      setConnectedDevice(null);
      addLog('info', `Desconectado do dispositivo ${device.name || device.id}.`);
    } catch (error) {
      addLog('error', `Erro ao desconectar do dispositivo ${device.name || device.id}.`);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{device.name || 'Dispositivo sem nome'}</Text>
      <Text style={styles.label}>ID</Text>
      <Text style={styles.value}>{device.id}</Text>

      <Text style={styles.label}>RSSI</Text>
      <Text style={styles.value}>{device.rssi ?? 'Não informado'}</Text>

      <Pressable
        style={[styles.button, isConnected && styles.disconnectButton]}
        onPress={isConnected ? handleDisconnect : handleConnect}>
        <Text style={styles.buttonText}>{isConnected ? 'Desconectar' : 'Conectar'}</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Serviços e características</Text>
      <View style={styles.codeBox}>
        <Text style={styles.codeText}>
          {servicesJson || 'Conecte ao dispositivo para recuperar serviços.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  label: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
    textTransform: 'uppercase',
  },
  value: {
    color: '#111827',
    fontSize: 15,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  disconnectButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 8,
  },
  codeBox: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
  },
  codeText: {
    color: '#f9fafb',
    fontFamily: 'Courier',
    fontSize: 12,
  },
});
