declare const __BUILD_INFO__: {
  lastBuildTime: string
  git: Recordable<string>
}

interface Window {
  gifler: any
  PF: any
}

module 'canvas2svg' {
  export default class C2S extends CanvasRenderingContext2D {
    constructor(opts: { ctx: CanvasRenderingContext2D }) {
      console.log(opts)
    }
    getSerializedSvg() {
      return ''
    }
  }
}
