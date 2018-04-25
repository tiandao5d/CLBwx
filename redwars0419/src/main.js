// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import FastClick from 'fastclick'
import VueRouter from 'vue-router'
import App from './App'
import router from './router'

import './assets/style.css'
import globaljs from './assets/globaljs.js'
import './vuxc'

import { WechatPlugin } from 'vux'

Vue.use(WechatPlugin)

Vue.use(globaljs)

Vue.use(VueRouter)

window.wx = Vue.wechat

FastClick.attach(document.body)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount('#app-box')
