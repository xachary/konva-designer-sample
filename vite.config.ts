import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// @ts-ignore 此库无声明
import git from 'git-rev-sync'
import dayjs from 'dayjs'

// 部署分支
let branch = ''
// 部署hash
let hash = ''
// 最近的tag
let tag = ''
try {
  branch = git.branch('./git')
  hash = git.long('./git')
  tag = git.tag('./git')
} catch (e) {
  console.error(e)
}

const __BUILD_INFO__ = {
  lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  git: {
    branch,
    hash,
    tag
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'docs',
    minify: false,
    assetsInlineLimit: 0
  },
  base: './',
  server: {
    host: true
  },
  define: {
    __BUILD_INFO__
  }
})
