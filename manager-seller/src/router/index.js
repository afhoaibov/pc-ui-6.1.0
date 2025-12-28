import Vue from 'vue'
import Router from 'vue-router'
/* Layout */
import Layout from '@/views/layout/Layout'
const alias = require('ui-domain/alias')

const routerPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error => error)
}

Vue.use(Router)

export const constantRouterMap = [
  { path: '/404', component: () => import('@/views/errorPage/404'), hidden: true },
  { path: '/login', component: () => import('@/views/login/login'), hidden: true },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [{
      path: 'dashboard',
      component: () => import('@/views/dashboard/index'),
      name: 'dashboard',
      meta: { title: 'dashboard', icon: 'dashboard' }
    }]
  }
]

// 直播管理
const liveRouterMap = {
  path: '/live-video',
  component: Layout,
  redirect: '/live-video/live-video-list',
  name: 'liveVideo',
  meta: { title: 'liveVideo', icon: 'live-manage' },
  children: [
    { path: 'live-video-list', component: () => import('@/views/live-video/liveVideoList'), name: 'liveVideoList', meta: { title: 'liveVideoList' }},
    { path: 'live-video-goods-list', component: () => import('@/views/live-video/liveVideoGoodsList'), name: 'liveVideoGoodsList', meta: { title: 'liveVideoGoodsList' }},
    { path: 'edit-live-video-goods/:room_id', component: () => import('@/views/live-video/editLiveVideoGoods'), name: 'editLiveVideoGoods', hidden: true, meta: { title: 'editLiveVideoGoods' }}
  ]
}

// 运费设置(o2o相关)
const freightRouterMap = {
  path: 'freight-setting',
  component: () => import('@/views/setting/freightSettings'),
  name: 'freightSettings',
  meta: { title: 'freightSettings' }
}

// 促销管理(o2o相关)
const promotionsRouterMap = [
  { path: 'gift-manager', component: () => import('@/views/promotions/giftManager'), name: 'giftManager', meta: { title: 'giftManager' }},
  { path: 'single-cut', component: () => import('@/views/promotions/singleCut'), name: 'singleCut', meta: { title: 'singleCut' }},
  { path: 'second-half-price', component: () => import('@/views/promotions/secondHalfPrice'), name: 'secondHalfPrice', meta: { title: 'secondHalfPrice' }},
  { path: 'time-limit', component: () => import('@/views/promotions/timeLimit'), name: 'timeLimit', meta: { title: 'timeLimit' }},
  { path: 'add-time-limit/:id', component: () => import('@/views/promotions/addTimeLimit'), name: 'addTimeLimit', meta: { title: 'addTimeLimit', noCache: true }, hidden: true },
  { path: 'activity-goods-data/:id', component: () => import('@/views/promotions/activityGoodsData'), name: 'activityGoodsData', meta: { title: 'activityGoodsData' }, hidden: true },
  { path: 'assembleManager', component: () => import('@/views/promotions/assembleManager'), name: 'assembleManager', meta: { title: 'assembleManager' }},
  { path: 'addAssemble/:promotion_id?', component: () => import('@/views/promotions/assemble'), name: 'addAssemble', meta: { title: 'addAssemble' }, hidden: true },
  { path: 'editAssemble/:promotion_id?', component: () => import('@/views/promotions/assemble'), name: 'editAssemble', meta: { title: 'editAssemble' }, hidden: true },
  { path: 'viewAssemble/:promotion_id?', component: () => import('@/views/promotions/assemble'), name: 'viewAssemble', meta: { title: 'viewAssemble' }, hidden: true },
  { path: 'assembleGoods/:promotion_id', component: () => import('@/views/promotions/assembleGoods'), name: 'assembleGoods', meta: { title: 'assembleGoods' }, hidden: true }
// { path: 'group-buy-manager', component: () => import('@/views/promotions/groupBuyManager'), name: 'groupBuyManager', meta: { title: 'groupBuyManager' }},
// { path: 'group-buy-goods/:goods_id?', component: () => import('@/views/promotions/groupBuyGoods'), name: 'groupBuyGoods', meta: { title: 'groupBuyGoods' }, hidden: true },
]

