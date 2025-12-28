import Vue from 'vue'
import Router from 'vue-router'

const alias = require('ui-domain/alias')

const routerPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error => error)
}

Vue.use(Router)

export const routes = [
  { path: '', name: 'home', component: () => import('../views/index') },
  { path: '/', name: 'index', component: () => import('../views/index') },
  { path: '/404', name: '404', component: () => import('../views/error/404') },
  { path: '/500', name: '500', component: () => import('../views/error/500') },
  { path: '/ask-detail', name: 'ask-detail', component: () => import('../views/ask-detail') },
  { path: '/binder', name: 'binder', component: () => import('../views/binder') },
  { path: '/binder-error', name: 'binder-error', component: () => import('../views/binder-error') },
  { path: '/cart', name: 'cart', component: () => import('../views/shoppingCart/index') },
  { path: '/chat', name: 'chat', component: () => import('../views/chat') },
  {
    path: '/find-password',
    name: 'find-password',
    component: () => import('../views/find-password')
  },
  // { path: '/group-buy', name: 'group-buy', component: () => import('../views/group-buy') },
  { path: '/coupons', name: 'coupons', component: () => import('../views/coupons') },
  {
    path: '/help', name: 'help', component: () => import('../views/help/help'), children: [
      { path: '', name: 'help-index', component: () => import('../views/help/index') },
      { path: ':id', name: 'help-detail', component: () => import('../views/help/_id') }
    ]
  },
  { path: '/login', name: 'login', component: () => import('../views/login') },
  {
    path: '/member',
    name: 'member-layout',
    component: () => import('../views/member/layout'),
    children: [
      { path: '', name: 'member', component: () => import('../views/member/index') },
      { path: 'account-balance', name: 'account-balance', component: () => import('../views/member/account-balance') },
      { path: 'account-binding', name: 'account-binding', component: () => import('../views/member/account-binding') },
      { path: 'account-safe', name: 'account-safe', component: () => import('../views/member/account-safe') },
      { path: 'after-sale', name: 'after-sale', component: () => import('../views/member/after-sale') },
      { path: 'apply-service', name: 'apply-service', component: () => import('../views/member/apply-service') },
      { path: 'ask-message', name: 'ask-message', component: () => import('../views/member/ask-message') },
      { path: 'bind-email', name: 'bind-email', component: () => import('../views/member/bind-email') },
      { path: 'bind-mobile', name: 'bind-mobile', component: () => import('../views/member/bind-mobile') },
      { path: 'change-mobile', name: 'change-mobile', component: () => import('../views/member/change-mobile') },
      { path: 'change-password', name: 'change-password', component: () => import('../views/member/change-password') },
      { path: 'change-paymentpassword', name: 'change-paymentpassword', component: () => import('../views/member/change-paymentpassword') },
      { path: 'comments', name: 'comments', component: () => import('../views/member/comments') },
      { path: 'goods-collection', name: 'goods-collection', component: () => import('../views/member/goods-collection') },
      { path: 'increase-ticket', name: 'increase-ticket', component: () => import('../views/member/increase-ticket') },
      { path: 'message-index', name: 'message-index', component: () => import('../views/member/message-index') },
      { path: 'my-answer', name: 'my-answer', component: () => import('../views/member/my-answer') },
      { path: 'my-collection', name: 'my-collection', component: () => import('../views/member/my-collection') },
      { path: 'my-consultation', name: 'my-consultation', component: () => import('../views/member/my-consultation') },
      { path: 'my-coupons', name: 'my-coupons', component: () => import('../views/member/my-coupons') },
      { path: 'my-footprint', name: 'my-footprint', component: () => import('../views/member/my-footprint') },
      { path: 'my-points', name: 'my-points', component: () => import('../views/member/my-points') },
      { path: 'my-profile', name: 'my-profile', component: () => import('../views/member/my-profile') },
      { path: 'refund-record', name: 'refund-record', component: () => import('../views/member/refund-record') },
      { path: 'service-detail', name: 'service-detail', component: () => import('../views/member/service-detail') },
      { path: 'service-record', name: 'service-record', component: () => import('../views/member/service-record') },
      { path: 'shipping-address', name: 'shipping-address', component: () => import('../views/member/shipping-address') },
      { path: 'shop-collection', name: 'shop-collection', component: () => import('../views/member/shop-collection') },
      { path: 'website-message', name: 'website-message', component: () => import('../views/member/website-message') },
      { path: 'my-order', name: 'my-order', component: () => import('../views/member/my-order/index') },
      { path: 'my-order/detail', name: 'my-order-detail', component: () => import('../views/member/my-order/detail') },
      { path: 'my-comments',
        name: 'my-comments',
        component: () => import('../views/member/my-comments/index'),
        children: [
          { path: 'detail', name: 'my-comments-detail', component: () => import('../views/member/my-comments/detail') },
          { path: 'finished', name: 'my-comments-finished', component: () => import('../views/member/my-comments/finished') },
          { path: 'wait-chase', name: 'my-comments-wait-chase', component: () => import('../views/member/my-comments/wait-chase') },
          { path: 'walt-comment', name: 'my-comments-walt-comment', component: () => import('../views/member/my-comments/walt-comment') }
        ]
      },
      { path: 'my-complaint', name: 'my-complaint', component: () => import('../views/member/my-complaint/index') },
      { path: 'my-complaint/complaint-apply', name: 'complaint-apply', component: () => import('../views/member/my-complaint/complaint-apply') },
      { path: 'my-complaint/detail', name: 'my-complaint-detail', component: () => import('../views/member/my-complaint/detail') },
      { path: 'my-receipt', name: 'my-receipt', component: () => import('../views/member/my-receipt/index') },
      { path: 'my-receipt/detail', name: 'my-receipt-detail', component: () => import('../views/member/my-receipt/detail') },
      
    ]
  },
  { path: '/payment-complete', name: 'payment-complete', component: () => import('../views/payment-complete') },
  { path: '/points-mall', name: 'points-mall', component: () => import('../views/points-mall') },
  { path: '/register', name: 'register', component: () => import('../views/register') },
  {
    path: '/register-by-email',
    name: 'register-by-email',
    component: () => import('../views/register-by-email')
  },
  { path: '/reply-answer', name: 'reply-answer', component: () => import('../views/reply-answer') },
  { path: '/seckill', name: 'seckill', component: () => import('../views/seckill') },
  {
    path: '/shop',
    name: 'shop',
    component: () => import('../views/shop/layout'),
    children: [
      { path: '', name: 'shop-index', component: () => import('../views/shop/index') },
      { path: 'goods-list', name: 'shop-goods-list', component: () => import('../views/shop/goods-list') },
      {
        path: 'apply',
        name: 'apply',
        component: () => import('../views/shop/apply/apply'),
        children: [
          { path: '', name: 'shop-apply', component: () => import('../views/shop/apply/index') },
          { path: 'auth-info', name: 'shop-apply-auth-info', component: () => import('../views/shop/apply/auth-info') },
          {
            path: 'basic-info',
            name: 'shop-apply-basic-info',
            component: () => import('../views/shop/apply/basic-info')
          },
          {
            path: 'financial-qualification',
            name: 'shop-apply-financial-qualification',
            component: () => import('../views/shop/apply/financial-qualification')
          },
          { path: 'shop-info', name: 'shop-apply-shop-info', component: () => import('../views/shop/apply/shop-info') },
          { path: 'success', name: 'shop-apply-success', component: () => import('../views/shop/apply/success') },
          {
            path: 'user-agreement',
            name: 'shop-apply-user-agreement',
            component: () => import('../views/shop/apply/user-agreement')
          }
        ]
      },
      { path: ':id', name: 'shop-detail', component: () => import('../views/shop/_id') }
    ]
  },
  {
    path: '/checkout',
    name: 'checkout-layout',
    component: () => import('../views/checkout/layout'),
    children: [
      { path: '', name: 'checkout', component: () => import('../views/checkout/index') },
      { path: 'cashier', name: 'checkout-cashier', component: () => import('../views/checkout/cashier') },
      {
        path: 'cashier-load-pay',
        name: 'checkout-cashier-load-pay',
        component: () => import('../views/checkout/cashier-load-pay')
      },
      { path: 'electro', name: 'checkout-electro', component: () => import('../views/checkout/electro') },
      { path: 'vatordinary', name: 'checkout-vatordinary', component: () => import('../views/checkout/vatordinary') },
      { path: 'vatospecial', name: 'checkout-vatospecial', component: () => import('../views/checkout/vatospecial') }
    ]
  },
  { path: '/goods', name: 'goods', component: () => import('../views/goods/index') },
  { path: '/goods/snapshot', name: 'goodsSnapshot', component: () => import('../views/goods/snapshot') },
  { path: '/goods/:id', name: 'goodsDetail', component: () => import('../views/goods/_id') },
  
  {
    path: '/mini-page',
    name: 'mini-page',
    component: () => import('../views/mini-page')
  },

  { path: '*', redirect: '/404' }
]

