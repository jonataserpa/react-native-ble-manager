import {NativeEventEmitter, NativeModules} from 'react-native';
import type {EmitterSubscription} from 'react-native';
import {useBluetoothStore} from '../../store/bluetooth.store';

/**
 * Sentinela do BleManagerDidUpdateState.
 *
 * Em Old Architecture (newArchEnabled=false), `react-native-ble-manager`
 * expoe `NativeModules.BleManager` com os helpers `addListener`/`removeListeners`
 * que o `NativeEventEmitter` precisa para registrar callbacks JS no bridge.
 *
 * Mantemos um listener "sentinela" idempotente registrado o quanto antes
 * (chamado no `index.js`) para garantir que QUALQUER consumidor tenha o callback
 * disponivel mesmo antes de a UI montar.
 *
 * (No New Arch, essa lib em RN 0.78 ainda esta com bugs de codegen + NPE em
 * NativeBleManagerSpec.emitOnDidUpdateState — ver gradle.properties.)
 */
type StateListener = (state: string) => void;

let subscription: EmitterSubscription | null = null;
const listeners = new Set<StateListener>();

function ensureSubscription() {
  if (subscription) {
    return;
  }
  const emitter = new NativeEventEmitter(NativeModules.BleManager);
  subscription = emitter.addListener(
    'BleManagerDidUpdateState',
    (event: {state?: string} | undefined) => {
      const state = event?.state ?? 'unknown';
      listeners.forEach(listener => listener(state));
    },
  );
}

/**
 * Listener global de Connect/Disconnect: mantem o `connectedDevice` do store
 * sincronizado mesmo quando a conexao/desconexao acontece fora da tela
 * (ex: outra tela do app, reconexao automatica, ou desconexao espontanea
 * do peripheral fora de alcance).
 */
let connectionSubscriptions: EmitterSubscription[] | null = null;

function ensureConnectionTracking() {
  if (connectionSubscriptions) {
    return;
  }
  const emitter = new NativeEventEmitter(NativeModules.BleManager);
  connectionSubscriptions = [
    emitter.addListener(
      'BleManagerConnectPeripheral',
      (event: {peripheral?: string} | undefined) => {
        const id = event?.peripheral;
        if (!id) {
          return;
        }
        const store = useBluetoothStore.getState();
        const known = store.devices.find(item => item.id === id);
        store.setConnectedDevice(known ?? {id, name: ''});
        store.addLog('success', `Conexao detectada com ${known?.name || id}.`);
      },
    ),
    emitter.addListener(
      'BleManagerDisconnectPeripheral',
      (event: {peripheral?: string} | undefined) => {
        const id = event?.peripheral;
        const store = useBluetoothStore.getState();
        if (store.connectedDevice && store.connectedDevice.id === id) {
          store.setConnectedDevice(null);
          store.addLog('warning', `Desconexao detectada de ${id ?? 'desconhecido'}.`);
        }
      },
    ),
  ];
}

export function bootstrapBluetoothBridge(): void {
  ensureSubscription();
  ensureConnectionTracking();
}

export function onAdapterStateChange(listener: StateListener): () => void {
  ensureSubscription();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
