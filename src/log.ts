const optionsDefault = {
  colors: ['purple', 'blue', 'green', 'blueviolet', 'goldenrod', 'brown', 'chocolate'],
  type: 'log'
}

const logArray = (words: string[]) => {
  try {
    const { colors, type } = { ...optionsDefault }
    if (Array.isArray(words)) {
      const length = words.length
      const format = new Array(length).fill('%c%s').join('')
      const array = [...words].reduce((t: string[], v: string, i: number) => {
        const radius =
          length === 1 ? '4px' : { 0: '4px 0 0 4px', [(length - 1).toString()]: '0 4px 4px 0' }[i]
        return [
          ...t,
          `color:#fff;background:${colors[i] || 'black'};padding:2px 4px;border-radius:${radius};`,
          v
        ]
      }, [])
      
      ;(console as unknown as any)[type](format, ...array)
    }
  } catch (e) {
    console.error(e)
  }
}

export { logArray }
