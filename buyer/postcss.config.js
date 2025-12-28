// 暂时性创建此文件
// 用于忽略swiper引入的css报错

module.exports = {
  plugins: {
    'postcss-cssnext': {
      features: {
        customProperties: false
      }
    }
  }
}
