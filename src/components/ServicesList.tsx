import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {Characteristic, PeripheralInfo} from 'react-native-ble-manager';
import {CharacteristicCard, CharacteristicValue} from './CharacteristicCard';

type Props = {
  info: PeripheralInfo;
  values: Record<string, CharacteristicValue>;
  readingKey: string | null;
  notifyTogglingKey: string | null;
  notifyingKeys: Set<string>;
  onRead: (characteristic: Characteristic) => void;
  onToggleNotify: (characteristic: Characteristic) => void;
};

/** Chave estavel para identificar uma characteristic em mapas/sets. */
export function characteristicKey(characteristic: Characteristic): string {
  return `${characteristic.service}::${characteristic.characteristic}`;
}

export function ServicesList({
  info,
  values,
  readingKey,
  notifyTogglingKey,
  notifyingKeys,
  onRead,
  onToggleNotify,
}: Props) {
  const characteristics = info.characteristics ?? [];
  const services = info.services ?? [];

  if (services.length === 0 && characteristics.length === 0) {
    return (
      <Text style={styles.empty}>
        Nenhum servico foi descoberto para este dispositivo ainda.
      </Text>
    );
  }

  const charsByService = groupByService(characteristics);

  return (
    <View>
      {services.map(service => {
        const serviceChars = charsByService.get(service.uuid) ?? [];
        return (
          <View key={service.uuid} style={styles.serviceBlock}>
            <Text style={styles.serviceUuid}>Servico {service.uuid}</Text>
            {serviceChars.length === 0 ? (
              <Text style={styles.serviceEmpty}>Sem caracteristicas.</Text>
            ) : (
              serviceChars.map(characteristic => {
                const key = characteristicKey(characteristic);
                return (
                  <CharacteristicCard
                    key={key}
                    characteristic={characteristic}
                    value={values[key]}
                    isReading={readingKey === key}
                    isTogglingNotify={notifyTogglingKey === key}
                    isNotifying={notifyingKeys.has(key)}
                    onRead={() => onRead(characteristic)}
                    onToggleNotify={() => onToggleNotify(characteristic)}
                  />
                );
              })
            )}
          </View>
        );
      })}
    </View>
  );
}

function groupByService(
  characteristics: Characteristic[],
): Map<string, Characteristic[]> {
  const map = new Map<string, Characteristic[]>();
  for (const characteristic of characteristics) {
    const list = map.get(characteristic.service) ?? [];
    list.push(characteristic);
    map.set(characteristic.service, list);
  }
  return map;
}

const styles = StyleSheet.create({
  empty: {
    color: '#6b7280',
    fontStyle: 'italic',
    fontSize: 12,
  },
  serviceBlock: {
    marginBottom: 16,
  },
  serviceUuid: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 8,
    fontFamily: 'Courier',
  },
  serviceEmpty: {
    color: '#9ca3af',
    fontStyle: 'italic',
    fontSize: 12,
  },
});
