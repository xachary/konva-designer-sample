<template>
  <div class="play-page">
    <section>
      <div v-for="(col, y) in matrix" :key="y.toString().padStart(2, '0')">
        <span
          v-for="(row, x) in col"
          :key="y.toString().padStart(2, '0') + x.toString().padStart(2, '0')"
          :class="{
            wall: row === 2,
            entry: row === 1
          }"
        >
          {{ row }}
        </span>
      </div>
    </section>
    <section>
      <div v-for="(col, y) in matrix" :key="y.toString().padStart(2, '0')">
        <span
          v-for="(row, x) in col"
          :key="y.toString().padStart(2, '0') + x.toString().padStart(2, '0')"
          :class="{
            wall: row === 2,
            entry: row === 1,
            route: way?.find((o) => o.x === x && o.y === y)
          }"
        >
          {{ row }}
        </span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import aStar from './Render/utils/aStar'

// const matrix = [
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0],
//   [0, 2, 2, 2, 0, 0, 0, 2, 2, 2, 0],
//   [0, 2, 1, 1, 1, 0, 0, 2, 2, 2, 0],
//   [0, 2, 2, 2, 0, 0, 0, 2, 2, 2, 0],
//   [0, 2, 2, 2, 0, 0, 1, 1, 1, 2, 0],
//   [0, 2, 2, 2, 0, 0, 0, 2, 2, 2, 0],
//   [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
// ]

const matrix = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 2, 2, 0, 0, 0, 2, 2, 2, 0],
  [0, 1, 2, 2, 0, 0, 0, 2, 2, 2, 0],
  [0, 2, 2, 2, 0, 0, 0, 2, 2, 1, 0],
  [0, 2, 2, 2, 0, 0, 0, 2, 2, 2, 0],
  [0, 2, 2, 2, 0, 0, 0, 2, 2, 2, 0],
  [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]

// const way = aStar({
//   from: { x: 2, y: 3 },
//   to: { x: 8, y: 5 },
//   matrix,
//   maxCost: 2
// })

const way = aStar({
  from: { x: 1, y: 3 },
  to: { x: 9, y: 4 },
  matrix,
  maxCost: 2
})

console.log(way)
</script>

<!-- <script setup lang="ts">
const maxCost = 2

// const data = [
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0],
//   [0, 2, 2, 2, 0, 0, 0, 2, 2, 2, 0],
//   [0, 2, 1, 1, 1, 0, 0, 2, 2, 2, 0],
//   [0, 2, 2, 2, 0, 0, 0, 2, 2, 2, 0],
//   [0, 2, 2, 2, 0, 0, 1, 1, 1, 2, 0],
//   [0, 2, 2, 2, 0, 0, 0, 2, 2, 2, 0],
//   [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
// ]

const data = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 2, 2, 0, 0, 0, 0],
  [0, 2, 1, 0, 0, 0, 0],
  [0, 2, 2, 0, 2, 2, 0],
  [0, 0, 0, 0, 1, 2, 0],
  [0, 0, 0, 0, 2, 2, 0],
  [0, 0, 0, 0, 0, 0, 0]
]

// const data = [
//   [0, 2, 2, 2, 0],
//   [0, 0, 0, 2, 0],
//   [0, 2, 0, 2, 0],
//   [0, 2, 0, 0, 0],
//   [0, 2, 0, 2, 0]
// ]

type Route = { x: number; y: number }

type StepRecord = {
  current: Route
  end: Route
  cost: number
  routes: Route[]
  prev?: StepRecord
}

function findNext(
  map: Array<number[]>,
  stepRecord: StepRecord,
  routesRecord: Route[][] = []
): Route[][] {
  const { current, end, cost, routes } = stepRecord

  if (current.x === end.x && current.y === end.y) {
    routesRecord.push(stepRecord.routes)
  } else {
    if (
      routes.findIndex((o) => o.x === current.x - 1 && o.y === current.y) < 0 &&
      map[current.y]?.[current.x - 1] < maxCost
    ) {
      const record: StepRecord = {
        current: { x: current.x - 1, y: current.y },
        end,
        prev: stepRecord,
        cost: cost + map[current.y][current.x - 1],
        routes: routes
      }
      // debugger
      record.routes = record.routes.concat(record.current)

      findNext(map, record, routesRecord)
    }

    if (
      routes.findIndex((o) => o.x === current.x + 1 && o.y === current.y) < 0 &&
      map[current.y]?.[current.x + 1] < maxCost
    ) {
      const record: StepRecord = {
        current: { x: current.x + 1, y: current.y },
        end,
        prev: stepRecord,
        cost: cost + map[current.y][current.x + 1],
        routes: routes
      }

      // debugger
      record.routes = record.routes.concat(record.current)
      findNext(map, record, routesRecord)
    }

    if (
      routes.findIndex((o) => o.x === current.x && o.y === current.y - 1) < 0 &&
      map[current.y - 1]?.[current.x] < maxCost
    ) {
      const record: StepRecord = {
        current: { x: current.x, y: current.y - 1 },
        end,
        prev: stepRecord,
        cost: cost + map[current.y - 1][current.x],
        routes: routes
      }

      // debugger
      record.routes = record.routes.concat(record.current)
      findNext(map, record, routesRecord)
    }

    if (
      routes.findIndex((o) => o.x === current.x && o.y === current.y + 1) < 0 &&
      map[current.y + 1]?.[current.x] < maxCost
    ) {
      const record: StepRecord = {
        current: { x: current.x, y: current.y + 1 },
        end,
        prev: stepRecord,
        cost: cost + map[current.y + 1][current.x],
        routes: routes
      }

      // debugger
      record.routes = record.routes.concat(record.current)
      findNext(map, record, routesRecord)
    }
  }

  return routesRecord
}

function calc(
  map: Array<number[]>,
  start: { x: number; y: number },
  end: { x: number; y: number }
) {
  const record: StepRecord = { current: start, end, cost: map[start.y][start.y], routes: [] }
  record.routes = [record.current]
  return findNext(map, record)
}

// const result: Array<number[]> = calc(data, { x: 3, y: 2 }, { x: 5, y: 8 })
// const result: Array<number[]> = calc(data, { x: 0, y: 0 }, { x: 2, y: 2 })
// const result = calc(data, { x: 0, y: 0 }, { x: 4, y: 0 })
const result = calc(data, { x: 2, y: 2 }, { x: 4, y: 4 })

console.log(result)
</script> -->

<style lang="less">
@font-size: 36px;
.play-page {
  background-color: #000;
  color: #fff;
  font-size: @font-size - 8px;
  line-height: @font-size;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  & > section {
    box-shadow: 0 0 1px 0px #fff;
    margin: @font-size 0 0 @font-size;
    & > div {
      display: flex;
      flex-wrap: wrap;
      & > span {
        display: inline-block;
        width: @font-size;
        height: @font-size;
        text-align: center;
        line-height: @font-size;
        background-color: #666;
        box-shadow: 0 0 1px 0px #fff;
        vertical-align: middle;
        &.wall {
          background-color: #333;
        }
        &.entry {
          background-color: #555;
        }
        &.route {
          color: yellow;
        }
      }
    }
  }
}
</style>