// 分销路由
const distributionRouter = {
  path: 'distribution',
  name: 'distribution',
  component: () => import('../views/member/distribution/index'),
  redirect: 'distribution-manage',
  children: [
    {
      path: 'distribution-manage',
      name: 'distributionManage',
      component: () => import('../views/member/distribution/distributionManage')
    },
    {
      path: 'distribution-team',
      name: 'distributionTeam',
      component: () => import('../views/member/distribution/distributionTeam')
    },
    {
      path: 'distribution-brokerage',
      name: 'distributionBrokerage',
      component: () => import('../views/member/distribution/distributionBrokerage')
    },
    {
      path: 'distribution-order',
      name: 'distributionOrder',
      component: () => import('../views/member/distribution/distributionOrder')
    },
    {
      path: 'distribution-goods',
      name: 'distributionGoods',
      component: () => import('../views/member/distribution/distributionGoods')
    },
    {
      path: 'commission-withdrawal',
      name: 'commissionWithdrawal',
      component: () => import('../views/member/distribution/commissionWithdrawal')
    },
    {
      path: 'applyFor-withdraw',
      name: 'applyForWithdraw',
      component: () => import('../views/member/distribution/applyForWithdraw')
    }
  ]
}
if (process.env.DISTRIBUTION) {
  const memberRouter = routes.filter(item => item.name === 'member-layout')[0]
  if (memberRouter) {
    memberRouter.children.push(distributionRouter)
  }
}

const router = new Router({
  mode: 'history',
  base: alias.buyer ? `/${alias.buyer}/` : undefined,
  scrollBehavior: () => ({ y: 0 }),
  routes: routes
})

export default router
