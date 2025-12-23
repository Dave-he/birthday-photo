import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd', '@ant-design/icons'],
          'refine-vendor': ['@refinedev/core', '@refinedev/antd', '@refinedev/react-router-v6'],
        },
      },
    },
    // 提高 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 压缩选项
    minify: 'esbuild',
    target: 'es2015',
  },
  // 开发服务器优化
  server: {
    hmr: true,
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd', '@refinedev/core'],
  },
})
