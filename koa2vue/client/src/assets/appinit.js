/*
app.vue创建后执行，全局操作
此处不能使用箭头函数，否则无法获取到this
*/

export default function () {
  // 视频通话全局监听
  this.$chat.on(this.$jsk.vcmStr, (msg) => {
    let userid = this.$jsk.getUserId()
      console.log(msg,userid)
    if ( msg.type === 'vcall_sender' ) { // 收到视频通话请求
      if ( msg.receiver === userid ) { // 接收者处理
        this.jskgo(`/vmsg/${msg.sender}/${msg.receiver}`)
      }
    }
  })
}
