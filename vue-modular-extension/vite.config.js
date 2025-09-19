import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@store': resolve(__dirname, 'src/store')
    }
  },
  
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        popup: resolve(__dirname, 'popup.html')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    // Chrome 插件需要的特殊配置
    target: 'esnext',
    minify: false, // 便于调试，生产环境可以开启
    sourcemap: true
  },
  
  server: {
    port: 3000,
    open: true
  },
  
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@styles/variables.scss";`
      }
    }
  }
})
