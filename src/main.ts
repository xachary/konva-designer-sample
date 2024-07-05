import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
// import App from './PlayPage.vue'

import { logArray } from './log'

const {
  lastBuildTime,
  git: { branch, tag, hash }
} = __BUILD_INFO__

logArray(['branch', branch])
logArray(['tag', tag])
logArray(['hash', hash])
logArray(['build', lastBuildTime])

createApp(App).mount('#app')
