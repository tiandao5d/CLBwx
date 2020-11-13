"use strict"
const usertable = require('../controller/usertable')
// 用于全局的接口过滤
async function tokenFn (ctx) {
  let token = ctx.query.token
  let userid = ctx.query.id
  let nowtt = jsk.ftt()
  if ( !(ctx.path === '/user/register' || ctx.path === '/user/login') ) {
    if ( !(token && userid) ) {
      jsk.clog(`token或id不存在：${token} , ${userid}`, new Error())
      return false
    }
    await usertable.setUserInfo({loginTt: nowtt}, userid) // 更新登录时间戳
    let rd = await usertable.getuser({id: userid}) // 查询用户数据
    let userobj = rd.result[0]
    let maxtt = 30*60*1000 //最长有效时间
    if ( !(userobj && userobj.token === token && nowtt - parseInt(userobj.loginTt) < maxtt ) ) {
      jsk.clog(userobj, new Error())
      return false
    }
  }
  return true
}
module.exports =  async (ctx, next) => {
  jsk.clog(`接口参数为：${JSON.stringify(ctx.request.body)}\n\nparams：${JSON.stringify(ctx.request.params)}\n\nquery：${JSON.stringify(ctx.request.query)}`, new Error())
  ctx.set('Access-Control-Allow-Origin', '*') // 跨域
  let istoken = await tokenFn(ctx)
  if ( !istoken ) {
    ctx.body = jsk.returnMsg(10007)
    return false
  }
  await next()
}
