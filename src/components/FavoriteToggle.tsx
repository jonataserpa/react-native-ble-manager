import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

type Props = {
  isFavorite: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
};

/**
 * Botao "estrela" sem dependencia de fonte de icones: usa um glifo Unicode
 * para evitar instalar @expo/vector-icons em RN puro.
 */
export function FavoriteToggle({isFavorite, onToggle, size = 'md'}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      onPress={onToggle}
      hitSlop={8}
      style={[styles.button, size === 'sm' && styles.buttonSm]}>
      <Text
        style={[
          styles.icon,
          size === 'sm' && styles.iconSm,
          isFavorite && styles.iconActive,
        ]}>
        {isFavorite ? '\u2605' : '\u2606'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  buttonSm: {
    paddingHorizontal: 4,
    paddingVertical: 0,
  },
  icon: {
    fontSize: 22,
    color: '#9ca3af',
  },
  iconSm: {
    fontSize: 18,
  },
  iconActive: {
    color: '#f59e0b',
  },
});
