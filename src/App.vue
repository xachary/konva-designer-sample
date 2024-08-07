<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

import { Render } from './Render'

import * as Types from './Render/types'

import MainHeader from '@/components/main-header/index.vue'

// 连接线测试数据
import linkTestData from './test/link.json'
import rotateTestData from './test/rotate.json'
import alignTestData from './test/align.json'

// import copyTestData from './test/copy.json'
// import subAssetTestData from './test/sub-asset.json'
// import hoverTestData from './test/hover.json'
// import manualTestData from './test/manual.json'

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

    // onFull()
    // setTimeout(() => {
    //   // onLinkTest()
    //   // onRotateTest()
    //   onAlignTest()
    //   onDebug()
    // render?.importExportTool.restore(JSON.stringify(copyTestData))
    // render?.importExportTool.restore(JSON.stringify(subAssetTestData))
    // render?.importExportTool.restore(JSON.stringify(hoverTestData))
    // render?.importExportTool.restore(JSON.stringify(manualTestData))
    // }, 1000)
  }
}

onMounted(() => {
  init()
})

// const assetsModules: Record<string, { default: string }> = import.meta.glob(
//   ['./assets/img/*/*.{svg,png,jpg,gif}'],
//   {
//     eager: true
//   }
// )

// const assetsInfos = computed(() => {
//   return Object.keys(assetsModules).map((o) => ({
//     url: assetsModules[o].default,
//   }))
// })

