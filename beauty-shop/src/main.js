// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'


import './assets/style.css'
import globaljs from './assets/globaljs.js'

Vue.use(globaljs)
Vue.use(MuseUI)

Vue.config.productionTip = false

router.goBack = () => {
  if ( window.history.length > 1 ) {
    window.history.go(-1)
  }
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
