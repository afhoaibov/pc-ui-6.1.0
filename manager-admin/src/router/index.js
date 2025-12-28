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

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
    noCache: true                if true ,the page will no be cached(default is false)
  }
**/
export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/404', component: () => import('@/views/errorPage/404'), hidden: true },
  { path: '/401', component: () => import('@/views/errorPage/401'), hidden: true },
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

const router = new Router({
  mode: 'history',
  base: alias.admin ? `/${alias.admin}/` : undefined,
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export default router

// 分销
const disRouterMap = {
  path: '/distribution',
  component: Layout,
  redirect: '/distribution/distributor-list',
  name: 'distribution',
  meta: { title: 'distribution', icon: 'development-manage' },
  children: [
    { path: 'distributor-list', component: () => import('@/views/distribution/distributor/distributorList'), name: 'distributorList', meta: { title: 'distributorList' }},
    { path: 'distributor-message', component: () => import('@/views/distribution/distributor/distributorMessage'), name: 'distributorMessage', meta: { title: 'distributorMessage' }},
    { path: 'distributor-order', component: () => import('@/views/distribution/distributor/distributorOrder'), name: 'distributorOrder', meta: { title: 'distributorOrder' }},
    { path: 'brokerage-detail', component: () => import('@/views/distribution/distributor/brokerageDetail'), name: 'brokerageDetail', meta: { title: 'brokerageDetail' }},
    { path: 'distributor-detail/:member_id', component: () => import('@/views/distribution/distributor/distributorDetail'), name: 'distributorDetail', meta: { title: 'distributorDetail' }, hidden: true },
    { path: 'bill-list', component: () => import('@/views/distribution/achievement/billList'), name: 'billList', meta: { title: 'billList' }, hidden: true },
    { path: 'bill-details/:bill_id/:member_id', component: () => import('@/views/distribution/achievement/billDetails'), name: 'billDetails', meta: { title: 'billDetails' }, hidden: true },
    { path: 'put-forward-apply', component: () => import('@/views/distribution/distributor/putforwardApply'), name: 'putforwardApply', meta: { title: 'putforwardApply' }}
  ]
}

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

// 商品设置
const goodsSettingRouterMap = {
  path: '/goods/goods-setting',
  component: () => import('@/views/goods/goods-setting/index'),
  redirect: '/goods/goods-setting/category-list',
  name: 'goodsSetting',
  meta: { title: 'goodsSetting' },
  children: [
    { path: 'category-list', component: () => import('@/views/goods/goods-setting/categoryList'), name: 'categoryList', meta: { title: 'categoryList' }},
    { path: 'category-params/:id', component: () => import('@/views/goods/goods-setting/categoryParams'), name: 'categoryParams', hidden: true, meta: { title: 'categoryParams', noCache: true }},
    { path: 'brand-list', component: () => import('@/views/goods/goods-setting/brandList'), name: 'brandList', meta: { title: 'brandList' }}
  ]
}

// 意见反馈
const feedbackRouterMap = {
  path: 'feedback-list',
  component: () => import('@/views/member/member-feedback/feedbackList'),
  name: 'memberFeedback',
  meta: { title: 'memberFeedback' }
}

// 商品分类
const goodsCategoryRouterMap = {
  path: 'goods-category',
  component: () => import('@/views/goods/goodsCategory'),
  name: 'goodsCategory',
  meta: { title: 'goodsCategory' }
}
// 团购管理
// const groupBuyRouterMap = {
//   path: '/promotions/group-buy-manage',
//   component: () => import('@/views/promotions/group-buy-manage/index'),
//   redirect: '/promotions/group-buy-manage/group-buy-list',
//   name: 'groupBuyManage',
//   meta: { title: 'groupBuyManage' },
//   children: [
//     { path: 'group-buy-list', component: () => import('@/views/promotions/group-buy-manage/groupBuyList'), name: 'groupBuyList', meta: { title: 'groupBuyList' }},
//     { path: 'group-buy-category', component: () => import('@/views/promotions/group-buy-manage/groupBuyCategory'), name: 'groupBuyCategory', meta: { title: 'groupBuyCategory' }},
//     { path: 'group-buy-goods/:id', component: () => import('@/views/promotions/group-buy-manage/groupBuyGoods'), name: 'groupBuyGoods', hidden: true, meta: { title: 'groupBuyGoods' }},
//     { path: 'group-buy-goods-info/:id', component: () => import('@/views/promotions/group-buy-manage/groupBuyGoodsInfo'), name: 'groupBuyGoodsInfo', hidden: true, meta: { title: 'groupBuyGoodsInfo' }}
//   ]
// }

// 限时抢购、拼团活动
const seckillAssembleRouterMap = [
  { path: 'seckill-list', component: () => import('@/views/promotions/seckill-manage/seckillList'), name: 'seckillList', meta: { title: 'seckillList' }},
  { path: 'seckill-list/audit/:id', component: () => import('@/views/promotions/seckill-manage/seckillAuditGoodsList'), name: 'seckillAuditGoodsList', hidden: true, meta: { title: 'seckillAuditGoodsList', noCache: true }},
  { path: 'seckill-list/pass/:id', component: () => import('@/views/promotions/seckill-manage/seckillPassGoodsList'), name: 'seckillPassGoodsList', hidden: true, meta: { title: 'seckillPassGoodsList', noCache: true }},
  { path: 'assemble-list', component: () => import('@/views/promotions/assemble-manage/assembleList'), name: 'assembleList', meta: { title: 'assembleList' }},
  { path: 'assemble-detail/:promotion_id', component: () => import('@/views/promotions/assemble-manage/assembleDetail'), name: 'assembleDetail', hidden: true, meta: { title: 'assembleDetail', noCache: true }}
]

const asyncRouters = [
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
      { path: 'goods-audit', component: () => import('@/views/goods/goodsAudit'), name: 'goodsAudit', meta: { title: 'goodsAudit' }}
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
      { path: 'detail/:sn', component: () => import('@/views/order/orderDetail'), name: 'orderDetail', hidden: true, meta: { title: 'orderDetail' }}
    ]
  },
  // 会员管理
  {
    path: '/member',
    component: Layout,
    redirect: '/member/member-list',
    name: 'member',
    meta: { title: 'member', icon: 'member-manage' },
    children: [
      { path: 'member-top-up', component: () => import('@/views/member/member-manage/memberTopUp'), name: 'memberTopUp', meta: { title: 'memberTopUp' }, hidden: true },
      { path: 'member-list', component: () => import('@/views/member/member-manage/memberList'), name: 'memberList', meta: { title: 'memberList' }},
      { path: 'member-recycle', component: () => import('@/views/member/member-manage/memberRecycle'), name: 'memberRecycle', meta: { title: 'memberRecycle' }},
      { path: 'edit/:id', component: () => import('@/views/member/member-manage/memberEdit'), name: 'memberEdit', hidden: true, meta: { title: 'memberEdit' }},
      { path: 'member-level', component: () => import('@/views/member/member-level/memberLevel'), name: 'memberLevel', meta: { title: 'memberLevel' }},
      { path: 'member-level-add', component: () => import('@/views/member/member-level/memberLevelAdd'), name: 'memberLevelAdd', hidden: true, meta: { title: 'memberLevelAdd' }},
      { path: 'member-level-edit/:id', component: () => import('@/views/member/member-level/memberLevelAdd'), name: 'memberLevelEdit', hidden: true, meta: { title: 'memberLevelEdit' }}
    ]
  },
  // 店铺管理
  {
    path: '/shop',
    component: Layout,
    redirect: '/shop/shop-list',
    name: 'shop',
    meta: { title: 'shop', icon: 'shop-manage' },
    children: [
      { path: 'shop-list', component: () => import('@/views/shop/shop-manage/shopList'), name: 'shopList', meta: { title: 'shopList' }},
      { path: 'shop-audit', component: () => import('@/views/shop/shop-manage/shopAudit'), name: 'shopAudit', meta: { title: 'shopAudit' }},
      { path: 'edit/:id', component: () => import('@/views/shop/shop-manage/shopEdit'), name: 'shopEdit', hidden: true, meta: { title: 'shopEdit', noCache: true }},
      { path: 'shop-add', component: () => import('@/views/shop/shop-manage/shopAdd'), name: 'shopAdd', meta: { title: 'shopAdd', noCache: true }, hidden: true },
    ]
  },
  // 促销管理
  {
    path: '/promotions',
    component: Layout,
    redirect: '/promotions/coupon-list',
    name: 'promotions',
    meta: { title: 'promotions', icon: 'promotions-manage' },
    children: [
      { path: 'coupon-list', component: () => import('@/views/promotions/coupon-manage/couponList'), name: 'couponList', meta: { title: 'couponList' }},
      { path: 'coupon', component: () => import('@/views/promotions/coupon-manage/coupon'), name: 'coupon', meta: { title: 'coupon' }, hidden: true },
      { path: 'couponUpdate', component: () => import('@/views/promotions/coupon-manage/coupon'), name: 'couponUpdate', meta: { title: 'couponUpdate' }, hidden: true },
      { path: 'receive-list/:id', component: () => import('@/views/promotions/coupon-manage/ReceiveList'), name: 'ReceiveList', hidden: true, meta: { title: 'ReceiveList' }}
    ]
  },
  // 售前售后
  {
    path: '/sale',
    component: Layout,
    redirect: '/sale/goods-ask-list',
    name: 'sale',
    meta: { title: 'sale', icon: 'user' },
    children: [
      { path: 'goods-ask-list', component: () => import('@/views/member/goods-comment/goodsAskList'), name: 'goodsAskList', meta: { title: 'goodsAskList' }},
      { path: 'ask-detail/:askId', component: () => import('@/views/member/goods-comment/askDetail'), name: 'askDetail', hidden: true, meta: { title: 'askDetail' }},
      { path: 'goods-comment-list', component: () => import('@/views/member/goods-comment/goodsCommentList'), name: 'goodsCommentList', meta: { title: 'goodsCommentList' }},
      { path: 'service-list', component: () => import('@/views/order/serviceList'), name: 'serviceList', meta: { title: 'serviceList' }},
      {
        path: '/order/complaint',
        component: () => import('@/views/order/complaint/index'),
        redirect: '/order/complaint/complaint-list',
        name: 'complaint',
        meta: { title: 'complaint' },
        children: [
          { path: 'complaint-list', component: () => import('@/views/order/complaint/complaintList'), name: 'complaintList', meta: { title: 'complaintList' }},
          { path: 'complaint-detail/:id', component: () => import('@/views/order/complaint/complaintDetail'), name: 'complaintDetail', hidden: true, meta: { title: 'complaintDetail' }},
          { path: 'subject-list', component: () => import('@/views/order/complaint/subjectList'), name: 'subjectList', meta: { title: 'subjectList' }}
        ]
      },
      { path: 'notification-history', component: () => import('@/views/member/member-notification/notificationHistory'), name: 'notificationHistory', meta: { title: 'notificationHistory' }}
    ]
  },
  // 财务
  {
    path: '/finance',
    component: Layout,
    redirect: '/finance/goods-ask-list',
    name: 'finance',
    meta: { title: 'finance', icon: 'user' },
    children: [
      { path: 'settlement', component: () => import('@/views/finance/settlement-manage/settlementList'), name: 'settlement', meta: { title: 'settlement' }},
      { path: 'collection-list', component: () => import('@/views/finance/collectionList.vue'), name: 'collectionList', meta: { title: 'collectionList' }},
      { path: 'refund-list', component: () => import('@/views/finance/refundList.vue'), name: 'refundList', meta: { title: 'refundList' }},
      { path: 'service-detail/:service_sn', component: () => import('@/views/finance/serviceDetail.vue'), name: 'serviceDetail', hidden: true, meta: { title: 'serviceDetail' }},
      { path: 'detail/:id', component: () => import('@/views/finance/settlement-manage/settlementDetail'), name: 'settlementDetail', hidden: true, meta: { title: 'settlementDetail' }},
      { path: 'preDeposit', component: () => import('@/views/finance/pre-deposit/rechargeList'), name: 'rechargeList', meta: { title: 'preDeposit' }},
      {
        path: '/shop-manage/examine-list',
        component: () => import('@/views/finance/earnestMoney/index'),
        redirect: '/earnestMoney/examineList',
        name: 'earnestMoney',
        meta: { title: 'earnestMoney' },
        children: [
          { path: 'examine-list', component: () => import('@/views/finance/earnestMoney/examineList'), name: 'examineList', meta: { title: 'examineList' }},
          { path: 'commit-record', component: () => import('@/views/finance/earnestMoney/commitRecord'), name: 'commitRecord', meta: { title: 'commitRecord' }}
        ]
      },
      { path: 'receipt-examine', component: () => import('@/views/finance/receiptExamine'), name: 'receiptExamine', meta: { title: 'receiptExamine' }},
      { path: 'receipt-history', component: () => import('@/views/finance/receiptHistory'), name: 'receiptHistory', meta: { title: 'receiptHistory' }},
      { path: 'receipt-detail/:id', component: () => import('@/views/finance/receiptDetail'), name: 'receiptDetail', hidden: true, meta: { title: 'receiptDetail' }},

    ]
  },
  {
    path: '/statistics',
    component: Layout,
    redirect: '/statistics/member-analysis/order-amount',
    name: 'statistics',
    meta: { title: 'statistics', icon: 'statistics-manage' },
    children: [
      {
        path: '/statistics/member-analysis',
        component: () => import('@/views/statistics/member-analysis/index'),
        redirect: '/statistics/member-analysis/order-amount',
        name: 'memberAnalysis',
        meta: { title: 'memberAnalysis' },
        children: [
          { path: 'order-amount', component: () => import('@/views/statistics/member-analysis/orderAmount'), name: 'orderAmount', meta: { title: 'orderAmount' }},
          { path: 'added-member', component: () => import('@/views/statistics/member-analysis/addedMember'), name: 'addedMember', meta: { title: 'addedMember' }}
        ]
      },
      {
        path: '/statistics/goods-statistics',
        component: () => import('@/views/statistics/goods-statistics/index'),
        redirect: '/statistics/goods-statistics/price-sales',
        name: 'goodsStatistics',
        meta: { title: 'goodsStatistics' },
        children: [
          { path: 'price-sales', component: () => import('@/views/statistics/goods-statistics/priceSales'), name: 'priceSales', meta: { title: 'priceSales' }},
          { path: 'hot-goods', component: () => import('@/views/statistics/goods-statistics/hotGoods'), name: 'hotGoods', meta: { title: 'hotGoods' }},
          { path: 'goods-sales-details', component: () => import('@/views/statistics/goods-statistics/goodsSalesDetails'), name: 'goodsSalesDetails', meta: { title: 'goodsSalesDetails' }},
          { path: 'goods-collect', component: () => import('@/views/statistics/goods-statistics/goodsCollect'), name: 'goodsCollect', meta: { title: 'goodsCollect' }}
        ]
      },
      {
        path: '/statistics/industry-analysis',
        component: () => import('@/views/statistics/industry-analysis/index'),
        redirect: '/statistics/industry-analysis/industry-scale',
        name: 'industryAnalysis',
        meta: { title: 'industryAnalysis' },
        children: [
          { path: 'industry-scale', component: () => import('@/views/statistics/industry-analysis/industryScale'), name: 'industryScale', meta: { title: 'industryScale' }},
          { path: 'generality-overview', component: () => import('@/views/statistics/industry-analysis/generalityOverview'), name: 'generalityOverview', meta: { title: 'generalityOverview' }}
        ]
      },
      {
        path: '/statistics/traffic-analysis',
        component: () => import('@/views/statistics/traffic-analysis/index'),
        redirect: '/statistics/traffic-analysis/shop',
        name: 'trafficAnalysis',
        meta: { title: 'trafficAnalysis' },
        children: [
          { path: 'shop', component: () => import('@/views/statistics/traffic-analysis/trafficAnalysisShop'), name: 'trafficAnalysisShop', meta: { title: 'trafficAnalysisShop' }},
          { path: 'goods', component: () => import('@/views/statistics/traffic-analysis/trafficAnalysisGoods'), name: 'trafficAnalysisGoods', meta: { title: 'trafficAnalysisGoods' }}
        ]
      },
      {
        path: '/statistics/other-statistics',
        component: () => import('@/views/statistics/other-statistics/index'),
        redirect: '/statistics/other-statistics/order',
        name: 'otherStatistics',
        meta: { title: 'otherStatistics' },
        children: [
          { path: 'order', component: () => import('@/views/statistics/other-statistics/orderStatistics'), name: 'orderStatistics', meta: { title: 'orderStatistics' }},
          { path: 'sales-revenue', component: () => import('@/views/statistics/other-statistics/salesRevenueStatistics'), name: 'salesRevenueStatistics', meta: { title: 'salesRevenueStatistics' }},
          { path: 'customerPriceDistribution', component: () => import('@/views/statistics/other-statistics/customerPriceDistribution'), name: 'customerPriceDistribution', meta: { title: 'customerPriceDistribution' }},
          { path: 'refund', component: () => import('@/views/statistics/other-statistics/refundStatistics'), name: 'refundStatistics', meta: { title: 'refundStatistics' }}
        ]
      }
    ]
  },
  // 运营
  {
    path: '/operations',
    component: Layout,
    redirect: '/page/decoration-setting',
    name: 'operations',
    meta: { title: 'operations', icon: 'shop-manage' },
    children: [
      {
        path: '/page/decoration-setting',
        component: () => import('@/views/page/decoration-setting/index'),
        redirect: '/page/decoration-setting/pc-pages',
        name: 'decorationSetting',
        meta: { title: 'decorationSetting' },
        children: [
          { path: 'pc-pages', component: () => import('@/views/page/decoration-setting/pcPages'), name: 'pcPages', meta: { title: 'pcPages' }},
          { path: 'mobile-pages', component: () => import('@/views/page/decoration-setting/mobilePages'), name: 'mobilePages', meta: { title: 'mobilePages' }},
          { path: 'pc-site-menu', component: () => import('@/views/page/page-setting/pcSiteMenu'), name: 'pcSiteMenu', meta: { title: 'pcSiteMenu' }}
        ]
      },
      {
        path: '/setting',
        component: () => import('@/views/setting/search-settings/index'),
        redirect: '/setting/search-settings/search-keyword',
        name: 'maintain',
        meta: { title: 'maintain' },
        children: [
          { path: 'goods-index', component: () => import('@/views/setting/shop-settings/goodsIndex'), name: 'goodsIndex', meta: { title: 'goodsIndex' }},
          { path: 'hot-keyword', component: () => import('@/views/page/page-setting/hotKeyword'), name: 'hotKeyword', meta: { title: 'hotKeyword' }},
          { path: 'sensitive-words', component: () => import('@/views/setting/shop-settings/sensitiveWords'), name: 'sensitiveWords', meta: { title: 'sensitiveWords' }},
          { path: 'menu-manage', component: () => import('@/views/development/tool-manage/menuManage'), name: 'menuManage', meta: { title: 'menuManage' }},
          { path: 'regional-management', component: () => import('@/views/setting/payment-and-delivery/regionalManagement'), name: 'regionalManagement', meta: { title: 'regionalManagement' }},
          { path: 'oauth2-client', component: () => import('@/views/oauth2/client'), name: 'oauth2Client', meta: { title: 'oauth2Client' }}
        ]
      },
      {
        path: '/development/article-manage',
        component: () => import('@/views/development/article-manage/index'),
        redirect: '/development/article-manage/article-list',
        name: 'articleManage',
        meta: { title: 'articleManage' },
        children: [
          { path: 'article-list', component: () => import('@/views/development/article-manage/articleList'), name: 'articleList', meta: { title: 'articleList' }},
          { path: 'article-category', component: () => import('@/views/development/article-manage/articleCategory'), name: 'articleCategory', meta: { title: 'articleCategory' }},
          { path: 'add', component: () => import('@/views/development/article-manage/addArticle'), name: 'addArticle', hidden: true, meta: { title: 'addArticle' }}
        ]
      },
      {
        path: '/setting/search-settings',
        component: () => import('@/views/setting/search-settings/index'),
        redirect: '/setting/search-settings/search-keyword',
        name: 'searchSettings',
        meta: { title: 'searchSettings' },
        children: [
          { path: 'search-keyword', component: () => import('@/views/setting/search-settings/searchKeyword'), name: 'searchKeyword', meta: { title: 'searchKeyword' }},
          { path: 'search-history', component: () => import('@/views/setting/search-settings/searchHistory'), name: 'searchHistory', meta: { title: 'searchHistory' }},
          { path: 'search-tips', component: () => import('@/views/setting/search-settings/searchTips'), name: 'searchTips', meta: { title: 'searchTips' }}
        ]
      },
      // 导入记录未开发完善 此二级路由暂隐藏
      {
        path: '/backstage-task',
        component: () => import('@/views/backstageTask/index'),
        redirect: '/backstage-task/derive-record',
        name: 'backstageTask',
        meta: { title: 'backstageTask', icon: '' },
        children: [
          { path: 'derive-record', component: () => import('@/views/backstageTask/deriveRecord'), name: 'deriveRecord', meta: { title: 'deriveRecord' }},
          { path: 'import-record', component: () => import('@/views/backstageTask/importRecord'), name: 'importRecord', meta: { title: 'importRecord' }}
        ]
      },
      // { path: 'derive-record', component: () => import('@/views/backstageTask/deriveRecord'), name: 'deriveRecord', meta: { title: 'deriveRecord' }},
      {
        path: '/setting/auth-settings',
        component: () => import('@/views/setting/auth-settings/index'),
        redirect: '/setting/auth-settings/administrator-manage',
        name: 'authSettings',
        meta: { title: 'authSettings' },
        children: [
          { path: 'administrator-manage', component: () => import('@/views/setting/auth-settings/administratorManage'), name: 'administratorManage', meta: { title: 'administratorManage' }},
          { path: 'role-manage', component: () => import('@/views/setting/auth-settings/roleManage'), name: 'roleManage', meta: { title: 'roleManage' }},
          { path: 'role-permission/:id(\\d+)', component: () => import('@/views/setting/auth-settings/rolePermission'), name: 'rolePermission', hidden: true, meta: { title: 'rolePermission', noCache: true }},
          { path: 'system-logs', component: () => import('@/views/development/systemLogs'), name: 'systemLogs', meta: { title: 'systemLogs' }}
        ]
      }
    ]
  },
  // 设置
  {
    path: '/setting',
    component: Layout,
    redirect: '/setting/system-params/system',
    name: 'setting',
    meta: { title: 'setting', icon: 'setting-manage' },
    children: [
      {
        path: '/setting/system-params',
        component: () => import('@/views/setting/payment-and-delivery/index'),
        redirect: '/setting/system-params/system',
        name: 'systemParams',
        meta: { title: 'systemParams' },
        children: [
          { path: 'system', component: () => import('@/views/setting/shop-settings/systemSettings'), name: 'systemSettings', meta: { title: 'systemSettings' }},
          { path: 'smtp', component: () => import('@/views/setting/shop-settings/SMTPSettings'), name: 'smtpSettings', meta: { title: 'smtpSettings' }},
          { path: 'sms-gateway', component: () => import('@/views/setting/shop-settings/SMSGatewaySettings'), name: 'smsGatewaySettings', meta: { title: 'SMSGatewaySettings' }},
          // { path: 'message-template/:bean_id', component: () => import('@/views/setting/shop-settings/messageTemplateList'), name: 'messageTemplateList', meta: { title: 'messageTemplateList' }, hidden: true },
          { path: 'express-platform', component: () => import('@/views/setting/shop-settings/expressPlatformSettings'), name: 'expressPlatformSettings', meta: { title: 'expressPlatformSettings' }},
          { path: 'validator-platform', component: () => import('@/views/setting/shop-settings/validatorPlatformSettings.vue'), name: 'validatorPlatformSettings', meta: { title: 'validatorPlatformSettings' }},
          { path: 'electronic-receipt', component: () => import('@/views/setting/shop-settings/electronicReceipt'), name: 'electronicrEceipt', meta: { title: 'electronicReceipt' }},
          { path: 'storage-solution', component: () => import('@/views/setting/shop-settings/storageSolution'), name: 'storageSolution', meta: { title: 'storageSolution' }},
          { path: 'clearing-data', component: () => import('@/views/setting/shop-settings/clearingData'), name: 'clearingData', meta: { title: 'clearingData' }}
        ]
      },
      {
        path: '/setting/payment-and-delivery',
        component: () => import('@/views/setting/payment-and-delivery/index'),
        redirect: '/setting/payment-and-delivery/payment',
        name: 'paymentAndDelivery',
        meta: { title: 'paymentAndDelivery' },
        children: [
          { path: 'trust-login', component: () => import('@/views/setting/shop-settings/trustLogin'), name: 'trustLogin', meta: { title: 'trustLogin' }},
          { path: 'payment', component: () => import('@/views/setting/payment-and-delivery/payment'), name: 'paymentSettings', meta: { title: 'payment' }},
          { path: 'paymentEdit', component: () => import('@/views/setting/payment-and-delivery/paymentEdit'), name: 'paymentEdit', meta: { title: 'paymentEdit' }, hidden: true },
          { path: 'thirdPlatformAppSettings', component: () => import('@/views/setting/payment-and-delivery/thirdPlatformAppSettings'), name: 'thirdPlatformAppSettings', meta: { title: 'thirdPlatformAppSettings', noCache: true }, hidden: true },
          { path: 'express', component: () => import('@/views/setting/payment-and-delivery/express'), name: 'expressSettings', meta: { title: 'express' }}
          // { path: 'logistics-manage', component: () => import('@/views/order/logisticsManage'), name: 'logisticsManage', meta: { title: 'logisticsManage' }}
        ]
      },
      {
        path: '/setting/message-settings',
        component: () => import('@/views/setting/message-settings/index'),
        redirect: '/setting/message-settings/text-message',
        name: 'messageSettings',
        meta: { title: 'messageSettings' },
        children: [
          {
            path: 'text-message',
            component: () => import('@/views/setting/message-settings/textMessage'),
            name: 'textMessage',
            meta: { title: 'textMessage' }
          },
          {
            path: 'message-sign',
            component: () => import('@/views/setting/message-settings/addMessageSign'),
            name: 'addMessageSign',
            meta: { title: 'addMessageSign' },
            hidden: true
          },
          {
            path: 'message-sign',
            component: () => import('@/views/setting/message-settings/addMessageSign'),
            name: 'editMessageSign',
            meta: { title: 'editMessageSign' },
            hidden: true
          },
          {
            path: 'add-message-template',
            component: () => import('@/views/setting/message-settings/addMessageTemplate'),
            name: 'addMessageTemplate',
            meta: { title: 'addMessageTemplate' },
            hidden: true
          },
          {
            path: 'add-template-audit',
            component: () => import('@/views/setting/message-settings/addMessageTemplate'),
            name: 'addTemplateAudit',
            meta: { title: 'addTemplateAudit' },
            hidden: true
          },
          {
            path: 'send-message',
            component: () => import('@/views/setting/message-settings/sendMessage'),
            name: 'sendMessage',
            meta: { title: 'sendMessage' },
            hidden: true
          },
          {
            path: 'check-message',
            component: () => import('@/views/setting/message-settings/sendMessage'),
            name: 'checkMessage',
            meta: { title: 'sendMessage' },
            hidden: true
          },
          {
            path: 'station-message',
            component: () => import('@/views/setting/message-settings/stationMessage'),
            name: 'stationMessage',
            meta: { title: 'stationMessage' }
          },
          {
            path: 'email',
            component: () => import('@/views/setting/message-settings/email'),
            name: 'email',
            meta: { title: 'email' }
          },
          { path: 'wechat', component: () => import('@/views/setting/message-settings/wechatMessage'), name: 'wechatMessage', meta: { title: 'wechatMessage' }},
          {
            path: 'wechat/:notice_type',
            component: () => import('@/views/setting/message-settings/wechatTemplate'),
            name: 'wechatTemplate',
            hidden: true,
            meta: { title: 'wechatTemplate' }
          }
        ]
      },
      { path: 'find-password', name: 'findPassword', component: () => import('@/views/setting/find-password'), meta: { title: 'findPassword' }, hidden: true},
      { path: 'system-verification', component: () => import('@/views/setting/systemSettingsVerification'), name: 'systemSettingsVerification', meta: { title: 'systemSettingsVerification' }}
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]

/** 国际化菜单路由 */
const dictionaryManage = {
  path: '/setting/dictionary-manage',
  component: () => import('@/views/dictionaryManage/index'),
  redirect: '/setting/dictionary-manage/country-code',
  name: 'dictionaryManage',
  meta: { title: 'dictionaryManage' },
  children: [
    { path: 'country-code', component: () => import('@/views/dictionaryManage/countryCode'), name: 'countryCode', meta: { title: 'countryCode' }},
    { path: 'interface-dictionary', component: () => import('@/views/dictionaryManage/interfaceDictionary'), name: 'interfaceDictionary', meta: { title: 'interfaceDictionary' }},
    { path: 'data-dictionary', component: () => import('@/views/dictionaryManage/dataDictionary'), name: 'dataDictionary', meta: { title: 'dataDictionary' }},
    { path: 'machine-dictionary', component: () => import('@/views/dictionaryManage/machineDictionary'), name: 'machineDictionary', meta: { title: 'machineDictionary' }},
    { path: 'translation-task', component: () => import('@/views/dictionaryManage/translationTask'), name: 'translationTask', meta: { title: 'translationTask' }},
    { path: 'failed-task', component: () => import('@/views/dictionaryManage/failedTask'), name: 'failedTask', meta: { title: 'failedTask' }},
    { path: 'translation-record', component: () => import('@/views/backstageTask/translationRecord'), name: 'translationRecord', meta: { title: 'translationRecord' }},
    { path: 'currency-setting', component: () => import('@/views/dictionaryManage/currencySetting'), name: 'currencySetting', meta: { title: 'currencySetting' }},
    { path: 'exchange-rate-settings', component: () => import('@/views/dictionaryManage/exchangeRateSettings'), name: 'exchangeRateSettings', meta: { title: 'exchangeRateSettings' }, hidden: true}
  ]
}
/** 统计 > 区域分析 */
const regionalAnalysis = { path: 'regionalAnalysis', component: () => import('@/views/statistics/other-statistics/regionalAnalysis'), name: 'regionalAnalysis', meta: { title: 'regionalAnalysis' }}

if (process.env.DISTRIBUTION) {
  asyncRouters.splice(7, 0, disRouterMap)
}

const chatRouter = { path: '/chat', component: () => import('@/views/chat/chat'), name: 'chat' }
// 翻译任务记录
// const translationRecordRouter = { path: 'translation-record', component: () => import('@/views/backstageTask/translationRecord'), name: 'translationRecord', meta: { title: 'translationRecord' }}

// 如果开启了IM
if (process.env.IM) {
  asyncRouters.push(chatRouter)
}

if (process.env.LIVEVIDEO) {
  asyncRouters.splice(4, 0, liveRouterMap)
}

asyncRouters.map(router => {
  if (process.env.I18N) {
    if (router.name === 'setting') {
      router.children.push(dictionaryManage)
    }
  } else {
    // 非国际化时 展示中国区域销售统计
    if (router.name === 'statistics') {
      router.children.map(child => {
        if (child.name === 'otherStatistics') {
          child.children.push(regionalAnalysis)
        }
      })
    }
  }
  if (!process.env.O2O) {
    if (router.name === 'goods') {
      router.children.push(goodsSettingRouterMap)
    } else if (router.name === 'promotions') {
      // 促销
      router.children.push(...seckillAssembleRouterMap)
    }
  } else {
    if (router.name === 'goods') {
      router.children.push(goodsCategoryRouterMap)
    } else if (router.name === 'member') {
      router.children.push(feedbackRouterMap)
    }
  }
})

export const asyncRouterMap = asyncRouters
