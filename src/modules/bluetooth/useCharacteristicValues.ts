import {useCallback, useEffect, useRef, useState} from 'react';
import type {Characteristic} from 'react-native-ble-manager';
import {bluetoothService} from './bluetooth.service';
import {onUpdateValueForCharacteristic} from './bluetooth.events';
import {characteristicKey} from '../../components/ServicesList';
import type {CharacteristicValue} from '../../components/CharacteristicCard';

type Logger = (level: 'info' | 'success' | 'warning' | 'error', message: string) => void;

type Args = {
  peripheralId: string;
  /** Logger central da app (zustand `addLog`); usado para auditoria. */
  log: Logger;
};

type Return = {
  values: Record<string, CharacteristicValue>;
  notifyingKeys: Set<string>;
  readingKey: string | null;
  notifyTogglingKey: string | null;
  read: (characteristic: Characteristic) => Promise<void>;
  toggleNotify: (characteristic: Characteristic) => Promise<void>;
  /** Para o consumidor parar todas as notificacoes ao desconectar. */
  stopAllNotifications: () => Promise<void>;
};

/** Centraliza estado de leitura/notify por characteristic key. */
export function useCharacteristicValues({peripheralId, log}: Args): Return {
  const [values, setValues] = useState<Record<string, CharacteristicValue>>({});
  const [readingKey, setReadingKey] = useState<string | null>(null);
  const [notifyTogglingKey, setNotifyTogglingKey] = useState<string | null>(null);
  const [notifyingKeys, setNotifyingKeys] = useState<Set<string>>(new Set());

  const notifyingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const subscription = onUpdateValueForCharacteristic(event => {
      if (event.peripheral !== peripheralId) {
        return;
      }
      const key = `${event.service}::${event.characteristic}`;
      setValues(prev => ({
        ...prev,
        [key]: {
          bytes: event.value ?? [],
          receivedAt: new Date().toISOString(),
          source: 'notification',
        },
      }));
    });
    return () => {
      subscription.remove();
    };
  }, [peripheralId]);

  const read = useCallback(
    async (characteristic: Characteristic) => {
      const key = characteristicKey(characteristic);
      setReadingKey(key);
      try {
        const bytes = await bluetoothService.read(
          peripheralId,
          characteristic.service,
          characteristic.characteristic,
        );
        setValues(prev => ({
          ...prev,
          [key]: {
            bytes,
            receivedAt: new Date().toISOString(),
            source: 'read',
          },
        }));
        log('success', `Lido ${characteristic.characteristic} (${bytes.length} bytes).`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log('error', `Erro ao ler ${characteristic.characteristic}: ${message}`);
      } finally {
        setReadingKey(null);
      }
    },
    [peripheralId, log],
  );

  const toggleNotify = useCallback(
    async (characteristic: Characteristic) => {
      const key = characteristicKey(characteristic);
      setNotifyTogglingKey(key);
      const isOn = notifyingRef.current.has(key);
      try {
        if (isOn) {
          await bluetoothService.stopNotification(
            peripheralId,
            characteristic.service,
            characteristic.characteristic,
          );
          notifyingRef.current.delete(key);
          log('info', `Notify desativado em ${characteristic.characteristic}.`);
        } else {
          await bluetoothService.startNotification(
            peripheralId,
            characteristic.service,
            characteristic.characteristic,
          );
          notifyingRef.current.add(key);
          log('success', `Notify ativado em ${characteristic.characteristic}.`);
        }
        setNotifyingKeys(new Set(notifyingRef.current));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log('error', `Erro ao alternar notify de ${characteristic.characteristic}: ${message}`);
      } finally {
        setNotifyTogglingKey(null);
      }
    },
    [peripheralId, log],
  );

  const stopAllNotifications = useCallback(async () => {
    const keys = Array.from(notifyingRef.current);
    for (const key of keys) {
      const [service, characteristic] = key.split('::');
      await bluetoothService
        .stopNotification(peripheralId, service, characteristic)
        .catch(() => undefined);
    }
    notifyingRef.current.clear();
    setNotifyingKeys(new Set());
  }, [peripheralId]);

  return {
    values,
    notifyingKeys,
    readingKey,
    notifyTogglingKey,
    read,
    toggleNotify,
    stopAllNotifications,
  };
}
