/**
用户数据路由
*/
"use strict"
const usertable = require('../controller/usertable')
const md5 = require('js-md5')
const allstrarr = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789'.split('')

module.exports =  (router) => {
  router.post(getUrl('/register'), register)  // 注册
  router.post(getUrl('/login'), login)  // 登录
  router.post(getUrl('/getuser'), getuser) // 用户查询
}

// 当前页面的路由格式化
function getUrl ( url ) {
  return '/user' + url
}

// 获取随机md5加密的token值
function getToken ( id ) {
  let str = +new Date()
  let i, num = Math.floor(Math.random()*(40 - 20 + 1) + 20)
  for ( i = 0; i < num; i++ ) {
    str += allstrarr[Math.floor(Math.random() * allstrarr.length)]
  }
  str += id
  return md5(str).toUpperCase()
}

// 注册
async function register (ctx, next){
  let op = ctx.request.body
  // 用户名，密码都不能为空
  if ( !(op.userName && op.password) ) {
    ctx.body = jsk.returnMsg(10005)
    return false
  }
  op = {
    userName: op.userName,
    password: op.password
  }
  let rd = await usertable.register(op)
  if ( rd.code >= 80000 ) {
    rd.result = 'success'
  }
  ctx.body = rd
}
// 登录
async function login (ctx, next){
  let op = ctx.request.body
  // 用户名，密码都不能为空
  if ( !(op.userName && op.password) ) {
    ctx.body = jsk.returnMsg(10005)
    return false
  }
  let rd = await usertable.login(op)
  let uiop = null // 设置token值
  let setrd = null // 登录后设置了token后的返回值
  let uobj = null // 登录时用户数据
  if ( rd.code >= 80000 ) {
    uobj = rd.result[0] // 用户数据
    // 设置token值
    uiop = {token: getToken(uobj.id), tt: jsk.ftt()}
    setrd = await usertable.setUserInfo(uiop, uobj.id)
  }
  if ( setrd.code >= 80000 ) {
    rd.result = {...uobj, ...uiop, oldtt: uobj.tt}
    ctx.body = rd
  } else {
    ctx.body = jsk.returnMsg(10000)
  }
}

// 用户查询
async function getuser (ctx, next){
  let op = ctx.request.body
  // 必须有一个查询的数据
  if ( !(op.userName || op.id) ) {
    ctx.body = jsk.returnMsg(10006)
    return false
  }
  let rd = await usertable.getuser(op)
  ctx.body = rd
}
