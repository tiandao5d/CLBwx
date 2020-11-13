/**
用户数据路由
*/
"use strict"
const friendtable = require('../controller/friendtable')

module.exports =  (router) => {
  router.post(getUrl('/get'), getfriend) // 用户查询
  router.post(getUrl('/add'), addfriend) // 用户添加
}

// 当前页面的路由格式化
function getUrl ( url ) {
  return '/friend' + url
}

// 用户查询
async function getfriend (ctx, next){
  let op = ctx.request.body
  op.sender = ctx.request.query.id
  let rd = await friendtable.getfriend(op)
  ctx.body = rd
}
// 添加好友关系
async function addfriend (ctx, next){
  let op = ctx.request.body
  // 必须有一个查询的数据
  if ( !op.receiver ) {
    ctx.body = jsk.returnMsg(20405)
    return false
  }
  op.sender = ctx.request.query.id
  let gd = await friendtable.getfriend(op)
  if ( gd.code >= 80000 ) {
    ctx.body = jsk.returnMsg(10008)
    return false
  }
  let rd = await friendtable.addfriend(op)
  ctx.body = rd
}
