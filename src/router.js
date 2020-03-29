import Vue from 'vue'
import Router from 'vue-router'
const Index = ()=> import('@/components/index/index');
const ShopCar = ()=> import('@/components/shopcar/shopcar');
const Mine = ()=> import('@/components/mine/mine');
const userMsg = ()=> import('@/components/usermsg/usermsg');
// const Newest = ()=> import('@/components/newest/newest');
const GoodsDetail = ()=>import( '@/components/goodsdetail/goodsdetail');
const Register = ()=> import('@/components/register/register');
const setInfo = ()=> import('@/components/setInfo/setInfo');
const used = ()=> import('@/components/used/used');
const upGoods = ()=> import('@/components/upGoods/upGoods');
Vue.use(Router)

export default new Router({
    routes: [
        //设置首页导航  http://localhost:8080/#index  http://localhost:8080/#/index
        {
            path: '/',
            redirect: {name: 'index'}
        },
        {
            path: '/index',
            name: 'index',
            component: Index
        },
        //配置购物车
        {
            path: '/shopcar',
            name: 'shopcar',
            component: ShopCar
        },
        //配置用户消息
        {
            path: '/usermsg',
            name: 'usermsg',
            component: userMsg
        },
        //配置我的
        {
            path: '/mine',
            name: 'mine',
            component: Mine
        },
        // //配置最新更新商品
        // {
        //     path:'/newest/:page',
        //     name: 'newest',
        //     component: Newest
        // },
        //配置商品详情
        {
            path:'/goodsdetail/:id',
            name:'goodsdetail',
            component:GoodsDetail
        },
        //注册页面
        {
            path:'/register',
            name:'register',
            component:Register
        },
        //个人中心设置
        {
          path:'/setInfo',
          name:'setInfo',
            component:setInfo
        },
        //个人置换页面
        {
          path:'/used',
          name:'used',
          component:used
        },
        //发布置换页面
        {
            path:'/upGoods',
            name:'upGoods',
            component:upGoods
        },
        //发布置换页面

    ]

})
