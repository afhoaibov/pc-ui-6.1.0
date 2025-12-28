const urlParams = new URLSearchParams(window.location.search)

// 装修类型
export const decorType = urlParams.get('decor_type')
// 客户端类型
export const clientType = urlParams.get('client_type')
