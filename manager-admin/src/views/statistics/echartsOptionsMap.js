const otherKeys = {
  '内蒙古自治区': '内蒙古',
  '广西壮族自治区': '广西',
  '西藏自治区': '西藏',
  '宁夏回族自治区': '宁夏',
  '新疆维吾尔自治区': '新疆',
  '香港特别行政区': '香港',
  '澳门特别行政区': '澳门'
}

export default function(options) {
  options.seriesData = (options.seriesData || []).map(item => {
    item.name = item.name.replace('省', '').replace('市', '')
    if (otherKeys[item.name]) {
      item.name = otherKeys[item.name]
    }
    return item
  })
  if (!options.seriesData.find(item => item.name === '南海诸岛')) {
    options.seriesData.push({ name: '南海诸岛', value: 0 })
  }
  const maxValue = Math.max(...options.seriesData.map(item => item.value))
  return {
    title: {
      text: options.titleText || '区域分析',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      show: true,
      formatter: function(params, ticket, callback) {
        return params.data.name + '<br>' + params.seriesName + '：' + params.data.value
      }
    },
    visualMap: {
      min: 0,
      max: maxValue,
      left: 'right',
      text: ['高', '低'],
      calculable: true,
      inRange: {
        color: [
          '#eeeeee',
          '#e0f3f8',
          '#ffffbf',
          '#fee090',
          '#fdae61',
          '#f46d43',
          '#d73027'
        ]
      }
    },
    toolbox: {
      show: true,
      orient: 'vertical',
      right: 10,
      top: 'center',
      feature: {
        dataView: {
          readOnly: true,
          optionToContent: function(opt) {
            const data = opt.series[0].data
            let table = '<table style="width:100%;text-align:center;font-size=14px;"><tbody><tr>' + '<td>' + '地区' + '</td>' + '<td>' + opt.series[0].name + '</td>' + '</tr>'
            for (let i = 0, l = data.length; i < l; i++) {
              if (data[i].value === undefined) {
                break
              }
              table += '<tr style="color: #666;">' + '<td>' + data[i].name + '</td>' + '<td>' + data[i].value + '</td>' + '</tr>'
            }
            table += '</tbody></table>'
            return table
          }
        }
      }
    },
    series: [
      {
        type: 'map',
        mapType: 'china',
        roam: false,
        name: options.seriesName || '数量',
        label: {
          normal: {
            show: true
          },
          emphasis: {
            show: true
          }
        },
        data: options.seriesData || []
      }
    ]
  }
}
