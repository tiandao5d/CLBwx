import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/home'
import AddShop from '@/components/addShop'
import TotalTable from '@/components/totalTable'
import DetailsShop from '@/components/detailsShop'
import TotalNum from '@/components/totalNum'
import RankingList from '@/components/rankingList'
import Login from '@/components/login/login'
import MyVote from '@/components/myVote'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/home',
      name: 'Home',
      component: Home
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/addshop',
      name: 'AddShop',
      component: AddShop
    },
    {
      path: '/totalTable',
      name: 'TotalTable',
      component: TotalTable
    },
    {
      path: '/totalNum',
      name: 'TotalNum',
      component: TotalNum
    },
    {
      path: '/rankingList',
      name: 'RankingList',
      component: RankingList
    },
    {
      path: '/detailsShop',
      name: 'DetailsShop',
      component: DetailsShop
    },
    {
      path: '/myVote',
      name: 'MyVote',
      component: MyVote
    },
    {
      path: '*',
      redirect: '/totalTable'
    }
  ]
})
