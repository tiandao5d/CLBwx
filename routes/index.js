const open = require('open');
const users = require('./users.js');
module.exports =  (router) => {
  router.get('/aaa', async function (ctx, next) {
    await open('http://localhost:8800');
  })
  router.get('/', async (ctx, next) => {
    ctx.body = '123'
  })
  users(router);
}
