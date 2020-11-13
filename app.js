const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()
const json = require('koa-json')
const onerror = require('koa-onerror')
const logger = require('koa-logger')
const config = require('./config')
const routes = require('./routes')

// error handler
onerror(app)

// middlewares
app.use(cors)
  .use(json())
  .use(logger())
  .use(require('koa-static')(__dirname + '/public'))
  .use(require('koa-static')(__dirname + '/xlku'))
  .use(router.routes())
  .use(router.allowedMethods())

// 设置跨域响应头
async function cors(ctx, next) {
  ctx.set('Access-Control-Allow-Origin', '*')
  await next()
}

routes(router)
app.on('error', function (err, ctx) {
  console.log(err)
  logger.error('server error', err, ctx)
})

// browserSync.init({
//   server: './public',
//   browser: 'chrome',
//   port: config.port
// });
// browserSync.watch('./public/123.html').on('change', browserSync.reload)

module.exports = app.listen(config.port, () => {
  console.log(`Listening on http://localhost:${config.port}`);
});