// 供应商相关功能
const supplierRouterMap = {
  path: 'agent-supply-goods',
  component: () => import('@/views/goods/agentSupplyGoods'),
  name: 'agentSupplyGoods',
  meta: { title: 'agentSupplyGoods' }
}

// IM功能
const chatRouter = { path: '/chat', component: () => import('@/views/chat/chat'), name: 'chat' }

export const asyncRouterMap = [
  // 供应商相关功能
  process.env.SUPPLYGOOD ? supplierRouterMap : undefined,
  // 商品管理
  {
    path: '/goods',
    component: Layout,
    redirect: '/goods/goods-list',
    name: 'goods',
    meta: {
      title: 'goods',
      icon: 'goods-manage'
    },
    children: [
      { path: 'goods-list', component: () => import('@/views/goods/goodsList'), name: 'goodsList', meta: { title: 'goodsList' }},
      { path: 'auth-goods-list', component: () => import('@/views/goods/authGoodsList'), name: 'authGoodsList', meta: { title: 'authGoodsList' }},
      { path: 'draft-list', component: () => import('@/views/goods/draftList'), name: 'draftList', meta: { title: 'draftList' }},
      { path: 'spec-manage', component: () => import('@/views/goods/specManage'), name: 'specManage', meta: { title: 'specManage' }},
      { path: 'category-manage', component: () => import('@/views/goods/categoryManage'), name: 'categoryManage', meta: { title: 'categoryManage' }},
      { path: 'tag-manage', component: () => import('@/views/goods/tagManage'), name: 'tagManage', meta: { title: 'tagManage' }},
      { path: 'tag-add/:tag_id', component: () => import('@/views/goods/tagAdd'), name: 'tagAdd', meta: { title: 'tagAdd' }, hidden: true },
      { path: 'recycle-station', component: () => import('@/views/goods/recycleStation'), name: 'recycleStation', meta: { title: 'recycleStation' }},
      { path: 'understock', component: () => import('@/views/goods/understock'), name: 'understock', meta: { title: 'understock' }},
      { path: 'good-publish/:goodsid?/:isdraft?', component: () => import('@/views/goods/goodsPublish'), name: 'goodPublish', meta: { title: 'goodPublish', noCache: true }, hidden: true },
      { path: 'good-sku/:goodsid?', component: () => import('@/views/goods/goodsSku'), name: 'goodsSku', meta: { title: 'goodsSku', noCache: true }, hidden: true },
      { path: 'distribution-goods-list', component: () => import('@/views/goods/distributionGoodsList'), name: 'distributionGoodsList', meta: { title: 'distributionGoodsList' }},
      {
        path: 'import',
        component: () => import('@/views/goods/importManage/index'),
        name: 'import',
        redirect: 'spu-import',
        meta: { title: 'import', noCache: false },
        children: [
          { path: 'spu-import', component: () => import('@/views/goods/importManage/spuImport'), name: 'spuImport', meta: { title: 'spuImport', noCache: false }},
          { path: 'sku-import', component: () => import('@/views/goods/importManage/skuImport'), name: 'skuImport', meta: { title: 'skuImport', noCache: false }},
          { path: 'parameter-import', component: () => import('@/views/goods/importManage/parameterImport'), name: 'parameterImport', meta: { title: 'parameterImport', noCache: false }},
          { path: 'goods-image-import', component: () => import('@/views/goods/importManage/goodsImageImport'), name: 'goodsImageImport', meta: { title: 'goodsImageImport', noCache: false }},
          { path: 'goods-info-import', component: () => import('@/views/goods/importManage/goodsInfoImport'), name: 'goodsInfoImport', meta: { title: 'goodsInfoImport', noCache: false }}
        ]
      }
    ]
  },
  // 订单管理
  {
    path: '/order',
    component: Layout,
    name: 'order',
    redirect: '/order/order-list',
    meta: { title: 'order', icon: 'order-manage' },
    children: [
      { path: 'order-list', component: () => import('@/views/order/orderList'), name: 'orderList', meta: { title: 'orderList' }},
      { path: 'detail/:sn', component: () => import('@/views/order/orderDetail'), name: 'orderDetail', hidden: true, meta: { title: 'orderDetail' }},
      { path: 'order-delivery', component: () => import('@/views/order/orderDelivery'), name: 'orderDelivery', hidden: true, meta: { title: 'orderDelivery' }},
      { path: 'complaint-detail/:id', component: () => import('@/views/order/complaintDetail'), name: 'complaintDetail', hidden: true, meta: { title: 'complaintDetail' }},
      { path: 'comments-manage', component: () => import('@/views/order/commentsManage'), name: 'commentsManage', meta: { title: 'commentsManage' }},
      { path: 'settlement-manage', component: () => import('@/views/order/settlementManage'), name: 'settlementManage', meta: { title: 'settlementManage' }},
      { path: 'settlement-detail/:sn', component: () => import('@/views/order/settlementDetail'), name: 'settlementDetail', meta: { title: 'settlementDetail' }, hidden: true },
      { path: 'receipt-history', component: () => import('@/views/order/receiptHistory'), name: 'receiptHistory', meta: { title: 'receiptHistory' }},
      { path: 'receipt-detail/:history_id', component: () => import('@/views/order/receiptDetail'), name: 'receiptDetail', hidden: true, meta: { title: 'receiptDetail' }},

    ]
  },
  // 店铺装修
  {
    path: '/shop',
    component: Layout,
    redirect: '/shop/mobile-pages',
    name: 'shop',
    meta: { title: 'decoration', icon: 'shop-manage' },
    children: [
      { path: 'pc-pages', component: () => import('@/views/shop/pcPages'), name: 'pcPages', meta: { title: 'pcPages' }},
      { path: 'mobile-pages', component: () => import('@/views/shop/mobilePages'), name: 'mobilePages', meta: { title: 'mobilePages' }},
      { path: 'shop-nav', component: () => import('@/views/shop/shopNav'), name: 'shopNav', meta: { title: 'shopNav' }}
    ]
  },
  // 促销管理
  {
    path: '/promotions',
    component: Layout,
    redirect: '/promotions/full-cut',
    name: 'promotions',
    meta: { title: 'promotions', icon: 'promotions-manage' },
    children: [
      { path: 'full-cut', component: () => import('@/views/promotions/fullCut'), name: 'fullCut', meta: { title: 'fullCut' }},
      { path: 'addFullCut', component: () => import('@/views/promotions/addFullCut'), name: 'addFullCut', meta: { title: 'addFullCut' }, hidden: true },
      { path: 'editFullCut/:promotion_id', component: () => import('@/views/promotions/addFullCut'), name: 'editFullCut', meta: { title: 'editFullCut' }, hidden: true },
      { path: 'checkFullDetail/:promotion_id', component: () => import('@/views/promotions/addFullCut'), name: 'checkFullDetail', meta: { title: 'checkFullDetail' }, hidden: true },
      { path: 'full-give', component: () => import('@/views/promotions/fullGive'), name: 'fullGive', meta: { title: 'fullGive' }},
      { path: 'addFullGive', component: () => import('@/views/promotions/addFullGive'), name: 'addFullGive', meta: { title: 'addFullGive' }, hidden: true },
      { path: 'editFullGive/:promotion_id', component: () => import('@/views/promotions/addFullGive'), name: 'editFullGive', meta: { title: 'editFullGive' }, hidden: true },
      { path: 'checkFullGiveDetail/:promotion_id', component: () => import('@/views/promotions/addFullGive'), name: 'checkFullGiveDetail', meta: { title: 'checkFullGiveDetail' }, hidden: true },
      { path: 'discount-manager', component: () => import('@/views/promotions/discountManager'), name: 'discountManager', meta: { title: 'discountManager' }},
      { path: 'receive-list/:id', component: () => import('@/views/promotions/receiveList'), name: 'receiveList', hidden: true, meta: { title: 'receiveList' }}
    ]
  },
  process.env.LIVEVIDEO ? liveRouterMap : undefined,
  // 售前售后
  {
    path: '/customer',
    component: Layout,
    redirect: '/customer/consultation',
    name: 'customer',
    meta: { title: 'customer', icon: 'user' },
    children: [
      { path: 'consultation', component: () => import('@/views/customer-service/consultation'), name: 'consultation', meta: { title: 'consultation' }},
      { path: 'message', component: () => import('@/views/customer-service/message'), name: 'message', meta: { title: 'message' }},
      { path: 'consultationDetail/:askId', component: () => import('@/views/customer-service/consultationDetail'), name: 'consultationDetail', hidden: true, meta: { title: 'consultationDetail' }},
      { path: 'complaint-list', component: () => import('@/views/order/complaintList'), name: 'complaintList', meta: { title: 'complaintList' }},
      { path: 'complaint-detail/:id', component: () => import('@/views/order/complaintDetail'), name: 'complaintDetail', hidden: true, meta: { title: 'complaintDetail' }},
      {
        path: '/order/after-sale',
        component: () => import('@/views/order/afterSale/index'),
        redirect: '/order/after-sale/service-list',
        name: 'afterSale',
        meta: { title: 'afterSale' },
        children: [
          { path: 'service-list', component: () => import('@/views/order/afterSale/serviceList'), name: 'serviceList', meta: { title: 'serviceList' }},
          { path: 'service-detail/:service_sn', component: () => import('@/views/order/afterSale/serviceDetail'), name: 'serviceDetail', hidden: true, meta: { title: 'serviceDetail' }},
          { path: 'refund-list', component: () => import('@/views/order/afterSale/refundList'), name: 'refundList', meta: { title: 'refundList' }}
        ]
      }
    ]
  },
  // 统计
  {
    path: '/statistics',
    component: Layout,
    redirect: '/statistics/generality-overview',
    name: 'statistics',
    meta: { title: 'statistics', icon: 'statistics-manage' },
    children: [
      { path: 'generality-overview', component: () => import('@/views/statistics/generalityOverview'), name: 'generalityOverview', meta: { title: 'generalityOverview' }},
      {
        path: '/statistics/goods-analysis',
        component: () => import('@/views/statistics/goodsAnalysis/index'),
        redirect: '/statistics/goods-analysis/goods-details',
        name: 'goodsAnalysis',
        meta: { title: 'goodsAnalysis' },
        children: [
          { path: 'goods-details', component: () => import('@/views/statistics/goodsAnalysis/goodsDetailsAnalysis'), name: 'goodsDetailsAnalysis', meta: { title: 'goodsDetailsAnalysis' }},
          { path: 'price-sales', component: () => import('@/views/statistics/goodsAnalysis/goodsPriceSales'), name: 'goodsPriceSales', meta: { title: 'goodsPriceSales' }},
          { path: 'hot-selling-goods', component: () => import('@/views/statistics/goodsAnalysis/hotSellingGoods'), name: 'hotSellingGoods', meta: { title: 'hotSellingGoods' }}
        ]
      },
      {
        path: '/statistics/operate-report',
        component: () => import('@/views/statistics/operateReport/index'),
        redirect: '/statistics/operate-report/regional-analysis',
        name: 'operateReport',
        meta: { title: 'operateReport' },
        children: [
          !process.env.I18N && { path: 'regional-analysis', component: () => import('@/views/statistics/operateReport/regionalAnalysis'), name: 'regionalAnalysis', meta: { title: 'regionalAnalysis' }},
          { path: 'sales-statistics', component: () => import('@/views/statistics/operateReport/salesStatistics'), name: 'salesStatistics', meta: { title: 'salesStatistics' }},
          { path: 'buy-analysis', component: () => import('@/views/statistics/operateReport/buyAnalysis'), name: 'buyAnalysis', meta: { title: 'buyAnalysis' }}
        ].filter(item => !!item)
      },
      { path: 'traffic-statistics', component: () => import('@/views/statistics/trafficStatistics'), name: 'trafficStatistics', meta: { title: 'trafficStatistics' }},
      { path: 'collect-statistics', component: () => import('@/views/statistics/collectStatistics'), name: 'collectStatistics', meta: { title: 'collectStatistics' }},
      { path: 'log-manage', component: () => import('@/views/statistics/logManage'), name: 'logManage', meta: { title: 'logManage' }, hidden: true }
    ]
  },
  // 后台任务
  {
    path: '/backstage-task',
    component: Layout,
    redirect: '/backstage-task/derive-record',
    name: 'backstageTask',
    meta: { title: 'backstageTask', icon: 'documentation' },
    children: [
      { path: 'derive-record', component: () => import('@/views/backstageTask/deriveRecord'), name: 'deriveRecord', meta: { title: 'deriveRecord' }},
      { path: 'import-record', component: () => import('@/views/backstageTask/importRecord'), name: 'importRecord', meta: { title: 'importRecord' }}
    ]
  },
  // 设置
  {
    path: '/setting',
    component: Layout,
    redirect: '/setting/shop-setting',
    name: 'setting',
    meta: { title: 'setting', icon: 'setting-manage' },
    children: [
      { path: 'shop-setting', component: () => import('@/views/setting/shopEdit'), name: 'shopSettings', meta: { title: 'shopSettings' }},
      { path: 'shop-security-deposit', component: () => import('@/views/setting/shopSecurityDeposit'), name: 'shopSecurityDeposit', meta: { title: 'shopSecurityDeposit' }},
      { path: 'goods-warning', component: () => import('@/views/setting/goodsWarning'), name: 'goodsWarning', meta: { title: 'goodsWarning' }},
      { path: 'grade-application', component: () => import('@/views/setting/gradeApplication'), name: 'gradeApplication', meta: { title: 'gradeApplication' }, hidden: true },
      { path: 'invoice-settings', component: () => import('@/views/setting/invoiceSettings'), name: 'invoiceSettings', meta: { title: 'invoiceSettings' }},
      { path: 'logistics-manage', component: () => import('@/views/setting/logisticsManage/index'), name: 'logisticsManage', meta: { title: 'logisticsManage' }},
      { path: 'password-settings', component: () => import('@/views/setting/passwordSettings'), name: 'passwordSettings', meta: { title: 'passwordSettings' }},
      {
        path: '/shop-auth',
        component: () => import('@/views/order/afterSale/index'),
        redirect: '/shop-auth/shop-assistant',
        name: 'shopAuth',
        meta: { title: 'shopAuth' },
        children: [
          { path: 'shop-assistant', component: () => import('@/views/shop-auth/shopAssistant'), name: 'shopAssistant', meta: { title: 'shopAssistant' }},
          { path: 'role-manage', component: () => import('@/views/shop-auth/roleManage'), name: 'roleManage', meta: { title: 'roleManage' }},
          { path: 'role-permission/:id(\\d+)', component: () => import('@/views/shop-auth/rolePermission'), name: 'rolePermission', hidden: true, meta: { title: 'rolePermission', noCache: true }}

        ]
      },
      {
        path: 'material-manage',
        component: () => import('@/views/setting/materialManage/index'),
        name: 'materialManage',
        redirect: '/setting/material-manage/picture-space',
        meta: { title: 'materialManage' },
        children: [
          { path: 'picture-space', component: () => import('@/views/setting/materialManage/pictureSpace'), name: 'pictureSpace', meta: { title: 'pictureSpace' }},
          { path: 'video-space', component: () => import('@/views/setting/materialManage/videoSpace'), name: 'videoSpace', meta: { title: 'videoSpace' }}
        ]
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true },
  process.env.IM ? chatRouter : undefined
].filter(item => !!item)

const router = new Router({
  mode: 'history',
  base: alias.seller ? `/${alias.seller}/` : undefined,
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export default router

// 开启O2O时，设置运费设置显示位置
if (process.env.O2O) {
  asyncRouterMap.find(item => item.name === 'setting').children.push(freightRouterMap)
}

// 设置促销活动显示位置
if (!process.env.O2O) {
  asyncRouterMap.find(item => item.name === 'promotions').children.push(...promotionsRouterMap)
}

