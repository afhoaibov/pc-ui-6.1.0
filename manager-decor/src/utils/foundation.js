import lodash from 'lodash'
import { v4 as uuidv4 } from 'uuid'

/**
 * 深拷贝
 * @type {(function(*): *)|*}
 */
export const cloneDeep = lodash.cloneDeep

/**
 * 生成唯一ID
 * @type {(prefix?: string) => string}
 */
export const uniqueId = lodash.uniqueId

/**
 * 获取一个UUID
 * @type {(function(*=, *=, *=): (*))|*}
 */
export const uuid = uuidv4

/**
 * 获取随机图片
 * @returns {string}
 */
export function getRandomImage(width = 200, height = 200) {
  return `https://source.unsplash.com/random/${width}x${height}?t=${new Date().getTime()}`
}

/**
 * 获取视频第一帧封面
 * @param src
 * @returns {Promise<unknown>}
 */
export function getVideoCover(src) {
  return new Promise((resolve, reject) => {
    try {
      let dataURL = ''
      let video = document.createElement('video')
      video.crossOrigin = 'anonymous'
      video.src = src
      video.onloadeddata = function () {
        video.currentTime = 2
      }
      video.onseeked = function () {
        let canvas = document.createElement('canvas')
        let width = video.videoWidth
        let height = video.videoHeight
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(video, 0, 0, width, height)
        dataURL = canvas.toDataURL('image/png', 0.3)
        resolve(dataURL)
        video = null
        canvas = null
      }
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * 获取页面传参
 * @param key
 * @returns {string}
 */
export function getURLSearchParma(key) {
  return (new URLSearchParams(location.search)).get(key)
}

/**
 * 获取对象中key所在路径数组
 * @param obj
 * @param config
 * @returns {*[]}
 */
export function getPaths(obj, config) {
  config = config || {}
  let separator = config.separator || '.'
  let property = config.property
  let paths = []
  function getPath (o, prevPath) {
    if (typeof o === 'object') {
      for (let i in o) {
        let currentPath = prevPath ? [prevPath, i].join(separator) : i
        if (!!property && i === property) {
          paths.push(currentPath)
        } else if (!property) {
          paths.push(currentPath)
        }
        if (typeof o[i] === 'object') {
          getPath(o[i], currentPath)
        }
      }
    }
  }
  getPath(obj)
  return paths
}
