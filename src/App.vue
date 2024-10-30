<script setup lang="ts">
import { ref, onMounted, watch, type Ref, nextTick } from 'vue'

import type Konva from 'konva'

import { Render } from './Render'
import * as Types from './Render/types'

import { NIcon, NFloatButton, NTabs, NTabPane, NForm, NFormItem, NColorPicker, NCheckbox, NInputNumber } from 'naive-ui'

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
const graphType: Ref<Types.GraphType | undefined> = ref()

watch(() => graphType.value, () => {
  render?.changeGraphType(graphType.value)
})

function init() {
  if (boardElement.value && stageElement.value) {
    resizer.init(boardElement.value, {
      resize: async (x, y, width, height) => {
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

          // 同步页面设置
          pageSettingsModel.value = render.getPageSettings()

          await nextTick()

          ready.value = true
        }
        render.resize(width, height)

        // 同步页面设置
        render.on('page-settings-change', (settings: Types.PageSettings) => {
          pageSettingsModelInnerChange.value = true
          pageSettingsModel.value = settings
        })

        render.on('selection-change', (nodes: Konva.Node[]) => {
          assetSettingsModelInnerChange.value = true
          
          if (nodes.length === 0) {
            // 清空选择
            assetCurrent.value = undefined
            assetSettingsModel.value = undefined

            tabCurrent.value = linkCurrent.value ? 'link' : 'page'
          } else if (nodes.length === 1) {
            // 单选
            assetCurrent.value = nodes[0]
            assetSettingsModel.value = render!.getAssetSettings(nodes[0])

            tabCurrent.value = 'asset'
          } else {
            // 多选
            assetCurrent.value = undefined
            assetSettingsModel.value = undefined

            tabCurrent.value = linkCurrent.value ? 'link' : 'page'
          }
        })

        render.on('link-selection-change', (link?: Konva.Line) => {
          linkSettingsModelInnerChange.value = true

          linkCurrent.value = link
          linkSettingsModel.value = render!.getLinkSettings(link)

          tabCurrent.value = linkCurrent.value ? 'link' : 'page'
        })
      }
    })
  }
}

onMounted(() => {
  init()
})

// 当前 tab
const tabCurrent = ref('page')

// 页面设置
const pageSettingsModel: Ref<Types.PageSettings | undefined> = ref()
const pageSettingsModelInnerChange = ref(false)

const pageSettingsModelBackground = ref('')
const pageSettingsModelStroke = ref('')
const pageSettingsModelFill = ref('')
const pageSettingsModelLinkStroke = ref('')

// 当前素材
const assetCurrent: Ref<Konva.Node | undefined> = ref()

// 素材设置
const assetSettingsModel: Ref<Types.AssetSettings | undefined> = ref()
const assetSettingsModelInnerChange = ref(false)

const assetSettingsModelStroke = ref('')
const assetSettingsModelFill = ref('')

// 当前连接线
const linkCurrent: Ref<Konva.Line | undefined> = ref()
// 素材设置
const linkSettingsModel: Ref<Types.LinkSettings | undefined> = ref()
const linkSettingsModelInnerChange = ref(false)

const linkSettingsModelStroke = ref('')

watch(() => pageSettingsModel.value, () => {
  if (pageSettingsModel.value) {
    pageSettingsModelBackground.value = pageSettingsModel.value.background
    pageSettingsModelStroke.value = pageSettingsModel.value.stroke
    pageSettingsModelFill.value = pageSettingsModel.value.fill
    pageSettingsModelLinkStroke.value = pageSettingsModel.value.linkStroke

    if (ready.value && !pageSettingsModelInnerChange.value) {
      render?.setPageSettings(pageSettingsModel.value)
    }
  }

  pageSettingsModelInnerChange.value = false
}, {
  deep: true
})

