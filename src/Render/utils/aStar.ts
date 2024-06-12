export interface Node {
  x: number
  y: number
  cost?: number // 代价
  parent?: Node // 上一步
}

export default function aStar(config: {
  from: Node // 起点
  to: Node // 终点
  matrix: number[][] // 矩阵
  maxCost: number // 作为墙的值
}): Node[] {
  const { from, to, matrix, maxCost = 1 } = config

  const grid: Node[][] = matrixToGrid(matrix)

  const start = grid[from.y][from.x]
  const goal = grid[to.y][to.x]

  // 初始化 open 和 closed 列表
  const open: Node[] = [start]
  const closed = new Set<Node>()

  // 初始化每个节点的 f, g, h 值
  const f = new Map<Node, number>()
  const g = new Map<Node, number>()
  const h = new Map<Node, number>()
  g.set(start, 0)
  h.set(start, manhattanDistance(start, goal))
  f.set(start, g.get(start)! + h.get(start)!)

  // A* 算法主循环
  while (open.length > 0) {
    // 从 open 列表中找到 f 值最小的节点
    const current = open.reduce((a, b) => (f.get(a)! < f.get(b)! ? a : b))

    // 如果当前节点是目标节点，返回路径
    if (current === goal) {
      return reconstructPath(goal)
    }

    // 将当前节点从 open 列表中移除，并加入 closed 列表
    open.splice(open.indexOf(current), 1)
    closed.add(current)

    // 遍历当前节点的邻居
    for (const neighbor of getNeighbors(current, grid)) {
      // 如果邻居节点已经在 closed 列表中，跳过
      if (closed.has(neighbor)) {
        continue
      }

      // 计算从起点到邻居节点的距离（转弯距离增加）
      const tentativeG =
        g.get(current)! + // 累计距离
        (neighbor.cost ?? 1) + // 下一步距离
        (g.get(current)! > 1 && // 第二步开始再考虑转弯代价
        ((current.x === current.parent?.x && current.x !== neighbor.x) ||
          (current.y === current.parent?.y && current.y !== neighbor.y))
          ? grid.length + grid[0].length
          : 0)

      // 如果邻居节点不在 open 列表中，或者新的 g 值更小，更新邻居节点的 g, h, f 值，并将其加入 open 列表
      if (!open.includes(neighbor) || tentativeG < g.get(neighbor)!) {
        g.set(neighbor, tentativeG)
        h.set(neighbor, manhattanDistance(neighbor, goal))
        f.set(neighbor, g.get(neighbor)! + h.get(neighbor)!)
        neighbor.parent = current
        if (!open.includes(neighbor)) {
          open.push(neighbor)
        }
      }
    }
  }

  // 如果 open 列表为空，表示无法到达目标节点，返回 null
  return []

  // 数据转换
  function matrixToGrid(matrix: number[][]) {
    const mt: Node[][] = []

    for (let y = 0; y < matrix.length; y++) {
      if (mt[y] === void 0) {
        mt[y] = []
      }
      for (let x = 0; x < matrix[y].length; x++) {
        mt[y].push({
          x,
          y,
          cost: matrix[y][x]
        })
      }
    }

    return mt
  }

  // 从目标节点开始，沿着 parent 指针重构路径
  function reconstructPath(node: Node): Node[] {
    const path = [node]
    while (node.parent) {
      path.push(node.parent)
      node = node.parent
    }
    return path.reverse()
  }

  // 计算曼哈顿距离
  function manhattanDistance(a: Node, b: Node): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
  }

  // 获取当前节点的邻居
  function getNeighbors(node: Node, grid: Node[][]): Node[] {
    const neighbors = []
    const { x, y } = node
    if (x > 0 && (grid[y][x - 1].cost ?? 0) < maxCost) {
      neighbors.push(grid[y][x - 1])
    }
    if (x < grid[0].length - 1 && (grid[y][x + 1].cost ?? 0) < maxCost) {
      neighbors.push(grid[y][x + 1])
    }
    if (y > 0 && (grid[y - 1][x].cost ?? 0) < maxCost) {
      neighbors.push(grid[y - 1][x])
    }
    if (y < grid.length - 1 && (grid[y + 1][x].cost ?? 0) < maxCost) {
      neighbors.push(grid[y + 1][x])
    }
    return neighbors
  }
}
