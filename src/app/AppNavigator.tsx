import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from '../screens/HomeScreen';
import {ScanScreen} from '../screens/ScanScreen';
import {DeviceDetailsScreen} from '../screens/DeviceDetailsScreen';
import {LogsScreen} from '../screens/LogsScreen';
import {FavoritesScreen} from '../screens/FavoritesScreen';
import type {BluetoothDevice} from '../modules/bluetooth/bluetooth.types';

export type RootStackParamList = {
  Home: undefined;
  Scan: undefined;
  DeviceDetails: {device: BluetoothDevice};
  Logs: undefined;
  Favorites: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Native stack usa telas nativas (sem PanGestureHandler+Animated do pacote `@react-navigation/stack`). */
export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{title: 'BLE Monitor'}} />
        <Stack.Screen name="Scan" component={ScanScreen} options={{title: 'Buscar dispositivos'}} />
        <Stack.Screen name="DeviceDetails" component={DeviceDetailsScreen} options={{title: 'Detalhes do dispositivo'}} />
        <Stack.Screen name="Logs" component={LogsScreen} options={{title: 'Logs BLE'}} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} options={{title: 'Favoritos'}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
