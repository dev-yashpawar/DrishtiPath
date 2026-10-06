import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const offlineAssets={name:'offline-assets',generateBundle(options,bundle){this.emitFile({type:'asset',fileName:'offline-assets.json',source:JSON.stringify(Object.keys(bundle).filter(name=>/\.(js|css)$/.test(name)).map(name=>'/'+name))});}};
export default defineConfig({plugins:[react(),offlineAssets],server:{proxy:{'/api':'http://127.0.0.1:3001'}}});