watch(() => assetSettingsModel.value, () => {
  if (assetSettingsModel.value && assetCurrent.value) {
    assetSettingsModelStroke.value = assetSettingsModel.value.stroke
    assetSettingsModelFill.value = assetSettingsModel.value.fill

    if (ready.value && !assetSettingsModelInnerChange.value) {
      render?.setAssetSettings(assetCurrent.value, assetSettingsModel.value)
    }
  }

  assetSettingsModelInnerChange.value = false
}, {
  deep: true
})

watch(() => linkSettingsModel.value, () => {
  if (linkSettingsModel.value && linkCurrent.value) {
    linkSettingsModelStroke.value = linkSettingsModel.value.stroke

    if (ready.value && !linkSettingsModelInnerChange.value) {
      render?.setLinkSettings(linkCurrent.value, linkSettingsModel.value)
    }
  }

  linkSettingsModelInnerChange.value = false
}, {
  deep: true
})
</script>

<template>
<div class="page">
  <header v-show="!full">
    <MainHeader :render="render" v-model:full="full" v-model:graphType="graphType" v-if="ready" />
  </header>
  <section>
    <header v-show="!full">
      <AssetBar :render="render" v-if="ready"></AssetBar>
    </header>
    <section ref="boardElement">
      <div ref="stageElement"></div>
    </section>
    <footer v-show="!full">
      <n-tabs type="line" size="small" animated v-model:value="tabCurrent">
        <n-tab-pane name="page" tab="页面">
          <n-form ref="formRef" :model="pageSettingsModel" :rules="{}" label-placement="top" size="small"
            v-if="pageSettingsModel">
            <n-form-item label="背景色" path="background">
              <n-color-picker v-model:value="pageSettingsModelBackground" @update:show="(v: boolean) => {
                pageSettingsModel && !v && (pageSettingsModelBackground = pageSettingsModel.background)
              }" :actions="['clear', 'confirm']" show-preview
                @confirm="(v: string) => { pageSettingsModel && (pageSettingsModel.background = v) }"
                @clear="pageSettingsModel && (pageSettingsModel.background = Render.PageSettingsDefault.background)"></n-color-picker>
            </n-form-item>
            <n-form-item label="线条颜色" path="stroke">
              <n-color-picker v-model:value="pageSettingsModelStroke" @update:show="(v: boolean) => {
                pageSettingsModel && !v && (pageSettingsModelStroke = pageSettingsModel.stroke)
              }" :actions="['clear', 'confirm']" show-preview
                @confirm="(v: string) => { pageSettingsModel && (pageSettingsModel.stroke = v) }"
                @clear="pageSettingsModel && (pageSettingsModel.stroke = Render.AssetSettingsDefault.stroke)"></n-color-picker>
            </n-form-item>
            <n-form-item label="填充颜色" path="fill">
              <n-color-picker v-model:value="pageSettingsModelFill" @update:show="(v: boolean) => {
                pageSettingsModel && !v && (pageSettingsModelFill = pageSettingsModel.fill)
              }" :actions="['clear', 'confirm']" show-preview
                @confirm="(v: string) => { pageSettingsModel && (pageSettingsModel.fill = v) }"
                @clear="pageSettingsModel && (pageSettingsModel.fill = Render.AssetSettingsDefault.fill)"></n-color-picker>
            </n-form-item>
            <n-form-item label="连接线颜色" path="stroke">
              <n-color-picker v-model:value="pageSettingsModelLinkStroke" @update:show="(v: boolean) => {
                pageSettingsModel && !v && (pageSettingsModelLinkStroke = pageSettingsModel.linkStroke)
              }" :actions="['clear', 'confirm']" show-preview
                @confirm="(v: string) => { pageSettingsModel && (pageSettingsModel.linkStroke = v) }"
                @clear="pageSettingsModel && (pageSettingsModel.linkStroke = Render.LinkSettingsDefault.stroke)"></n-color-picker>
            </n-form-item>
            <n-form-item label="连接线粗细" path="strokeWidth">
              <n-input-number v-model:value="pageSettingsModel.linkStrokeWidth" placeholder="Input" />
            </n-form-item>
          </n-form>
        </n-tab-pane>
        <n-tab-pane name="asset" tab="素材" :disabled="assetCurrent === void 0">
          <!-- {{ Object.keys((assetCurrent as Konva.Group)?.children[(assetCurrent as
            Konva.Group)?.children.length - 1]?.attrs) }} -->
          <n-form ref="formRef" :model="assetSettingsModel" :rules="{}" label-placement="top" size="small"
            v-if="assetSettingsModel">
            <n-form-item label="线条颜色" path="stroke"
              v-if="assetCurrent?.attrs.imageType === Types.ImageType.svg || assetCurrent?.attrs.assetType === Types.AssetType.Graph">
              <n-color-picker v-model:value="assetSettingsModelStroke" @update:show="(v: boolean) => {
                assetSettingsModel && !v && (assetSettingsModelStroke = assetSettingsModel.stroke)
              }" :actions="['clear', 'confirm']" show-preview
                @confirm="(v: string) => { assetSettingsModel && (assetSettingsModel.stroke = v) }"
                @clear="assetSettingsModel && (assetSettingsModel.stroke = Render.AssetSettingsDefault.stroke)"></n-color-picker>
            </n-form-item>
            <n-form-item label="填充颜色" path="fill"
              v-if="assetCurrent?.attrs.imageType === Types.ImageType.svg || assetCurrent?.attrs.graphType === Types.GraphType.Rect || assetCurrent?.attrs.graphType === Types.GraphType.Circle">
              <n-color-picker v-model:value="assetSettingsModelFill" @update:show="(v: boolean) => {
                assetSettingsModel && !v && (assetSettingsModelFill = assetSettingsModel.fill)
              }" :actions="['clear', 'confirm']" show-preview
                @confirm="(v: string) => { assetSettingsModel && (assetSettingsModel.fill = v) }"
                @clear="assetSettingsModel && (assetSettingsModel.fill = Render.AssetSettingsDefault.fill)"></n-color-picker>
            </n-form-item>
            <n-form-item label="箭头" path="fill"
              v-if="assetCurrent?.attrs.graphType === Types.GraphType.Line || assetCurrent?.attrs.graphType === Types.GraphType.Curve">
              <n-checkbox v-model:checked="assetSettingsModel.arrowStart">
                开始
              </n-checkbox>
              <n-checkbox v-model:checked="assetSettingsModel.arrowEnd">
                结束
              </n-checkbox>
            </n-form-item>
          </n-form>
        </n-tab-pane>
        <n-tab-pane name="link" tab="连接线" :disabled="linkCurrent === void 0">
          <n-form ref="formRef" :model="linkSettingsModel" :rules="{}" label-placement="top" size="small"
            v-if="linkSettingsModel">
            <n-form-item label="线条颜色" path="stroke">
              <n-color-picker v-model:value="linkSettingsModelStroke" @update:show="(v: boolean) => {
                linkSettingsModel && !v && (linkSettingsModelStroke = linkSettingsModel.stroke)
              }" :actions="['clear', 'confirm']" show-preview
                @confirm="(v: string) => { linkSettingsModel && (linkSettingsModel.stroke = v) }"
                @clear="linkSettingsModel && (linkSettingsModel.stroke = Render.LinkSettingsDefault.stroke)"></n-color-picker>
            </n-form-item>
            <n-form-item label="线条粗细" path="strokeWidth">
              <n-input-number v-model:value="linkSettingsModel.strokeWidth" placeholder="Input" />
            </n-form-item>
          </n-form>
        </n-tab-pane>
      </n-tabs>
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
      box-shadow: -1px 0 2px 0 rgba(0, 0, 0, 0.05);
      border-left: 1px solid #ccc;
      padding: 8px;

      :deep(.n-tabs-nav-scroll-content) {
        box-shadow: 0 -1px 0 0 rgb(230, 230, 230) inset;
        border-bottom-color: rgb(230, 230, 230) !important;
      }

      :deep(.n-tabs-tab-pad) {
        width: 16px;
      }
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
