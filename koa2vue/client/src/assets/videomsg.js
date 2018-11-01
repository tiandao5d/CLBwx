/*
  视频通话控件封装
*/
class VideoMsg {
  constructor ( obj ) {
    this.userid = obj.userid // 当前用户ID
    this.sender = obj.sender // 发送者
    this.receiver = obj.receiver // 接收者
    this.chat = obj.chat // 信令通道
    this.myvideo = obj.myvideo // 己方video元素
    this.youvideo = obj.youvideo // 对方video元素
    this.vcmStr = obj.vcmStr // 监听接口
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
      console.log(msg)
      if ( msg.sender === this.sender && msg.receiver === this.receiver ) {
        this.msgCtr(msg)
      }
    })
    this.getMedia((stream) => {
      this.mystream = stream
      this.myvideo.srcObject = stream
    })
  }
  destroy () {
    this.mediastop(this.mystream)
    this.mediastop(this.youstream)
  }
  mediastop ( stream ) {
    if ( stream ) {
      let trcacks
      try{
        trcacks = stream.getTracks()[1]
      } catch (err) {
        trcacks = stream
      }
      trcacks.stop && trcacks.stop()
    }
  }
  // 消息接收并处理，全局消息不在此处
  msgCtr ( msg ) {
    if ( msg.type === 'vcall_consent' ) { // 收到同意接听视频通话
      this.pc = this.createPC() // 创建PC
      this.pc.addStream(this.mystream) // 添加stream
      if ( msg.sender === this.userid ) { // 发送者发出offer
        this.rtcoffer(this.pc) // 发送offer
      }
      this.onconsent(msg) // 用户同意后事件监听
    }else if ( msg.type === 'vcall_reject' ) { // 对方拒绝
      this.onreject(msg) // 用户拒绝事件监听
    }else if ( msg.type === 'vcall_rtcoffer' ) { // 收到offer
      if ( msg.receiver === this.userid ) { // 接收者收到offer
        this.pc.setRemoteDescription(new RTCSessionDescription(msg.localDesc))
        this.rtcanswer(this.pc) // 回应answer
      }
    }else if ( msg.type === 'vcall_rtcanswer' ) { // 收到answer
      if ( msg.sender === this.userid ) { // 发送者收到answer
        this.pc.setRemoteDescription(new RTCSessionDescription(msg.localDesc))
      }
    } else if ( msg.type === 'vcall_candidate' ) { // 完成匹配
      this.pc.addIceCandidate(new RTCIceCandidate({
        sdpMLineIndex: msg.sdpMLineIndex,
        candidate: msg.candidate
      }))
    }
  }
  // 创建PC
  createPC () {
    let pc = new RTCPeerConnection(this.iceServer)
    pc.onicecandidate = this.onicecandidate.bind(this)
    pc.onaddstream = this.onaddstream.bind(this)
    pc.onremovestream = this.nullfn
    return pc
  }
  onicecandidate ( e ) {
    if (e.candidate) {
      this.sendsocket({
        type: 'vcall_candidate',
        sdpMLineIndex: e.candidate.sdpMLineIndex,
        candidate: e.candidate.candidate
      })
    }
  }
  onaddstream ( e ) {
    this.youstream = e.stream
    this.youvideo.srcObject = e.stream
  }
  // 发送rtc offer
  rtcoffer ( pc ) {
    pc.createOffer((localDesc) => {
      pc.setLocalDescription(localDesc)
      this.sendsocket({
        type: 'vcall_rtcoffer',
        localDesc
      })
    }, this.nullfn)
  }
  // 应答offer，回应answer
  rtcanswer ( pc ) {
    pc.createAnswer((localDesc) => {
      pc.setLocalDescription(localDesc)
      this.sendsocket({
        type: 'vcall_rtcanswer',
        localDesc
      })
    }, this.nullfn)
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
    console.log(obj)
    this.chat.emit(this.vcmStr, {
      sender: this.sender, // 发送者ID
      receiver: this.receiver, // 接收者ID
      ...obj
    })
  }
  // 获取本地媒体
  getMedia (fn) {
    let usermedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia
    if ( usermedia ) {
      usermedia({
        audio: true, // 音频
        video: true // 视频
      }, fn, function () {
        console.log('获取用户摄像头失败')
      })
    } else {
      console.log('不支持媒体数据')
    }
  }
  // 空函数不做任何处理
  nullfn () {}
}
export default VideoMsg
