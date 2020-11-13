// vue router 配置
import VueRouter from 'vue-router'
import LoginPage from '../components/LoginPage'
import FriendList from '../components/FriendList'
import MsgPage from '../components/MsgPage'
import SearchPage from '../components/SearchPage'
import RegisterPage from '../components/RegisterPage'
// import VideoMsg from '../components/SimplerMsg'
import VideoMsg from '../components/VideoMsg'
export default (Vue) => {
  Vue.use(VueRouter)
  let router = new VueRouter({
    routes: [
      {path: '/', component: FriendList, name: 'FriendList'},
      {path: '/login', component: LoginPage, name: 'LoginPage'},
      {path: '/msg/:heid', component: MsgPage, name: 'MsgPage'},
      {path: '/search', component: SearchPage, name: 'SearchPage'},
      {path: '/register', component: RegisterPage, name: 'RegisterPage'},
      {path: '/vmsg/:sender/:receiver', component: VideoMsg, name: 'VideoMsg'}
    ]
  })
  Vue.mixin({
    methods: {
      jskback () {
        this.$store.dispatch('actCappani', 'slide-right')
        window.history.length > 1
          ? this.$router.go(-1)
          : this.$router.push('/')
      },
      jskgo ( u0 = '/' ) {
        this.$store.dispatch('actCappani', 'slide-left')
        this.$router.push(u0)
      }
    }
  })
  return router
}
