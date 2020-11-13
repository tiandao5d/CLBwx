/**
用户数据路由
*/
"use strict"
const msgtable = require('../controller/msgtable')

module.exports =  (router) => {
  router.post(getUrl('/get'), getMsg)  // 获取
}

// 当前页面的路由格式化
function getUrl ( url ) {
  return '/msg' + url
}

// 获取
async function getMsg (ctx, next){
  let op = ctx.request.body
  // 简单数据验证
  if ( !op.receiver ) {
    ctx.body = jsk.returnMsg(20405)
    return false
  }
  op.sender = parseInt(ctx.request.query.id)
  if ( op.receiver ) {
    op.receiver = parseInt(op.receiver)
  }
  let rd = await msgtable.getMsg(op)
  ctx.body = rd
}
