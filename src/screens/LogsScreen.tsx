import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {useBluetoothStore} from '../store/bluetooth.store';

export function LogsScreen() {
  const logs = useBluetoothStore(state => state.logs);
  const clearLogs = useBluetoothStore(state => state.clearLogs);

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={clearLogs}>
        <Text style={styles.buttonText}>Limpar logs</Text>
      </Pressable>

      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.logItem}>
            <Text style={styles.level}>{item.level.toUpperCase()}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum log registrado.</Text>}
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
  button: {
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#dc2626',
    fontWeight: '700',
  },
  logItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  level: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  message: {
    color: '#111827',
    fontSize: 14,
  },
  date: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 6,
  },
  empty: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 48,
  },
});
