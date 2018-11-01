/**
websocket任务
*/
"use strict"
const msgtable = require('../controller/msgtable')
module.exports =  (server) => {
  var io = require('socket.io')(server)
  var chat = io.of('/chat')
  .on('connection', (socket) => {
    // 实时通讯文字聊天
    socket.on('chat message', async (msg) => {
      let op = {
        sender: parseInt(msg.sender),
        receiver: parseInt(msg.receiver),
        message: msg.message,
        tt: jsk.ftt()
      }
      let rd = await msgtable.addMsg(op)
      if ( rd.code >= 80000 ) {
        chat.emit('chat message', op)
      }
    })
    // 实时通讯视频聊天
    socket.on('vcall_rtcmsg', async (msg) => {
      chat.emit('vcall_rtcmsg', msg)
    })
  })
  return chat
}
