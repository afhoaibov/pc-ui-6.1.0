const fse = require('fs-extra')
const chokidar = require('chokidar')

const watchDirs = ['../ui-components', '../ui-domain', '../ui-utils', '../ui-websocket']

chokidar.watch(watchDirs).on('all', (event, path) => {
  const dest = './node_modules' + path.split('..')[1]
  if (event.indexOf('unlink') !== -1) {
    fse.remove(dest)
  } else {
    fse.copySync(path, dest)
  }
}).on('ready', () => {
  console.log('目录：' + watchDirs.join(' | ') + ' 正在监听中...')
})
