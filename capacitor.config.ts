import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kyrioprono.vayn',
  appName: 'VAYN',
  webDir: 'dist',
  backgroundColor: '#0b0a09',
  ios: { contentInset: 'never' },
  android: { backgroundColor: '#0b0a09' },
};

export default config;
