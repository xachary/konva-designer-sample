<template>
    <div class="asset-bar">
        <NCollapse arrow-placement="right" :default-expanded-names="['svg', 'image', 'gif', 'json']">
            <NCollapseItem name="svg" title="矢量图">
                <ul class="asset-bar__list">
                    <li v-for="(item, idx) of assetsSvg" :key="idx" draggable="true"
                        @dragstart="onDragstart($event, item)">
                        <img :src="item.avatar || item.url" />
                    </li>
                </ul>
            </NCollapseItem>
            <NCollapseItem name="image" title="图片">
                <ul class="asset-bar__list">
                    <li v-for="(item, idx) of assetsImage" :key="idx" draggable="true"
                        @dragstart="onDragstart($event, item)">
                        <img :src="item.avatar || item.url" />
                    </li>
                </ul>
            </NCollapseItem>
            <NCollapseItem name="gif" title="GIF">
                <ul class="asset-bar__list">
                    <li v-for="(item, idx) of assetsGif" :key="idx" draggable="true"
                        @dragstart="onDragstart($event, item)">
                        <img :src="item.avatar || item.url" />
                    </li>
                </ul>
            </NCollapseItem>
            <NCollapseItem name="json" title="图形组合">
                <ul class="asset-bar__list">
                    <li v-for="(item, idx) of assetsJson" :key="idx" draggable="true"
                        @dragstart="onDragstart($event, item)">
                        <img :src="item.avatar || item.url" />
                    </li>
                </ul>
            </NCollapseItem>
            <NCollapseItem name="more" title="更多">
                <ul class="asset-bar__list">
                    <li v-for="(item, idx) of assetsMore" :key="idx" draggable="true"
                        @dragstart="onDragstart($event, item)">
                        <img :src="item.avatar || item.url" />
                    </li>
                </ul>
            </NCollapseItem>
        </NCollapse>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import * as Types from '@/Render/types'
import { Render } from '@/Render'

import { NCollapse, NCollapseItem } from 'naive-ui'

import { assetsModules } from './data'

defineOptions({
    name: 'AssetBar',
});

defineProps<{
    render?: Render | null, // 实例
}>();

const assetsSvg = computed(() => {
    return assetsModules.svg.map((o) => ({
        url: o.url,
        avatar: o.avatar, // 子素材需要额外的封面
        points: Array.isArray(o.points) ? o.points : []
    }))
})

const assetsImage = computed(() => {
    return assetsModules.image.map((o) => ({
        url: o.url,
        avatar: o.avatar, // 子素材需要额外的封面
        points: Array.isArray(o.points) ? o.points : []
    }))
})

const assetsGif = computed(() => {
    return assetsModules.gif.map((o) => ({
        url: o.url,
        avatar: o.avatar, // 子素材需要额外的封面
        points: Array.isArray(o.points) ? o.points : []
    }))
})

const assetsJson = computed(() => {
    return assetsModules.json.map((o) => ({
        url: o.url,
        avatar: o.avatar, // 子素材需要额外的封面
        points: Array.isArray(o.points) ? o.points : []
    }))
})

const assetsMore = computed(() => {
    return assetsModules.more.map((o) => ({
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
</script>

<style lang="less" scoped>
.asset-bar {
    @padding: 8px;
    @col-width: 20%;

    background-color: var(--k-bg-color);
    width: var(--k-bar-width);
    min-height: 100%;

    :deep(.n-collapse) {
        .n-collapse-item__header.n-collapse-item__header--active {
            border-bottom: 1px solid var(--n-divider-color);
        }

        .n-collapse-item__header-main {
            padding: 4px @padding;

            &:hover {
                background-color: #eee;
            }
        }

        .n-collapse-item__header,
        .n-collapse-item__content-inner {
            padding-top: 0;
        }

        .n-collapse-item {
            margin-top: 0;
        }
    }

    &__list {
        display: flex;
        flex-wrap: wrap;
        padding: 4px;

        &>li {
            width: @col-width;
            padding-top: $width;
            flex-shrink: 0;
            cursor: move;
            position: relative;

            &:hover {
                background-color: #ddd;
            }

            &>img {
                position: absolute;
                top: 6px;
                left: $top;
                object-fit: contain;
                width: calc(100% - $top * 2);
                height: calc(100% - $top * 2);
            }
        }
    }
}
</style>