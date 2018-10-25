"use strict"
const users = require('./users')
const message = require('./message')
const friend = require('./friend')
module.exports =  (router) => {
  users(router) // 用户表
  message(router) // 消息表
  friend(router) // 朋友表
  router.get('/', async function (ctx, next) {
    ctx.state = {
      title: 'koa2 title'
    }
    await ctx.render('index', {title: ctx.state})
  })
}
