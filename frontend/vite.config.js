import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import commonjs from 'vite-plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    commonjs()
  ],
  // 构建配置
  build: {
    // 输出目录设置为backend/public
    outDir: '../backend/public',
    // 清空输出目录
    emptyOutDir: true,
    // 生成资源文件到static目录
    assetsDir: 'static',
    // 生成manifest文件
    manifest: true,
    // 源码映射
    sourcemap: false
  },
  server: {
    port: 4321,
    proxy: {
      '/api': {
        target: 'http://localhost:4320',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: [
      {
        find: /^@\/(.*)$/,
        replacement: `${path.resolve('.')}/src/$1`
      }
    ]
  }
})
