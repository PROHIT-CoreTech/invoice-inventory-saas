import { Platform } from 'react-native';

// Default host mapping: Android Emulator maps 10.0.2.2 to local host machine
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';

export let currentBaseUrl = `${DEFAULT_HOST}/api`;

export const setApiBaseUrl = (newUrl: string) => {
  let formatted = newUrl.trim();
  if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
    formatted = `http://${formatted}`;
  }
  if (!formatted.endsWith('/api')) {
    formatted = formatted.endsWith('/') ? `${formatted}api` : `${formatted}/api`;
  }
  currentBaseUrl = formatted;
  return currentBaseUrl;
};

export const getApiBaseUrl = () => currentBaseUrl;
