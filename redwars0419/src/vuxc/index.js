import Vue from 'vue'

import {
  ToastPlugin,
  Group,
  XButton,
  XInput
} from 'vux'
Vue.use(ToastPlugin, {position: 'top'})

Vue.component('group', Group)
Vue.component('x-button', XButton)
Vue.component('x-input', XInput)


export default {}
