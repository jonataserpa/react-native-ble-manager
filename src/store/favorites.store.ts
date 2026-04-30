import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {BluetoothDevice} from '../modules/bluetooth/bluetooth.types';

const STORAGE_KEY = '@bledevicemonitor:favorites/v1';

export type FavoriteDevice = Pick<
  BluetoothDevice,
  'id' | 'name' | 'isConnectable'
> & {
  /** ISO 8601 do momento em que foi favoritado. */
  favoritedAt: string;
};

type FavoritesStore = {
  favorites: FavoriteDevice[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  isFavorite: (deviceId: string) => boolean;
  add: (device: BluetoothDevice) => Promise<void>;
  remove: (deviceId: string) => Promise<void>;
  toggle: (device: BluetoothDevice) => Promise<void>;
};

async function persist(favorites: FavoriteDevice[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favorites: [],
  hydrated: false,

  async hydrate() {
    if (get().hydrated) {
      return;
    }
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as FavoriteDevice[]) : [];
      set({favorites: parsed, hydrated: true});
    } catch {
      set({favorites: [], hydrated: true});
    }
  },

  isFavorite(deviceId) {
    return get().favorites.some(item => item.id === deviceId);
  },

  async add(device) {
    if (get().isFavorite(device.id)) {
      return;
    }
    const next: FavoriteDevice[] = [
      ...get().favorites,
      {
        id: device.id,
        name: device.name,
        isConnectable: device.isConnectable,
        favoritedAt: new Date().toISOString(),
      },
    ];
    set({favorites: next});
    await persist(next);
  },

  async remove(deviceId) {
    const next = get().favorites.filter(item => item.id !== deviceId);
    set({favorites: next});
    await persist(next);
  },

  async toggle(device) {
    if (get().isFavorite(device.id)) {
      await get().remove(device.id);
    } else {
      await get().add(device);
    }
  },
}));
