const router = require('koa-router')()
const fs = require('fs');
const objFnums = require('../controller/formatNums.js');
var fnums = null; // 记录格式化后的值
router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})


router.post('/add', async (ctx, next) => {
  let op = ctx.request.body;
  ctx.body = {a: 123};
})
router.get('/getAhzyl', async (ctx, next) => {
  var fAhzYl = await objFnums.fAhzYl();
  fAhzYl = objFnums.ahzToArray(fAhzYl); // 将和值遗漏统计转为数组
  ctx.body = fAhzYl;
})
router.get('/geto', async (ctx, next) => {
  var o = await objFnums.formatNums();
  ctx.body = o;
})
router.get('/get', async (ctx, next) => {
  var arr1 = null;
  var l = 0;
  var num = ctx.query.num;
  num = parseInt(num) || 50;
  if ( !fnums ) {
    fnums = await objFnums.formatNums();
  }
  fnums = objFnums.fnToArray(fnums);
  l = fnums.length;
  if ( l >= num ) {
    arr1 = fnums.slice(l - num);
  } else {
    arr1 = fnums;
  }
  ctx.body = arr1;
})


module.exports = router