// 从 public 加载静态资源 + 自定义连接点
const assetsModules: Array<Types.AssetInfo> = [
  { "url": "./json/1.json", avatar: './json/1.png' },
  { "url": "./json/2.json", avatar: './json/2.png' },
  { "url": "./json/3.json", avatar: './json/3.png' },
  { "url": "./json/4.json", avatar: './json/4.png' },
  { "url": "./json/5.json", avatar: './json/5.png' },
  { "url": "./json/6.json", avatar: './json/6.png' },
  //
  { "url": "./img/svg/ARRESTER_1.svg", points: [{ x: 101, y: 1, direction: 'top' }, { x: 101, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/ARRESTER_2.svg", points: [{ x: 101, y: 1, direction: 'top' }, { x: 101, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/ARRESTER_2_1.svg", points: [{ x: 101, y: 1, direction: 'top' }, { x: 101, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/BREAKER_CLOSE.svg", points: [{ x: 100, y: 1, direction: 'top' }, { x: 100, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/BREAKER_OPEN.svg", points: [{ x: 100, y: 1, direction: 'top' }, { x: 100, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/CAPACITOR.svg", points: [{ x: 99, y: 1, direction: 'top' }, { x: 99, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/CT_1.svg", points: [{ x: 100, y: 1, direction: 'top' }, { x: 100, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/CT_2.svg", points: [{ x: 100, y: 1, direction: 'top' }, { x: 100, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/HL.svg", points: [{ x: 100, y: 1, direction: 'top' }, { x: 100, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/POTENTIAL_TRANSFORMER_2.svg", points: [{ x: 100, y: 1, direction: 'top' }, { x: 100, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/POT_TRANS_3_WINDINGS.svg", points: [{ x: 100, y: 1, direction: 'top' }, { x: 70, y: 199, direction: 'bottom' }, { x: 130, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/PT.svg", points: [{ x: 34, y: 100, direction: 'left' }, { x: 98, y: 100, direction: 'right' }] },
  { "url": "./img/svg/PT_1.svg", points: [{ x: 101, y: 1, direction: 'top' }, { x: 101, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/REACTOR.svg", points: [{ x: 98, y: 1, direction: 'left' }, { x: 98, y: 199, direction: 'right' }] },
  { "url": "./img/svg/REGYCAPACITOR.svg", points: [{ x: 1, y: 101, direction: 'left' }, { x: 199, y: 101, direction: 'right' }] },
  { "url": "./img/svg/SERIES_CAPACITOR.svg", points: [{ x: 1, y: 101, direction: 'left' }, { x: 199, y: 101, direction: 'right' }] },
  { "url": "./img/svg/SHUNT_REACTOR.svg", points: [{ x: 98, y: 1, direction: 'top' }, { x: 98, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/SHUNT_REACTOR_1.svg", points: [{ x: 98, y: 1, direction: 'top' }, { x: 98, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/SIX_CIRCLE.svg", points: [{ x: 99, y: 1, direction: 'top' }, { x: 99, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/ST.svg", points: [{ x: 100, y: 1, direction: 'top' }, { x: 100, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/THERR_CIRCLE.svg", points: [{ x: 99, y: 43, direction: 'top' }, { x: 99, y: 157, direction: 'bottom' }] },
  // { "url": "./img/svg/a-CT2xianghu.svg" },
  // { "url": "./img/svg/a-CTsanxiang.svg" },
  { "url": "./img/svg/combin.svg", points: [{ x: 100, y: 1, direction: 'top' }, { x: 100, y: 199, direction: 'bottom' }] },
  // { "url": "./img/svg/combin2.svg" },
  { "url": "./img/svg/combin3.svg", points: [{ x: 100, y: 1, direction: 'top' }, { x: 100, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/combin4.svg", points: [{ x: 101, y: 1, direction: 'top' }, { x: 101, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/combin5.svg", points: [{ x: 99, y: 1, direction: 'top' }, { x: 99, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/xianshideng.svg", points: [{ x: 100, y: 1, direction: 'top' }, { x: 100, y: 199, direction: 'bottom' }] },
  { "url": "./img/svg/MEMRISTOR_1.svg", points: [{ x: 1, y: 101, direction: 'left' }, { x: 199, y: 101, direction: 'right' }] },
  // { "url": "./img/svg/ARCSUPPCOIL.svg" },
  // { "url": "./img/svg/INDUCTOR.svg" },
  // { "url": "./img/svg/IRONCOREGAPINDUCTOR.svg" },
  // { "url": "./img/svg/IRONCOREINDUCTOR.svg" },
  // { "url": "./img/svg/IRONCOREVARINDUCTOR.svg" },
  { "url": "./img/svg/guangfufadian.svg", points: [{ x: 100, y: 62, direction: 'top' }, { x: 100, y: 138, direction: 'bottom' }, { x: 27, y: 100, direction: 'left' }, { x: 173, y: 100, direction: 'right' }] },
  { "url": "./img/svg/REGUINDUCTOR.svg", points: [{ x: 100, y: 66, direction: 'top' }, { x: 100, y: 134, direction: 'bottom' }, { x: 1, y: 100, direction: 'left' }, { x: 199, y: 100, direction: 'right' }] },
  //
  // { "url": "./img/svg/CT.svg" },
  // { "url": "./img/svg/GROUND.svg" },
  // { "url": "./img/svg/LOAD.svg" },
  // { "url": "./img/svg/PROTECT_GROUND.svg" },
  // { "url": "./img/svg/CT_3.svg" },
  // { "url": "./img/svg/DDCT.svg" },
  // { "url": "./img/svg/FLANGED_CONNECTION.svg" },
  // { "url": "./img/svg/jiedidaozha.svg" },
  // { "url": "./img/svg/sukeduanluqi.svg" },
  //
  { "url": "./img/svg/AC_2.svg", points: [{ x: 100, y: 1, direction: 'top' }, { x: 100, y: 199, direction: 'bottom' }, { x: 1, y: 100, direction: 'left' }, { x: 199, y: 100, direction: 'right' }] },
  { "url": "./img/svg/AC_SOURCE.svg", points: [{ x: 100, y: 1, direction: 'top' }, { x: 100, y: 199, direction: 'bottom' }, { x: 1, y: 100, direction: 'left' }, { x: 199, y: 100, direction: 'right' }] },
  { "url": "./img/svg/EQUIVALENTSOURCE.svg", points: [{ x: 100, y: 100 }] },
  // { "url": "./img/svg/DELTAWINDING.svg" },
  // { "url": "./img/svg/MULTIPLIER.svg" },
  // { "url": "./img/svg/WINDING.svg" },
  // { "url": "./img/svg/WINDINGX.svg" },
  // { "url": "./img/svg/YWINDING.svg" },
  //
  { "url": "./img/png/1.png", points: [{ x: 52, y: 2, direction: 'top' }, { x: 52, y: 100, direction: 'bottom' }, { x: 2, y: 51, direction: 'left' }, { x: 101, y: 51, direction: 'right' }] },
  { "url": "./img/png/2.png" },
  // { "url": "./img/png/3.png" },
  // { "url": "./img/png/7.png" },
  // { "url": "./img/png/9.png" },
  //
  { "url": "./img/gif/5.gif", points: [{ x: 100, y: 100 }] },
  { "url": "./img/gif/6.gif" },
  { "url": "./img/gif/8.gif" },
]

const assetsInfos = computed(() => {
  return assetsModules.map((o) => ({
    url: o.url,
    avatar: o.avatar, // 子素材需要额外的封面
    points: Array.isArray(o.points) ? o.points : []
  }))
})

function onDragstart(e: GlobalEventHandlersEventMap['dragstart'], item: Types.AssetInfo) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('src', item.url)
    e.dataTransfer.setData('points', JSON.stringify(item.points)) // 传递连接点信息
    e.dataTransfer.setData('type', item.url.match(/([^./]+)\.([^./]+)$/)?.[2] ?? '')
  }
}

// 测试
function onLinkTest() {
  render?.importExportTool.restore(JSON.stringify(linkTestData))
}

function onRotateTest() {
  render?.importExportTool.restore(JSON.stringify(rotateTestData))
}

function onAlignTest() {
  render?.importExportTool.restore(JSON.stringify(alignTestData))
}

function onFull() {
  full.value = !full.value
}
</script>

<template>
  <div class="page">
    <header :style="{ height: full ? 0 : undefined, padding: full ? 0 : undefined }">
      <MainHeader :render="render" v-if="ready" />
    </header>
    <section>
      <header :style="{ width: full ? 0 : undefined }">
        <ul>
          <li v-for="(item, idx) of assetsInfos" :key="idx" draggable="true" @dragstart="onDragstart($event, item)">
            <img :src="item.avatar || item.url" />
          </li>
        </ul>
      </header>
      <section ref="boardElement">
        <div ref="stageElement"></div>
      </section>
      <footer :style="{ width: full ? 0 : undefined }">
        快捷键：<br>
        1、复制、粘贴、多选、全选、删除、上一步、下一步等快捷键与一般文档编辑器类似；<br>
        2、放大缩小，【Win】鼠标上滚动下滚动，【Mac】触控板双指放大、缩小；<br>
        3、画布拖动，在空白处，【Win】右键按下移动，【Mac】control + 触控板三指移动；<br>
      </footer>
    </section>
    <footer>
      <button @click="onLinkTest">“连接线”方向测试数据</button>
      <button @click="onRotateTest">“连接线”出入口测试数据</button>
      <button @click="onAlignTest">“对齐”测试数据</button>
      <button @click="onFull">{{ full ? '显示工具栏' : '隐藏工具栏' }}</button>
    </footer>
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

  &>header,
  &>footer {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    // display: flex;
    // padding: 12px;
    // align-items: center;
    // overflow: hidden;

    &>button {
      &+button {
        margin-left: 12px;
      }
    }
  }

  &>section {
    z-index: 1;
    height: 0;
    flex-grow: 1;
    display: flex;

    &>header,
    &>footer {
      width: 307px;
      flex-shrink: 0;
      background-color: #fff;
      z-index: 2;
    }

    &>header {
      box-shadow: 1px 0 2px 0 rgba(0, 0, 0, 0.05);
      overflow: auto;

      &>ul {
        display: flex;
        flex-wrap: wrap;

        &>li {
          width: 100px;
          height: 100px;
          flex-shrink: 0;
          border: 1px solid #eee;
          cursor: move;

          &>img {
            object-fit: contain;
            width: 100%;
            height: 100%;
          }
        }
      }
    }

    &>footer {
      box-shadow: -1px 0 2px 0 rgba(0, 0, 0, 0.05);
      padding: 12px;
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
