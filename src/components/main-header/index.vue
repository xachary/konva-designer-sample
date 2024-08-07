<template>
    <div class="main-header">
        <header>
            <img class="main-header__logo" src="/logo.png" alt="">
            <div>
                <div class="main-header__title">Designer Sample</div>
                <div class="main-header__menu">
                    <NMenu mode="horizontal" responsive :options="menuOptions" v-model:value="activeMenuKey"
                        :on-update:value="() => activeMenuKey = ''" />
                </div>
            </div>
        </header>
        <footer class="main-header__action">
            <NDropdown trigger="hover" :options="scaleOptions" @select="scaleChange">
                <NButton tag="div" size="tiny" quaternary>{{ scale.toFixed(0) }}%</NButton>
            </NDropdown>
            <NDivider vertical />
            <NTooltip trigger="hover" :delay="1000">
                <template #trigger>
                    <NButton tag="div" size="tiny" quaternary @click="onPrev" :disabled="historyIndex <= 0">
                        <template #icon>
                            <NIcon>
                                <IosUndo />
                            </NIcon>
                        </template>
                    </NButton>
                </template>
                撤销
            </NTooltip>
            <NTooltip trigger="hover" :delay="1000">
                <template #trigger>
                    <NButton tag="div" size="tiny" quaternary @click="onNext"
                        :disabled="historyIndex >= history.length - 1">
                        <template #icon>
                            <NIcon>
                                <IosRedo />
                            </NIcon>
                        </template>
                    </NButton>
                </template>
                恢复
            </NTooltip>
            <NDivider vertical />
            <NTooltip trigger="hover" :delay="1000">
                <template #trigger>
                    <NButton tag="div" size="tiny" quaternary @click="onAlign(Types.AlignType.垂直居中)"
                        :disabled="noAlign">
                        <template #icon>
                            <NIcon>
                                <AlignCenterVertical16Regular />
                            </NIcon>
                        </template>
                    </NButton>
                </template>
                垂直居中
            </NTooltip>
            <NTooltip trigger="hover" :delay="1000">
                <template #trigger>
                    <NButton tag="div" size="tiny" quaternary @click="onAlign(Types.AlignType.水平居中)"
                        :disabled="noAlign">
                        <template #icon>
                            <NIcon>
                                <AlignCenterHorizontal16Regular />
                            </NIcon>
                        </template>
                    </NButton>
                </template>
                水平居中
            </NTooltip>
            <NTooltip trigger="hover" :delay="1000">
                <template #trigger>
                    <NButton tag="div" size="tiny" quaternary @click="onAlign(Types.AlignType.左对齐)" :disabled="noAlign">
                        <template #icon>
                            <NIcon>
                                <AlignLeft16Regular />
                            </NIcon>
                        </template>
                    </NButton>
                </template>
                左对齐
            </NTooltip>
            <NTooltip trigger="hover" :delay="1000">
                <template #trigger>
                    <NButton tag="div" size="tiny" quaternary @click="onAlign(Types.AlignType.右对齐)" :disabled="noAlign">
                        <template #icon>
                            <NIcon>
                                <AlignRight16Regular />
                            </NIcon>
                        </template>
                    </NButton>
                </template>
                右对齐
            </NTooltip>
            <NTooltip trigger="hover" :delay="1000">
                <template #trigger>
                    <NButton tag="div" size="tiny" quaternary @click="onAlign(Types.AlignType.上对齐)" :disabled="noAlign">
                        <template #icon>
                            <NIcon>
                                <AlignTop16Regular />
                            </NIcon>
                        </template>
                    </NButton>
                </template>
                上对齐
            </NTooltip>
            <NTooltip trigger="hover" :delay="1000">
                <template #trigger>
                    <NButton tag="div" size="tiny" quaternary @click="onAlign(Types.AlignType.下对齐)" :disabled="noAlign">
                        <template #icon>
                            <NIcon>
                                <AlignBottom16Regular />
                            </NIcon>
                        </template>
                    </NButton>
                </template>
                下对齐
            </NTooltip>
            <NDivider vertical />
            <NTooltip trigger="hover" :delay="1000">
                <template #trigger>
                    <NButton tag="div" size="tiny" quaternary @click="onLinkTypeChange(Types.LinkType.auto)"
                        :disabled="currentLinkType === Types.LinkType.auto">
                        <template #icon>
                            <NIcon>
                                <Pulse20Regular />
                            </NIcon>
                        </template>
                    </NButton>
                </template>
                连接线：自动
            </NTooltip>
            <NTooltip trigger="hover" :delay="1000">
                <template #trigger>
                    <NButton tag="div" size="tiny" quaternary @click="onLinkTypeChange(Types.LinkType.straight)"
                        :disabled="currentLinkType === Types.LinkType.straight">
                        <template #icon>
                            <NIcon>
                                <Line20Regular />
                            </NIcon>
                        </template>
                    </NButton>
                </template>
                连接线：直线
            </NTooltip>
            <NTooltip trigger="hover" :delay="1000">
                <template #trigger>
                    <NButton tag="div" size="tiny" quaternary @click="onLinkTypeChange(Types.LinkType.manual)"
                        :disabled="currentLinkType === Types.LinkType.manual">
                        <template #icon>
                            <NIcon>
                                <Flowchart20Regular />
                            </NIcon>
                        </template>
                    </NButton>
                </template>
                连接线：手动
            </NTooltip>
            <NDivider vertical />
            <NTooltip trigger="hover" :delay="1000">
                <template #trigger>
                    <NButton tag="div" size="tiny" quaternary @click="onDebug">
                        <template #icon>
                            <NIcon :depth="debug ? 1 : 3">
                                <Bug16Regular />
                            </NIcon>
                        </template>
                    </NButton>
                </template>
                {{ debug ? '关闭调试' : '开启调试' }}
            </NTooltip>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, h, type Ref } from 'vue'

