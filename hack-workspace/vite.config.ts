import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content.ts'),
        popup: resolve(__dirname, 'src/popup.ts'),
        chromeruntime: resolve(__dirname, 'src/chromeruntime.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        dir: '../hack'
      }
    }
  }
}); 