"use strict"
global.jsk = require('./controller/jsk') // 全局jsk变量
const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()

// 全局接口把关
const guardpass = require('./scripts/guardpass')

//chat 实时通讯绑定
const server = require('http').createServer(app.callback())
const chat = require('./routes/chat')

const views = require('koa-views')
const co = require('co')
const convert = require('koa-convert')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const debug = require('debug')('koa2:server')
const path = require('path')

const config = require('./config')
const routes = require('./routes')

const port = process.env.PORT || config.port

// error handler
onerror(app)

// middlewares
app.use(bodyparser())
  .use(json())
  .use(logger())
  .use(require('koa-static')(__dirname + '/public'))
  .use(views(path.join(__dirname, '/views'), {
    options: {settings: {views: path.join(__dirname, 'views')}},
    map: {'njk': 'nunjucks'},
    extension: 'njk'
  }))
  .use(guardpass)
  .use(router.routes())
  .use(router.allowedMethods())



jsk.chat = chat(server, router) // 实时通讯
routes(router) // 页面接口
app.on('error', function(err, ctx) {
  console.log(err)
  logger.error('server error', err, ctx)
})
module.exports = server.listen(config.port, () => {
  console.log(`Listening on http://localhost:${config.port}`)
})
