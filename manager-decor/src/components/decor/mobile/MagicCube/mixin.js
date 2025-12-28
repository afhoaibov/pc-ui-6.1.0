export default {
  methods: {
    handleGetBlockSize(block, block_size = 750 / 2) {
      return {
        width: block_size * block.width,
        height: block_size * block.height,
        left: block_size * block.x,
        top: block_size * block.y
      }
    },
    getCubeHeight(block_size = 750 / 2) {
      const { blockList } = this.$$FormData
      if (!blockList || !blockList.length) return ''
      let temp = blockList[0]
      for (let i = 0; i < blockList.length; i++) {
        const block = blockList[i]
        if (block.y > temp.y) {
          temp = block
          break
        }
      }
      return (temp.y + 1) * this.handleGetBlockSize(temp, block_size).height
    }
  }
}
