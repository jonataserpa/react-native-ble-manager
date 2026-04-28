import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

type PermissionStatusProps = {
  granted: boolean;
};

export function PermissionStatus({granted}: PermissionStatusProps) {
  return (
    <View style={[styles.container, granted ? styles.success : styles.warning]}>
      <Text style={styles.text}>
        {granted ? 'Permissões Bluetooth concedidas' : 'Permissões Bluetooth pendentes'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  success: {
    backgroundColor: '#dcfce7',
  },
  warning: {
    backgroundColor: '#fef3c7',
  },
  text: {
    color: '#111827',
    fontWeight: '600',
  },
});
