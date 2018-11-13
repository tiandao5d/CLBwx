/*
  视频通话控件封装
*/
class Simpler {
  constructor ( obj ) {
    this.userid = obj.userid // 当前用户ID
    this.sender = obj.sender // 发送者
    this.receiver = obj.receiver // 接收者
    this.chat = obj.chat // 信令通道
    this.myvideo = obj.myvideo // 己方video元素
    this.youvideo = obj.youvideo // 对方video元素
    this.vcmStr = obj.vcmStr // 监听接口
    this.roomval = this.sender + 'liketoroom' + this.receiver // 房间名
    this.mystream = {} // 己方视频数据
    this.youstream = {} // 对方视频数据
    this.pc = null // 不晓得怎么说
    this.iceServer = { // rtc配置
        "iceServers": [{
            "urls" : ["stun:stun.l.google.com:19302"]
        }, {
            "urls" : ["turn:numb.viagenie.ca"],
            "username" : "webrtc@live.com",
            "credential" : "muazkh"
        }]
    }
    this.onconsent = obj.onconsent || this.nullfn // 用户同意后事件监听
    this.onreject = obj.onreject || this.nullfn // 用户拒绝事件监听
  }
  init () {
    // 视频通话信息监听
    this.chat.on(this.vcmStr, (msg) => {
      // 聊天的两个人才能收到此信息
      if ( msg.sender === this.sender && msg.receiver === this.receiver ) {
        this.msgCtr(msg)
      }
    })
    this.webrtc = this.newSirtc()
  }
  // 创建房间
  createRoom (webrtc, fn) {
    webrtc.createRoom(this.roomval, fn);
  }
  newSirtc () {
    let webrtc = new SimpleWebRTC({
        localVideoEl: this.myvideo,
        remoteVideosEl: this.youvideo,
        autoRequestMedia: true,
        debug: false,
        detectSpeakingEvents: true
    });
    webrtc.on('videoAdded', function (video, peer) {
      console.log(12345487978)
        var remotes = document.getElementById('vm_youvideo_box');
        if (remotes) {
            remotes.appendChild(video);
        }
    });
    return webrtc;
  }
  // 消息接收并处理，全局消息不在此处
  msgCtr ( msg ) {
    if ( msg.type === 'vcall_consent' ) { // 收到同意接听视频通话
      if ( msg.sender === this.userid ) { // 发送者创建房间
        this.createRoom(this.webrtc, (err, name) => {
          if ( !err ) { // 房间创建成功
            this.sendsocket({
              type: 'room_val',
              roomval: this.roomval
            })
          }
        })
      }
      this.onconsent(msg) // 用户同意后事件监听
    } else if ( msg.type === 'vcall_reject' ) { // 对方拒绝
      this.onreject(msg) // 用户拒绝事件监听
    } else if ( msg.type === 'room_val' ) { // 房间号
      // if ( msg.receiver === this.userid ) { // 接收者进入房间
        this.roomval = msg.roomval
        this.webrtc.joinRoom(this.roomval)
      // }
    }
  }
  // 用户接听对方视频通话请求
  useranswer ( num ) {
    this.sendsocket({
      type: (num === 0 ? 'vcall_reject' : 'vcall_consent'),
      author: this.userid
    })
  }
  // 发出视频通话请求
  sendcall () {
    this.sendsocket({
      type: 'vcall_sender'
    })
  }
  sendsocket ( obj = {} ) {
    this.chat.emit(this.vcmStr, {
      sender: this.sender, // 发送者ID
      receiver: this.receiver, // 接收者ID
      ...obj
    })
  }
  // 空函数不做任何处理
  nullfn () {}
}
export default Simpler
