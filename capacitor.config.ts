
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fazendamaster.app',
  appName: 'Fazenda Master',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
