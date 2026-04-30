import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import type {Characteristic} from 'react-native-ble-manager';
import {bytesToHex, bytesToPrintableString} from '../shared/formatBytes';

export type CharacteristicValue = {
  bytes: number[];
  receivedAt: string;
  source: 'read' | 'notification';
};

type Props = {
  characteristic: Characteristic;
  value?: CharacteristicValue;
  isReading: boolean;
  isTogglingNotify: boolean;
  isNotifying: boolean;
  onRead: () => void;
  onToggleNotify: () => void;
};

export function CharacteristicCard({
  characteristic,
  value,
  isReading,
  isTogglingNotify,
  isNotifying,
  onRead,
  onToggleNotify,
}: Props) {
  const properties = Object.keys(characteristic.properties ?? {});
  const canRead = !!characteristic.properties?.Read;
  const canNotify =
    !!characteristic.properties?.Notify || !!characteristic.properties?.Indicate;

  return (
    <View style={styles.card}>
      <Text style={styles.uuid}>{characteristic.characteristic}</Text>
      {properties.length > 0 ? (
        <Text style={styles.props}>{properties.join(' · ')}</Text>
      ) : null}

      {value ? <ValueBlock value={value} /> : null}

      <View style={styles.actions}>
        {canRead ? (
          <ActionButton
            label="Ler"
            loading={isReading}
            onPress={onRead}
            kind="primary"
          />
        ) : null}
        {canNotify ? (
          <ActionButton
            label={isNotifying ? 'Parar notify' : 'Assinar notify'}
            loading={isTogglingNotify}
            onPress={onToggleNotify}
            kind={isNotifying ? 'danger' : 'secondary'}
          />
        ) : null}
        {!canRead && !canNotify ? (
          <Text style={styles.disabledHint}>Sem propriedades suportadas para leitura/notificacao.</Text>
        ) : null}
      </View>
    </View>
  );
}

function ValueBlock({value}: {value: CharacteristicValue}) {
  const printable = bytesToPrintableString(value.bytes);
  const hex = bytesToHex(value.bytes);
  const time = new Date(value.receivedAt).toLocaleTimeString();
  return (
    <View style={styles.valueBlock}>
      <Text style={styles.valueLabel}>
        {value.source === 'notification' ? 'Notify' : 'Leitura'} as {time}
      </Text>
      <Text style={styles.valueHex}>{hex || '(vazio)'}</Text>
      {printable ? <Text style={styles.valueText}>"{printable}"</Text> : null}
    </View>
  );
}

type ActionButtonProps = {
  label: string;
  loading: boolean;
  onPress: () => void;
  kind: 'primary' | 'secondary' | 'danger';
};

function ActionButton({label, loading, onPress, kind}: ActionButtonProps) {
  const buttonStyle = [
    styles.actionButton,
    kind === 'primary' && styles.actionPrimary,
    kind === 'secondary' && styles.actionSecondary,
    kind === 'danger' && styles.actionDanger,
    loading && styles.actionDisabled,
  ];
  const textStyle = [
    styles.actionText,
    kind === 'secondary' && styles.actionTextSecondary,
  ];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{busy: loading, disabled: loading}}
      disabled={loading}
      style={buttonStyle}
      onPress={onPress}>
      {loading ? (
        <ActivityIndicator
          color={kind === 'secondary' ? '#2563eb' : '#fff'}
          style={styles.spinner}
        />
      ) : null}
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  uuid: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#111827',
  },
  props: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  valueBlock: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  valueLabel: {
    color: '#a5b4fc',
    fontSize: 10,
    fontWeight: '700',
  },
  valueHex: {
    color: '#fff',
    fontFamily: 'Courier',
    fontSize: 12,
    marginTop: 4,
  },
  valueText: {
    color: '#cbd5e1',
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionPrimary: {backgroundColor: '#2563eb'},
  actionSecondary: {borderWidth: 1, borderColor: '#2563eb'},
  actionDanger: {backgroundColor: '#dc2626'},
  actionDisabled: {opacity: 0.7},
  actionText: {color: '#fff', fontWeight: '700', fontSize: 13},
  actionTextSecondary: {color: '#2563eb'},
  spinner: {marginRight: 6},
  disabledHint: {color: '#9ca3af', fontSize: 11, fontStyle: 'italic'},
});
