import request from '@/utils/request'
import { api } from '~/ui-domain'

/**
 * 获取店铺详情
 * @param shop_id
 * @returns {AxiosPromise<any>|Promise<unknown>|*}
 */
export function getShopDetail(shop_id) {
  return request({
    url: `${api.buyer}/buyer/shops/${shop_id}`,
    method: 'get',
    loading: false
  })
}
