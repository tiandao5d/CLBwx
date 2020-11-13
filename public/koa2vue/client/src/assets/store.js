// vuex全局状态
export default (Vuex) => {
  return new Vuex.Store({
    state: { // 全局状态
      num: 0,
      appani: 'slide-left' // 用于全局页面切换动效
    },
    mutations: { // 修改全局状态的方式，store.commit('increment')，必须同步
      cnum ( state ) {
        state.num++;
      },
      cappani ( state, txt ) {
        state.appani = txt
      }
    },
    actions: { // 提交触发修改事件，可以异步
      actCnum ( { commit } ) {
        commit('gnum')
      },
      actCappani ( { commit }, txt ) {
        commit('cappani', txt)
      }
    }
  })
}
