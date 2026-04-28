import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

type ScanButtonProps = {
  isScanning: boolean;
  onPress: () => void;
};

export function ScanButton({isScanning, onPress}: ScanButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.button, isScanning && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isScanning}>
      <Text style={styles.text}>{isScanning ? 'Escaneando...' : 'Iniciar scan'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: '#fff',
    fontWeight: '700',
  },
});