import type Konva from 'konva'

import * as Types from '@/Render/types'
import * as Draws from '@/Render/draws'
import { Render } from '@/Render'

import { NMenu, NButton, NIcon, NTooltip, NDropdown, NDivider } from 'naive-ui'
import { IosUndo, IosRedo } from '@vicons/ionicons4'
import {
    AlignCenterVertical16Regular,
    AlignCenterHorizontal16Regular,
    AlignLeft16Regular,
    AlignRight16Regular,
    AlignTop16Regular,
    AlignBottom16Regular,
    Pulse20Regular,
    Line20Regular,
    Flowchart20Regular,
    Bug16Regular
} from '@vicons/fluent'

defineOptions({
    name: 'MainHeader',
});

const props = defineProps<{
    render?: Render | null, // 实例
}>();

// 从 json 文件恢复
function onRestore() {
    if (props.render) {
        const input = document.createElement('input')
        input.type = 'file'
        const event = new MouseEvent('click')
        input.dispatchEvent(event)
        input.remove()
        input.onchange = () => {
            const files = input.files
            if (files) {
                let reader = new FileReader()
                reader.onload = function () {
                    // 读取为 json 文本
                    props.render!.importExportTool.restore(this.result!.toString())
                }
                reader.readAsText(files[0])
            }
        }
    }
}

// 保持 json 文件
function onSave() {
    if (props.render) {
        const a = document.createElement('a')
        const event = new MouseEvent('click')
        a.download = 'data.json'
        a.href = window.URL.createObjectURL(new Blob([props.render.importExportTool.save()]))
        a.dispatchEvent(event)
        a.remove()
    }
}

// 另存为Svg
async function onSaveSvg() {
    if (props.render) {
        // 3倍尺寸、白色背景
        const svg = await props.render.importExportTool.getSvg()

        const a = document.createElement('a')
        const event = new MouseEvent('click')
        a.download = 'image.svg'
        a.href = window.URL.createObjectURL(new Blob([svg]))
        a.dispatchEvent(event)
        a.remove()
    }
}

// 另存为元素
function onSaveAsset() {
    if (props.render) {
        const a = document.createElement('a')
        const event = new MouseEvent('click')
        a.download = 'asset.json'
        a.href = window.URL.createObjectURL(new Blob([props.render.importExportTool.getAsset()]))
        a.dispatchEvent(event)
        a.remove()
    }
}

// 另存为元素图片
function onSaveAssetPNG() {
    if (props.render) {
        // 3倍尺寸、白色背景
        const url = props.render.importExportTool.getAssetImage(3, '#ffffff')

        const a = document.createElement('a')
        const event = new MouseEvent('click')
        a.download = 'image'
        a.href = url
        a.dispatchEvent(event)
        a.remove()
    }
}

// 历史记录
const history = ref<string[]>([])
const historyIndex = ref(-1)

function onPrev() {
    if (props.render) {
        props.render.prevHistory()
    }
}

function onNext() {
    if (props.render) {
        props.render.nextHistory()
    }
}

const selection: Ref<Konva.Node[]> = ref([])



// 是否可以进行对齐
const noAlign = computed(() => selection.value.length <= 1)

// 对齐方法
function onAlign(type: Types.AlignType) {
    props.render?.alignTool.align(type)
}

// 连接线模式
const currentLinkType = ref(Types.LinkType.auto)

function onLinkTypeChange(linkType: Types.LinkType) {
    (props.render?.draws[Draws.LinkDraw.name] as Draws.LinkDraw).changeLinkType(linkType)
}

// 调试模式
const debug = ref(false)
function onDebug() {
    debug.value = props.render?.changeDebug(!debug.value) ?? false
}

