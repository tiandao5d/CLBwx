// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
// import '!style-loader!css-loader!less-loader!./assets/less/nt.less'
import './assets/material-icons/material-icons.css'

import 'swiper/dist/css/swiper.css'
import VueAwesomeSwiper from 'vue-awesome-swiper'

import './assets/style.css'
import globaljs from './assets/globaljs.js'

Vue.use(globaljs)
Vue.use(MuseUI)
Vue.use(VueAwesomeSwiper)

Vue.config.productionTip = false

router.goBack = (vm) => {
  window.history.length > 1
    ? vm.$router.go(-1)
    : vm.$router.push('/')
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
