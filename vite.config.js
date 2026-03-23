import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // Python后端：主要处理视频流和算法相关
      '/api/video_feed': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Java后端：主要处理业务逻辑（登录、考勤、人员管理等）
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), // 根据Java后端实际前缀决定是否重写
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), // 根据Java后端实际前缀决定是否重写
      },
    },
  },
})
