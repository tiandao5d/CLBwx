<template>
  <div class="page-item vm-con">
    <div class="vm-videobox mini">
      <video id="vm_myvideo" autoplay />
      <span class="a0000" @click="switchmini"></span>
    </div>
    <div class="vm-videobox" id="vm_youvideo_box">
      <video id="vm_youvideo" autoplay />
      <span class="a0000" @click="switchmini"></span>
    </div>
    <div class="vm-callcon a0000">
      <el-button type="primary" @click="switchconnect(0)">挂断</el-button>
      <el-button type="primary" @click="switchconnect(1)" v-if="receiver === userid && ifcall">接听</el-button>
    </div>
  </div>
</template>

<script>
import Simpler from '../assets/simpler' // 视频通话控件
export default {
  name: 'Simpler',
  data () {
    return {
      ifcall: false, // 是否接通电话
      mystream: null, // 自己的视频流对象
      youstream: null, // 对方的视频流对象
      sender: 0,
      receiver: 0,
      userid: 0
    }
  },
  mounted () {
    this.sender = parseInt(this.$route.params.sender) // 发送者ID
    this.receiver = parseInt(this.$route.params.receiver) // 接收者ID
    this.userid = this.$jsk.getUserId() // 当前用户ID
    let vobj = {
      chat: this.$chat, // 实时通讯websocket
      myvideo: 'vm_myvideo', // 己方视频元素
      youvideo: 'vm_youvideo', // 对方视频元素
      sender: this.sender, // 发送者ID
      receiver: this.receiver, // 接收者ID
      userid: this.userid, // 当前用户ID
      vcmStr: this.$jsk.vcmStr, // 视频通讯的websocket事件名称
      onconsent: this.onconsent, // 用户同意后事件监听
      onreject: this.onreject // 用户拒绝事件监听
    }
    this.simpler = new Simpler(vobj)
    this.simpler.init()
    // 发出呼叫的人执行发送
    if ( this.sender === this.userid ) {
      this.simpler.sendcall() // 发出视频请求
    } else if ( this.receiver === this.userid ) { // 接收者首次进入界面
      this.ifcall = true
    }
  },
  methods: {
    // 挂断或接通
    switchconnect ( type ) {
      if ( type === 0 ) { // 挂断
        this.simpler.useranswer(0)
        this.jskback()
      } else if ( type === 1 ) { // 接听
        this.simpler.useranswer()
      }
    },
    // 接听
    onconsent (msg) {
      this.ifcall = false
    },
    // 挂断
    onreject (msg) {
      if ( msg.author !== this.userid ) {
        this.jskback()
      }
    },
    // 视频大小切换
    switchmini (e) {
      let me = e.target
      let vbox = me.parentNode
      let minivbox = this.$el.querySelector('.vm-videobox:not(.mini)')
      if ( vbox.classList.contains('mini') ) {
        minivbox.classList.add('mini')
        vbox.classList.remove('mini')
      }
    }
  }
}
</script>

<style>
.vm-videobox {
  background: #000;
}
.vm-videobox,
.vm-videobox video {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
}
.vm-videobox.mini {
  left: auto;
  right: 5px;
  top: 5px;
  width: 50%;
  height: auto;
  padding-top: 50%;
  border: solid 1px #333;
  box-shadow: 0 0 5px 5px #333;
  z-index: 10;
}
.vm-callcon {
  background: rgba(0,0,0,.6);
}
</style>
