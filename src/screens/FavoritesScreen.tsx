import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFavoritesStore, FavoriteDevice} from '../store/favorites.store';
import {FavoriteToggle} from '../components/FavoriteToggle';
import type {RootStackParamList} from '../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

export function FavoritesScreen({navigation}: Props) {
  const favorites = useFavoritesStore(state => state.favorites);
  const remove = useFavoritesStore(state => state.remove);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dispositivos favoritos</Text>
      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <FavoriteRow
            favorite={item}
            onPress={() =>
              navigation.navigate('DeviceDetails', {
                device: {
                  id: item.id,
                  name: item.name ?? '',
                  isConnectable: item.isConnectable,
                },
              })
            }
            onRemove={() => remove(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nenhum favorito ainda. Marque a estrela em um dispositivo para salvar.
          </Text>
        }
      />
    </View>
  );
}

type RowProps = {
  favorite: FavoriteDevice;
  onPress: () => void;
  onRemove: () => void;
};

function FavoriteRow({favorite, onPress, onRemove}: RowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowText}>
        <Text style={styles.rowName} numberOfLines={1}>
          {favorite.name || 'Dispositivo sem nome'}
        </Text>
        <Text style={styles.rowId}>{favorite.id}</Text>
        <Text style={styles.rowDate}>
          Salvo em {new Date(favorite.favoritedAt).toLocaleString()}
        </Text>
      </View>
      <FavoriteToggle isFavorite onToggle={onRemove} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  rowId: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  rowDate: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 4,
  },
  empty: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 48,
  },
});
