import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {PeripheralInfo} from 'react-native-ble-manager';
import {bluetoothService} from '../modules/bluetooth/bluetooth.service';
import {useCharacteristicValues} from '../modules/bluetooth/useCharacteristicValues';
import {useBluetoothStore} from '../store/bluetooth.store';
import {useFavoritesStore} from '../store/favorites.store';
import {ServicesList} from '../components/ServicesList';
import {FavoriteToggle} from '../components/FavoriteToggle';
import type {RootStackParamList} from '../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'DeviceDetails'>;

type ConnectionState = 'idle' | 'connecting' | 'disconnecting';

export function DeviceDetailsScreen({route}: Props) {
  const {device} = route.params;
  const connectedDevice = useBluetoothStore(state => state.connectedDevice);
  const setConnectedDevice = useBluetoothStore(state => state.setConnectedDevice);
  const addLog = useBluetoothStore(state => state.addLog);

  const isFavorite = useFavoritesStore(state => state.isFavorite(device.id));
  const toggleFavorite = useFavoritesStore(state => state.toggle);

  const [info, setInfo] = useState<PeripheralInfo | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoConnect, setAutoConnect] = useState<boolean>(false);

  const isConnected = connectedDevice?.id === device.id;
  const deviceLabel = device.name || device.id;

  const {
    values,
    notifyingKeys,
    readingKey,
    notifyTogglingKey,
    read,
    toggleNotify,
    stopAllNotifications,
  } = useCharacteristicValues({peripheralId: device.id, log: addLog});

  /** Carrega services se ja estivermos conectados (caso a tela monte com conexao ativa). */
  const loadServices = useCallback(async () => {
    try {
      const peripheralInfo = await bluetoothService.retrieveServices(device.id);
      setInfo(peripheralInfo);
      const totalServices = peripheralInfo.services?.length ?? 0;
      const totalChars = peripheralInfo.characteristics?.length ?? 0;
      addLog(
        'info',
        `Descobertos ${totalServices} servico(s) e ${totalChars} caracteristica(s).`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addLog('error', `Erro ao recuperar servicos: ${message}`);
    }
  }, [device.id, addLog]);

  useEffect(() => {
    let cancelled = false;
    async function syncStatus() {
      try {
        const connected = await bluetoothService.isPeripheralConnected(device.id);
        if (cancelled) {
          return;
        }
        if (connected) {
          setConnectedDevice(device);
          addLog('info', `${deviceLabel} ja estava conectado; recuperando servicos.`);
          await loadServices();
        }
      } catch {
        /* getConnectedPeripherals pode falhar se BLE estiver off; UI ignora. */
      }
    }
    syncStatus();
    return () => {
      cancelled = true;
      stopAllNotifications().catch(() => undefined);
    };
  }, [device, deviceLabel, addLog, loadServices, setConnectedDevice, stopAllNotifications]);

  async function handleConnect() {
    setErrorMessage(null);
    setConnectionState('connecting');
    const mode = autoConnect ? 'autoconnect' : 'connect direto';
    addLog('info', `Conectando ao dispositivo ${deviceLabel} (${mode})...`);
    try {
      await bluetoothService.stopScan().catch(() => undefined);
      await bluetoothService.connect(device.id, {autoconnect: autoConnect});
      setConnectedDevice(device);
      addLog('success', `Conectado ao dispositivo ${deviceLabel}.`);
      await loadServices();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMessage(message);
      addLog('error', `Erro ao conectar em ${deviceLabel}: ${message}`);
    } finally {
      setConnectionState('idle');
    }
  }

  async function handleDisconnect() {
    setErrorMessage(null);
    setConnectionState('disconnecting');
    try {
      await stopAllNotifications();
      await bluetoothService.disconnect(device.id);
      setConnectedDevice(null);
      setInfo(null);
      addLog('info', `Desconectado do dispositivo ${deviceLabel}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMessage(message);
      addLog('error', `Erro ao desconectar de ${deviceLabel}: ${message}`);
    } finally {
      setConnectionState('idle');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{device.name || 'Dispositivo sem nome'}</Text>
        <FavoriteToggle isFavorite={isFavorite} onToggle={() => toggleFavorite(device)} />
      </View>

      <Text style={styles.label}>ID</Text>
      <Text style={styles.value}>{device.id}</Text>

      <Text style={styles.label}>RSSI</Text>
      <Text style={styles.value}>{device.rssi ?? 'Nao informado'}</Text>

      {!isConnected ? (
        <View style={styles.optionRow}>
          <Switch value={autoConnect} onValueChange={setAutoConnect} />
          <View style={styles.optionTexts}>
            <Text style={styles.optionTitle}>Modo autoconnect</Text>
            <Text style={styles.optionHint}>
              Tente esta opcao se a conexao direta dar timeout. O Android vai
              esperar o device aparecer e conectar quando possivel.
            </Text>
          </View>
        </View>
      ) : null}

      <ConnectButton
        isConnected={isConnected}
        connectionState={connectionState}
        onPress={isConnected ? handleDisconnect : handleConnect}
      />

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <Text style={styles.sectionTitle}>Servicos e caracteristicas</Text>
      {info ? (
        <ServicesList
          info={info}
          values={values}
          readingKey={readingKey}
          notifyTogglingKey={notifyTogglingKey}
          notifyingKeys={notifyingKeys}
          onRead={read}
          onToggleNotify={toggleNotify}
        />
      ) : (
        <Text style={styles.placeholder}>
          {isConnected
            ? 'Recuperando servicos...'
            : 'Conecte ao dispositivo para descobrir servicos e caracteristicas.'}
        </Text>
      )}
    </ScrollView>
  );
}

type ConnectButtonProps = {
  isConnected: boolean;
  connectionState: ConnectionState;
  onPress: () => void;
};

function ConnectButton({isConnected, connectionState, onPress}: ConnectButtonProps) {
  const isBusy = connectionState !== 'idle';
  const label = getButtonLabel(isConnected, connectionState);
  const buttonStyles = [
    styles.button,
    isConnected && styles.disconnectButton,
    isBusy && styles.disabledButton,
  ];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{disabled: isBusy, busy: isBusy}}
      style={buttonStyles}
      disabled={isBusy}
      onPress={onPress}>
      <View style={styles.buttonContent}>
        {isBusy ? (
          <ActivityIndicator color="#fff" style={styles.spinner} />
        ) : null}
        <Text style={styles.buttonText}>{label}</Text>
      </View>
    </Pressable>
  );
}

function getButtonLabel(
  isConnected: boolean,
  connectionState: ConnectionState,
): string {
  if (connectionState === 'connecting') {
    return 'Conectando...';
  }
  if (connectionState === 'disconnecting') {
    return 'Desconectando...';
  }
  return isConnected ? 'Desconectar' : 'Conectar';
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f9fafb'},
  content: {padding: 16, paddingBottom: 48},
  titleRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  title: {color: '#111827', fontSize: 24, fontWeight: '800', marginBottom: 16, flex: 1},
  label: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
    textTransform: 'uppercase',
  },
  value: {color: '#111827', fontSize: 15, marginTop: 4},
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  disconnectButton: {backgroundColor: '#dc2626'},
  disabledButton: {opacity: 0.7},
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {marginRight: 8},
  buttonText: {color: '#fff', fontWeight: '700'},
  errorText: {color: '#dc2626', marginTop: 12, fontSize: 13},
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    gap: 12,
  },
  optionTexts: {flex: 1},
  optionTitle: {color: '#111827', fontWeight: '700', fontSize: 13},
  optionHint: {color: '#6b7280', fontSize: 11, marginTop: 2, lineHeight: 14},
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 12,
  },
  placeholder: {
    color: '#6b7280',
    fontSize: 13,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
});
