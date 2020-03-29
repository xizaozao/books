import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueAwesomeSwiper from 'vue-awesome-swiper'
// import vueLazyLoad from 'vue-lazyload'
// Vue.use(vueLazyLoad,{
//     preLoad:1.3,
//     loading:'./img/loading-spinning-bubbles.svg'
// })
Vue.use(VueAwesomeSwiper)
import { Indicator } from 'mint-ui'
// 引入axios
import Axios from 'axios'
Vue.prototype.$axios = Axios;
//使用moment.js来处理相对于现在的时间
Vue.filter('relTime',function (time) {
    return Moment(time).utcOffset(-360).fromNow()
})
import {Search ,Tabbar,TabbarItem,Button, Row, Col,Field, NavBar,Toast,Uploader ,Cell, CellGroup,Icon,Popup,Picker ,Dialog ,Checkbox, CheckboxGroup,Stepper,SubmitBar,Swipe, SwipeItem, GoodsAction, GoodsActionBigBtn, GoodsActionMiniBtn,DatetimePicker,List     } from 'vant'
Vue.use(Indicator).use(List).use(Search).use(DatetimePicker).use(GoodsAction).use(GoodsActionBigBtn).use(GoodsActionMiniBtn).use(Swipe).use(SwipeItem).use(SubmitBar ).use(Stepper ).use(CheckboxGroup).use(Checkbox).use(Dialog).use(Picker).use(Popup).use(Tabbar).use(TabbarItem).use(Field).use(NavBar).use(Button).use(Row).use(Col).use(Toast).use(Uploader).use(Cell).use(CellGroup).use(Icon);
//处理时间戳
import Moment from 'moment'
Moment.locale('zh-cn')

// 引入公共组件
import  Navbar from './components/common/navbar'
import  GoBack from './components/common/goback'
Vue.component(Navbar.name,Navbar);
Vue.component(GoBack.name,GoBack)

//使用拦截器来改善网络过慢不加载情况
// 发起请求时显示loading open
Axios.interceptors.request.use(function (config) {
    config.withCredentials = true
    Indicator.open({
        text: '正在玩命加载中.....',
        spinnerType: 'snake'
    });
    return config;
});
// 响应后关闭loading open
Axios.interceptors.response.use(function (response) {
    Indicator.close();
    return response;
});


// 引入全局css
import '@/assets/css/all.css'
import './assets/iconfont/iconfont.css'
import './assets/iconfont/demo.css'
import 'swiper/dist/css/swiper.css'
import 'mint-ui/lib/indicator/style.css'
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
