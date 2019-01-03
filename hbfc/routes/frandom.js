/**
作用：伪造数据或者一次性形式的福彩3d的路由
**/
const objFnums = require('../controller/formatNums.js');
var fnums = null; // 记录格式化后的值
module.exports =  (router) => {
  // 伪造数据或者一次性形式的福彩3d
  router.get('/getAhzyl', async (ctx, next) => {
    var fAhzYl = await objFnums.fAhzYl();
    fAhzYl = objFnums.ahzToArray(fAhzYl); // 将和值遗漏统计转为数组
    ctx.body = fAhzYl;
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
}
