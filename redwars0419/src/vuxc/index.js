import Vue from 'vue'

import {
  ToastPlugin,
  Group,
  XInput,
  XButton,
  LoadingPlugin
} from 'vux'
Vue.use(ToastPlugin, {position: 'top'})
Vue.use(LoadingPlugin)

Vue.component('group', Group)
Vue.component('x-button', XButton)
Vue.component('x-input', XInput)


export default {}
