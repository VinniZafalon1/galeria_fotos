import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'galeria_fotos',
  webDir: 'dist',

  plugins: {
    Camera: {
      permissions: ["camera", "photos"]
    }
  }
};

export default config;
