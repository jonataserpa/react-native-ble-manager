import {NativeEventEmitter, NativeModules} from 'react-native';
import type {EmitterSubscription} from 'react-native';

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

export function bootstrapBluetoothBridge(): void {
  ensureSubscription();
}

export function onAdapterStateChange(listener: StateListener): () => void {
  ensureSubscription();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
