<template>
  <div class="page-item">
    <div class="pitem-head">
      <div class="pitem-head-l" @click="jskback">返回</div>
      {{cfriend}}
    </div>
    <div class="mp-con msgbox">
      <div class="mp-item" :key="index" :class="msg.addcls" v-for="(msg, index) in msgs">
        <img class="mp-item-img" :src="msg.photo || dimg" alt="头像">
        <div class="mp-item-txt">
          {{msg.message}}
          <span class="mp-caret"></span>
        </div>
      </div>
    </div>
    <div class="mp-foot">
      <el-input placeholder="请输入内容" @keyup.enter.native="sendmsg" v-model="gobj.message">
        <el-button slot="append" @click="sendmsg">发送</el-button>
        <el-button slot="prepend" @click="videomsg">视频聊天</el-button>
      </el-input>
    </div>
  </div>
</template>

<script>
import dimg from '../assets/uphoto.jpeg'
export default {
  name: 'MsgPage',
  data () {
    return {
      dimg,
      cfriend: '', // 聊天的对象，显示在抬头
      sendstr: '',
      msgs: [],
      userId: 0,
      heobj: {},
      meobj: {},
      gobj: {
        sender: 0,
        receiver: 0,
        message: ''
      }
    }
  },
  created () {
    this.gobj.sender = this.$jsk.getUserId()
    this.gobj.receiver = parseInt(this.$route.params.heid)
    this.meobj = this.$jsk.storageL(this.$jsk.userData)
    this.heobj = this.$jsk.getf(this.gobj.receiver)
    this.cfriend = this.heobj.userName
    this.$chat.on('chat message', this.chatmessage) // 监听信息接收
    this.getMsg()
  },
  methods: {
    // 发送视频聊天
    videomsg () {
      this.jskgo(`/vmsg/${this.gobj.sender}/${this.gobj.receiver}`)
    },
    // 获取消息记录
    getMsg () {
      this.$jsk.ajax ({
        method: 'post',
        url: '/msg/get',
        data: {
          receiver: this.gobj.receiver
        }
      }, (data) => {
        if ( data.result ) {
          let arr = []
          this.$jsk.each(data.result, ( i, o ) => {
            if ( o.sender === this.gobj.sender ) {
              this.$jsk.extend(o, this.meobj)
              o.addcls = 'me'
            } else {
              this.$jsk.extend(o, this.heobj)
              o.addcls = 'he'
            }
            arr[arr.length] = o
          })
          this.msgs = arr
          this.tofoot()
        }
      })
    },
    // 通讯消息变化
    // msg.userId 发送者ID msg.receiver接收者id
    chatmessage ( msg ) {
      if ( msg.sender === this.gobj.sender ) { // 自己发给别人的
        //去掉
      } else { // 别人发给自己的
        this.$jsk.extend(msg, this.heobj)
        msg.addcls = 'he'
        this.msgs.push(msg)
        this.tofoot()
      }
    },
    //发送消息
    sendmsg () {
      if ( !this.gobj.message ) {
        this.$jsk.toast('不能发送空消息', 4)
        return false
      }
      this.$chat.emit('chat message', {...this.gobj})
      let msg = {...this.gobj, ...this.meobj, addcls: 'me'}
      this.msgs.push(msg)
      this.gobj.message = ''
      this.tofoot()
    },
    // 到最新内容
    tofoot () {
      this.$nextTick(() => {
        let msgbox = this.$el.querySelector('.msgbox')
        msgbox.scrollTop = msgbox.scrollHeight
      })
    }
  }
}
</script>

<style>
.mp-con {
  position: absolute;
  left: 0;
  top: 50px;
  bottom: 50px;
  width: 100%;
  background: #ccc;
  overflow-x: hidden;
  overflow-y: auto;
}
.mp-foot {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 5px 15px;
  height: 50px;
}
.mp-item {
  position: relative;
  padding: 15px 55px;
}
.mp-item-img {
  position: absolute;
  left: 15px;
  top: 15px;
  width: 30px;
  height: 30px;
  border-radius: 3px;
}
.mp-item-txt {
  position: relative;
  display: inline-block;
  min-width: 50px;
  line-height: 30px;
  border-radius: 5px;
  padding: 0 10px;
  font-size: 12px;
  background: #409eff;
  color: #fff;
  text-align: justify;
}
.mp-caret {
  position: absolute;
  right: 99%;
  top: 7px;
  display: inline-block;
  width: 0;
  height: 0;
  vertical-align: middle;
  border-right: 8px dashed #409eff;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
}
.mp-item.me {
  text-align: right;
}
.mp-item.me .mp-item-img {
  left: auto;
  right: 15px;
}
.mp-item.me .mp-caret {
  left: 99%;
  border-right: 0;
  border-left: 8px dashed #409eff;
}
</style>
