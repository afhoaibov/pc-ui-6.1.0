/**
 * 资源路径配置文件, 例如配置:
 * <br>buyer : 'https://cdn.com/buyer/',
 * <br>seller: 'https://cdn.com/seller/',
 * <br>admin : 'https://cdn.com/admin/',
 * <br>decor : 'https://cdn.com/decor/'
 * <br>不开启则留空字符串即可 | 注意，只在打包后的代码中生效
 */

let envString = process.env.NODE_ENV

// 生产环境
const production = {
  buyer : '',
  seller: '',
  admin : '',
  decor : ''
}

// 测试环境
const test = {
  buyer : '',
  seller: '',
  admin : '',
  decor : ''
}

let alias = {}
if (envString === 'test') {
  alias = test
} else if (envString === 'production') {
  alias = production
}

module.exports = alias
