import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/home' // 主页
import Login from '@/components/login/login' // 登录
import Turntable from '@/components/share/turntable.vue' // 转盘
import Answer from '@/components/answer' // 答题

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    }, {
      path: '/turntable',
      name: 'Turntable',
      component: Turntable
    }, {
      path: '/answer',
      name: 'Answer',
      component: Answer
    }, {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]
})
