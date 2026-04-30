import BleManager from 'react-native-ble-manager';
import type {Peripheral, PeripheralInfo} from 'react-native-ble-manager';

export type AdapterState = 'on' | 'off' | 'unknown' | 'unsupported';

/** Timeout padrao para `connect` (ms). Devices que nao respondem caem aqui. */
export const DEFAULT_CONNECT_TIMEOUT_MS = 20000;

export class BluetoothService {
  async start(): Promise<void> {
    await BleManager.start({showAlert: false});
  }

  async enableBluetooth(): Promise<void> {
    if (typeof BleManager.enableBluetooth === 'function') {
      await BleManager.enableBluetooth();
    }
  }

  async getAdapterState(): Promise<AdapterState> {
    if (typeof BleManager.checkState !== 'function') {
      return 'unknown';
    }
    const raw = await BleManager.checkState();
    return normalizeAdapterState(raw);
  }

  /** v11 usa argumentos posicionais. */
  async scan(seconds = 5): Promise<void> {
    await BleManager.scan([], seconds, false);
  }

  async stopScan(): Promise<void> {
    await BleManager.stopScan();
  }

  /**
   * Conecta com timeout client-side.
   *
   * - `autoconnect: true` (Android) faz o stack tentar continuamente quando o device
   *   aparecer; util para devices que so aceitam GATT em pequenas janelas de
   *   advertising e bloqueiam tentativas diretas. NAO retorna sucesso ate o GATT
   *   abrir, entao combinamos com `timeoutMs`.
   * - Em caso de erro/timeout, fazemos `disconnect` para limpar estado parcial.
   */
  async connect(
    peripheralId: string,
    options: {timeoutMs?: number; autoconnect?: boolean} = {},
  ): Promise<void> {
    const {timeoutMs = DEFAULT_CONNECT_TIMEOUT_MS, autoconnect = false} = options;
    try {
      await withTimeout(
        BleManager.connect(peripheralId, {autoconnect}),
        timeoutMs,
        `Tempo esgotado ao conectar (${Math.round(timeoutMs / 1000)}s). ` +
          'O dispositivo pode nao suportar GATT, estar fora de alcance ou ja pareado em outro app.',
      );
    } catch (error) {
      await BleManager.disconnect(peripheralId).catch(() => undefined);
      throw error;
    }
  }

  async disconnect(peripheralId: string): Promise<void> {
    await BleManager.disconnect(peripheralId);
  }

  /** Lista todos os peripherals atualmente conectados pelo BleManager (Android/iOS). */
  async getConnectedPeripherals(serviceUUIDs: string[] = []): Promise<Peripheral[]> {
    return BleManager.getConnectedPeripherals(serviceUUIDs);
  }

  async isPeripheralConnected(peripheralId: string): Promise<boolean> {
    return BleManager.isPeripheralConnected(peripheralId, []);
  }

  /**
   * [Android] Cria/aceita o bond (pareamento). Necessario para alguns devices que
   * pedem PIN ou que nao expoem GATT enquanto nao estiverem bonded.
   */
  async createBond(peripheralId: string, pin: string | null = null): Promise<void> {
    if (typeof BleManager.createBond === 'function') {
      await BleManager.createBond(peripheralId, pin);
    }
  }

  async retrieveServices(peripheralId: string): Promise<PeripheralInfo> {
    return BleManager.retrieveServices(peripheralId);
  }

  async read(
    peripheralId: string,
    serviceUUID: string,
    characteristicUUID: string,
  ): Promise<number[]> {
    return BleManager.read(peripheralId, serviceUUID, characteristicUUID);
  }

  async startNotification(
    peripheralId: string,
    serviceUUID: string,
    characteristicUUID: string,
  ): Promise<void> {
    await BleManager.startNotification(
      peripheralId,
      serviceUUID,
      characteristicUUID,
    );
  }

  async stopNotification(
    peripheralId: string,
    serviceUUID: string,
    characteristicUUID: string,
  ): Promise<void> {
    await BleManager.stopNotification(
      peripheralId,
      serviceUUID,
      characteristicUUID,
    );
  }
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }) as Promise<T>;
}

function normalizeAdapterState(raw: unknown): AdapterState {
  if (typeof raw !== 'string') {
    return 'unknown';
  }
  const value = raw.toLowerCase();
  if (value.includes('on')) {
    return 'on';
  }
  if (value.includes('off')) {
    return 'off';
  }
  if (value.includes('unsupported')) {
    return 'unsupported';
  }
  return 'unknown';
}

export const bluetoothService = new BluetoothService();
