// 入口文件
import Vue from 'vue' // VUE核心文件
import routerfn from './assets/vuerouter' // vue路由配置文件
import Vuex from 'vuex' // vuex核心文件
import Jsk from './assets/jsk' // 全局公用文件
import App from './App.vue' // 主要页面入口
import storefn from './assets/store' // vuex的状态文件
import ElementUI from 'element-ui' // element-ui框架

import './assets/style.css' // 格式化样式
import 'element-ui/lib/theme-chalk/index.css' // element-ui框架

Vue.use(ElementUI)
Vue.use(Vuex)
Vue.use(Jsk)

Vue.config.productionTip = false
new Vue({
  router: routerfn(Vue),
  store: storefn(Vuex), // vuex全局状态管理
  render: h => h(App)
}).$mount('#app')