const activeMenuKey = ref('')
const menuOptions = [
    {
        label: '文件',
        key: 'file',
        children: [
            {
                label: () => h(
                    'a',
                    {
                        target: '_blank',
                        rel: 'noopenner noreferrer',
                        onClick: onRestore
                    },
                    '导入'
                ),
                key: 'import',
            },
            {
                label: () => h(
                    'a',
                    {
                        target: '_blank',
                        rel: 'noopenner noreferrer',
                        onClick: onSave
                    },
                    '导出'
                ),
                key: 'export',
            },
            {
                type: 'divider',
            },
            {
                label: () => h(
                    'a',
                    {
                        target: '_blank',
                        rel: 'noopenner noreferrer',
                        onClick: onSaveAssetPNG
                    },
                    '另存为图片'
                ),
                key: 'png',
            },
            {
                label: () => h(
                    'a',
                    {
                        target: '_blank',
                        rel: 'noopenner noreferrer',
                        onClick: onSaveSvg
                    },
                    '另存为矢量图'
                ),
                key: 'svg',
            },
            {
                type: 'divider',
            },
            {
                label: () => h(
                    'a',
                    {
                        target: '_blank',
                        rel: 'noopenner noreferrer',
                        onClick: onSaveAsset
                    },
                    '另存为素材'
                ),
                key: 'json',
            },
        ]
    }, {
        label: '帮助',
        key: 'help',
        children: [
            {
                type: 'group',
                label: '网站',
                key: 'website',
                children: [
                    {
                        label: () => h(
                            'a',
                            {
                                target: '_blank',
                                rel: 'noopenner noreferrer'
                            },
                            'CSDN'
                        ),
                        key: 'CSDN',
                    },
                    {
                        label: () => h(
                            'a',
                            {
                                href: 'https://juejin.cn/column/7353542036232585225',
                                target: '_blank',
                                rel: 'noopenner noreferrer'
                            },
                            '稀土掘金'
                        ),
                        key: '稀土掘金',
                    },
                    {
                        label: () => h(
                            'a',
                            {
                                href: 'https://i.cnblogs.com/collections/detail?collectionId=14920',
                                target: '_blank',
                                rel: 'noopenner noreferrer'
                            },
                            '博客园'
                        ),
                        key: '博客园',
                    },
                ]
            },
            {
                type: 'divider',
            },
            {
                type: 'group',
                label: '仓库',
                key: 'repo',
                children: [
                    {
                        label: () => h(
                            'a',
                            {
                                href: 'https://github.com/xachary/konva-designer-sample',
                                target: '_blank',
                                rel: 'noopenner noreferrer'
                            },
                            'GitHub'
                        ),
                        key: 'GitHub',
                    },
                    {
                        label: () => h(
                            'a',
                            {
                                href: 'https://gitee.com/xachary/konva-designer-sample',
                                target: '_blank',
                                rel: 'noopenner noreferrer'
                            },
                            'Gitee'
                        ),
                        key: 'Gitee',
                    },
                ]
            },
            {
                type: 'divider',
            },
            {
                label: 'v0.0.1',
                key: 'version',
                disabled: true
            },
        ]
    }
]

const scale = ref(100)

const scaleOptions = [
    {
        label: '重置位置大小',
        key: 'reset'
    },
    {
        label: '仅重置位置',
        key: 'position'
    },
]
function scaleChange(key: 'reset' | 'position') {
    switch (key) {
        case 'reset': props.render?.positionTool.positionZoomReset(); break
        case 'position': props.render?.positionTool.positionReset(); break
    }
}

watch(() => props.render, () => {
    if (props.render) {
        props.render?.on('selection-change', (nodes: Konva.Node[]) => {
            selection.value = nodes
        })

        props.render?.on('history-change', ({ records, index }) => {
            history.value = records
            historyIndex.value = index
        })

        props.render?.on('link-type-change', (value) => {
            currentLinkType.value = value
        })

        props.render?.on('debug-change', (value) => {
            debug.value = value
        })

        props.render?.on('scale-change', (value) => {
            scale.value = value * 100
        })
    }

}, {
    immediate: true
})
</script>

<style lang="less" scoped>
.main-header {
    background-color: #F2F3F4;

    @top-height: 64px;
    @menu-height: 28px;

    &>header {
        display: flex;
        align-items: center;
        box-shadow: 0 1px 0 0 #DBDCE0, 0 2px 0 0 #fff;

        :deep(.n-submenu) {
            &>.n-menu-item {
                height: @menu-height;

                &>.n-menu-item-content {
                    padding: 0 6px;
                    height: @menu-height;
                    line-height: @menu-height;
                }
            }
        }
    }

    &>footer {
        box-shadow: 0 1px 0 0 #DBDCE0;
        display: flex;
        align-items: center;
        padding: 4px 8px 3px 8px;
    }

    &__logo {
        flex-shrink: 0;
        max-height: @top-height;
    }

    &__menu {
        flex-shrink: 0;
    }

    &__title {
        font-size: 22px;
        font-weight: bold;
        margin-left: 6px;
        line-height: @top-height - @menu-height;
    }

    &__action {
        //
    }
}
</style>