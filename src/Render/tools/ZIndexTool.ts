import Konva from 'konva';
import { Render } from '../index';

export class ZIndexTool {
  static readonly name = 'ZIndexTool';

  private render: Render;
  constructor(render: Render) {
    this.render = render;
  }

  // 获取移动节点
  getNodes(nodes: Konva.Node[]) {
    const targets: Konva.Node[] = [];
    for (const node of nodes) {
      if (node.parent instanceof Konva.Transformer) {
        targets.push(...this.render.selectionTool.selectingNodes);
      } else {
        targets.push(node);
      }
    }
    return targets;
  }

  // 最大 zIndex
  getMaxZIndex() {
    return Math.max(
      ...this.render.layer
        .getChildren((node) => {
          return !this.render.ignore(node);
        })
        .map((o) => o.zIndex()),
    );
  }

  // 最小 zIndex
  getMinZIndex() {
    return Math.min(
      ...this.render.layer
        .getChildren((node) => {
          return !this.render.ignore(node);
        })
        .map((o) => o.zIndex()),
    );
  }

  // 记录选择期间的 zIndex
  updateSelectingZIndex(nodes: Konva.Node[]) {
    // 记录选择期间的 zIndex
    for (const node of nodes) {
      node.setAttrs({
        selectingZIndex: node.zIndex(),
      });
    }
  }

  // 更新 zIndex 缓存
  updateLastZindex(nodes: Konva.Node[]) {
    for (const node of nodes) {
      node.setAttrs({
        lastZIndex: node.zIndex(),
      });
    }
  }

  // 恢复选择期间的 zIndex
  resetSelectingZIndex(nodes: Konva.Node[]) {
    nodes.sort((a, b) => a.zIndex() - b.zIndex());
    for (const node of nodes) {
      node.zIndex(node.attrs.selectingZIndex);
    }
  }

  top(nodes: Konva.Node[]) {
    // 最大 zIndex
    let maxZIndex = this.getMaxZIndex();

    const sorted = this.getNodes(nodes).sort((a, b) => b.zIndex() - a.zIndex());

    if (this.render.selectionTool.selectingNodes.length > 0) {
      // 先选中再调整
      this.updateSelectingZIndex(sorted);

      // 置顶
      for (const node of sorted) {
        node.setAttrs({
          lastZIndex: maxZIndex--,
        });
      }

      this.resetSelectingZIndex(sorted);
    } else {
      // 直接调整

      for (const node of sorted) {
        node.zIndex(maxZIndex);
      }

      this.updateLastZindex(sorted);
    }
  }
  up(nodes: Konva.Node[]) {
    // 最大zIndex
    const maxZIndex = this.getMaxZIndex();

    const sorted = this.getNodes(nodes).sort((a, b) => b.zIndex() - a.zIndex());

    this.render.selectionTool.selectingNodes.length > 0 && this.updateSelectingZIndex(sorted);

    // 上移
    let lastNode: Konva.Node | null = null;
    for (const node of sorted) {
      if (
        node.attrs.lastZIndex < maxZIndex &&
        (lastNode === null || node.attrs.lastZIndex < lastNode.attrs.lastZIndex - 1)
      ) {
        node.setAttrs({
          lastZIndex: node.attrs.lastZIndex + 1,
        });
      }
      lastNode = node;
    }

    this.render.selectionTool.selectingNodes.length > 0 && this.resetSelectingZIndex(sorted);
  }
  down(nodes: Konva.Node[]) {
    // 最小 zIndex
    const minZIndex = this.getMinZIndex();

    const sorted = this.getNodes(nodes).sort((a, b) => a.zIndex() - b.zIndex());

    this.render.selectionTool.selectingNodes.length > 0 && this.updateSelectingZIndex(sorted);

    // 下移
    let lastNode: Konva.Node | null = null;
    for (const node of sorted) {
      if (
        node.attrs.lastZIndex > minZIndex &&
        (lastNode === null || node.attrs.lastZIndex > lastNode.attrs.lastZIndex + 1)
      ) {
        node.setAttrs({
          lastZIndex: node.attrs.lastZIndex - 1,
        });
      }
      lastNode = node;
    }

    this.render.selectionTool.selectingNodes.length > 0 && this.resetSelectingZIndex(sorted);
  }
  bottom(nodes: Konva.Node[]) {
    // 最小 zIndex
    let minZIndex = this.getMinZIndex();

    const sorted = this.getNodes(nodes).sort((a, b) => a.zIndex() - b.zIndex());

    if (this.render.selectionTool.selectingNodes.length > 0) {
      // 先选中再调整
      this.updateSelectingZIndex(sorted);

      // 置底
      for (const node of sorted) {
        node.setAttrs({
          lastZIndex: minZIndex++,
        });
      }

      this.resetSelectingZIndex(sorted);
    } else {
      // 直接调整

      for (const node of sorted) {
        node.zIndex(minZIndex);
      }

      this.updateLastZindex(sorted);
    }
  }
}
