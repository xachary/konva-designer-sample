<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

import { Render } from './Render'

import * as Types from './Render/types'

// 容器
const boardElement = ref<HTMLDivElement>()
// 画布挂载节点
const stageElement = ref<HTMLDivElement>()

// 渲染器
let render: Render | null = null

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
            showRefLine: true
          })
        }
        render.resize(width, height)
      }
    })
  }
}

onMounted(() => {
  init()
})

const assetsModules: Record<string, { default: string }> = import.meta.glob(
  ['./assets/img/*/*.{svg,png,jpg,gif}'],
  {
    eager: true
  }
)

const assetsInfos = computed(() => {
  return Object.keys(assetsModules).map((o) => ({
    url: assetsModules[o].default
  }))
})

function onDragstart(e: GlobalEventHandlersEventMap['dragstart'], item: Types.AssetInfo) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('src', item.url)
    e.dataTransfer.setData('type', item.url.match(/([^./]+)\.([^./]+)$/)?.[2] ?? '')
  }
}
</script>

<template>
  <div class="page">
    <header></header>
    <section>
      <header>
        <ul>
          <li
            v-for="(item, idx) of assetsInfos"
            :key="idx"
            draggable="true"
            @dragstart="onDragstart($event, item)"
          >
            <img :src="item.url" style="object-fit: contain; width: 100%; height: 100%" />
          </li>
        </ul>
      </header>
      <section ref="boardElement">
        <div ref="stageElement"></div>
      </section>
      <footer></footer>
    </section>
    <footer></footer>
  </div>
</template>

<style lang="less" scoped>
.page {
  width: 100%;
  display: flex;
  flex-direction: column;
  & > header,
  & > footer {
    height: 64px;
    flex-shrink: 0;
    z-index: 2;
  }
  & > header {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  & > footer {
    box-shadow: 0 -1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  & > section {
    z-index: 1;
    height: 0;
    flex-grow: 1;
    display: flex;
    & > header,
    & > footer {
      width: 300px;
      flex-shrink: 0;
      background-color: #fff;
      z-index: 2;
    }
    & > header {
      box-shadow: 1px 0 2px 0 rgba(0, 0, 0, 0.05);
      overflow: auto;
      & > ul {
        display: flex;
        flex-wrap: wrap;
        & > li {
          width: 33.33%;
          flex-shrink: 0;
          border: 1px solid #eee;
          cursor: move;
        }
      }
    }
    & > footer {
      box-shadow: -1px 0 2px 0 rgba(0, 0, 0, 0.05);
    }
    & > section {
      width: 0;
      flex-grow: 1;
      background-color: rgba(0, 0, 0, 0.05);
      z-index: 1;
    }
  }
}
</style>
