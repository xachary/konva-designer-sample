<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { Render } from './Render'

import { NIcon, NFloatButton } from 'naive-ui'

import {
  FullScreenMinimize24Regular
} from '@vicons/fluent'

import MainHeader from '@/components/main-header/index.vue'
import AssetBar from '@/components/asset-bar/index.vue'

// 容器
const boardElement = ref<HTMLDivElement>()
// 画布挂载节点
const stageElement = ref<HTMLDivElement>()

// 渲染器
let render: Render | null = null
const ready = ref(false)

const resizer = (() => {
  // 监听器
  let resizeObserver: ResizeObserver | null = null
  // 初始x
  let x = 0
  // 初始化
  function init(
    target: HTMLDivElement,
    config: {
      resize: (x: number, y: number, w: number, h: number) => void
    }
  ) {
    // 获取容器大小
    function getStageSize() {
      const { width, height } = target.getBoundingClientRect()

      return [0, 0, width, height]
    }

    if (resizeObserver) {
      // 重新监听
      resizeObserver.observe(target)
    } else {
      // 初始化 监听器
      resizeObserver = new ResizeObserver(() => {
        const [, , w, h] = getStageSize()
        // 通知
        config.resize(x - target.getBoundingClientRect().x, 0, w, h)
      })
      // 监听
      resizeObserver.observe(target)
      x = target.getBoundingClientRect().x
    }
  }
  // 暂停监听
  function pause() {
    resizeObserver?.disconnect()
  }
  return {
    init,
    pause
  }
})()

const full = ref(false)

function init() {
  if (boardElement.value && stageElement.value) {
    resizer.init(boardElement.value, {
      resize: (x, y, width, height) => {
        if (render === null) {
          // 初始化渲染
          render = new Render(stageElement.value!, {
            width,
            height,
            //
            showBg: true,
            showRuler: true,
            showRefLine: true,
            attractResize: true,
            attractBg: true,
            showPreview: true,
            attractNode: true,
          })

          ready.value = true
        }
        render.resize(width, height)
      }
    })
  }
}

onMounted(() => {
  init()
})
</script>

<template>
  <div class="page">
    <header v-show="!full">
      <MainHeader :render="render" v-model:full="full" v-if="ready" />
    </header>
    <section>
      <header v-show="!full">
        <AssetBar :render="render" v-if="ready"></AssetBar>
      </header>
      <section ref="boardElement">
        <div ref="stageElement"></div>
      </section>
      <footer v-show="!full">
        快捷键：<br>
        1、复制、粘贴、多选、全选、删除、上一步、下一步等快捷键与一般文档编辑器类似；<br>
        2、放大缩小，【Win】鼠标上滚动下滚动，【Mac】触控板双指放大、缩小；<br>
        3、画布拖动，在空白处，【Win】右键按下移动，【Mac】control + 触控板三指移动；<br>
      </footer>
    </section>
    <footer>
      <!--  -->
    </footer>
    <NFloatButton shape="square" position="fixed" :top="40 + 8" :right="8" style="z-index: 100;" @click="full = !full"
      v-show="full">
      <NIcon>
        <FullScreenMinimize24Regular />
      </NIcon>
    </NFloatButton>
  </div>
</template>

<style lang="less" scoped>
.page {
  width: 100%;
  display: flex;
  flex-direction: column;

  &>header,
  &>footer {
    flex-shrink: 0;
    z-index: 2;
  }

  &>section {
    z-index: 1;
    height: 0;
    flex-grow: 1;
    display: flex;

    &>header,
    &>footer {
      flex-shrink: 0;
    }

    &>header {
      overflow: auto;
      border-right: 1px solid #ccc;
    }

    &>footer {
      width: calc(var(--k-bar-width) + var(--k-scroll-width));
      background-color: var(--k-bg-color);
      z-index: 2;
      padding: 8px;
      box-shadow: -1px 0 2px 0 rgba(0, 0, 0, 0.05);
      border-left: 1px solid #ccc;
    }

    &>section {
      width: 0;
      flex-grow: 1;
      background-color: rgba(0, 0, 0, 0.05);
      z-index: 1;
    }
  }
}
</style>
