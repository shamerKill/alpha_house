/**
 * @format
 */

import { AppRegistry, YellowBox } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
// reactnavigation
import 'react-native-gesture-handler';

YellowBox.ignoreWarnings([
  'Warning: Overriding previous layout animation with new one before the first began:',
  'Unable to find module for UIManager',
]);

AppRegistry.registerComponent(appName, () => App);
