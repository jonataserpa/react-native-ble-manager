/**
 * @format
 * Gesture Handler deve ser o primeiro import (React Navigation / native-stack).
 */
import 'react-native-gesture-handler';
import {enableScreens} from 'react-native-screens';

enableScreens(true);

import {AppRegistry} from 'react-native';
// Sentinela do react-native-ble-manager 12.x em New Arch: precisa de um listener
// JS no NativeBleManager ANTES de qualquer evento nativo, senao NullPointerException
// em NativeBleManagerSpec.emitOnDidUpdateState. Importa antes do App.
import {bootstrapBluetoothBridge} from './src/modules/bluetooth/bluetooth.boot';
import App from './App';
// Import default do JSON: destructuring `{ name }` pode não existir no bundle Metro → nome undefined e registro falha.
import appConfig from './app.json';

bootstrapBluetoothBridge();

const appName = appConfig.name ?? 'BleDeviceMonitor';

AppRegistry.registerComponent(appName, () => App);
