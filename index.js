/**
 * @format
 * Gesture Handler deve ser o primeiro import (React Navigation / native-stack).
 */
import 'react-native-gesture-handler';
import {enableScreens} from 'react-native-screens';

enableScreens(true);

import {AppRegistry} from 'react-native';
import App from './App';
// Import default do JSON: destructuring `{ name }` pode não existir no bundle Metro → nome undefined e registro falha.
import appConfig from './app.json';

const appName = appConfig.name ?? 'BleDeviceMonitor';

AppRegistry.registerComponent(appName, () => App);
