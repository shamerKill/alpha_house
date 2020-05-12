/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './app/App';
import { name as appName } from './app.json';
// reactnavigation
import 'react-native-gesture-handler';

AppRegistry.registerComponent(appName, () => App);
