/**
作用：伪造数据或者一次性形式的福彩3d的路由
**/
'use strict';
const {each} = require('../controller/jxl.js');
const objFnums = require('../controller/formatNums.js');
module.exports =  (router) => {
  // 伪造数据或者一次性形式的福彩3d
  router.get('/gethzyl', async (ctx, next) => {
    var fAhzYl = await objFnums.fAhzYl();
    fAhzYl = objFnums.ahzToArray(fAhzYl); // 将和值遗漏统计转为数组
    ctx.body = fAhzYl;
  })
  router.get('/get', async (ctx, next) => {
    var num = ctx.query.num;
    var day = ctx.query.day;
    var arr = null;
    var fnums = await objFnums.formatNums();
    if ( day ) {
      if ( day === 'yesterday' ) {
        arr = getDayFn(fnums, ((+new Date()) - (24*60*60*1000)));
      } else {
        arr = getDayFn(fnums, +new Date());
      }
    } else {
      arr = getNumsFn(fnums, num);
    }
    arr = objFnums.fnToArray(arr);
    ctx.body = arr;
  })
}


// 获取多少条
function getNumsFn ( fnums, num ) {
  var arr1 = null;
  var l = 0;
  num = parseInt(num) || 50;
  l = fnums.length;
  if ( l >= num ) {
    arr1 = fnums.slice(l - num);
  } else {
    arr1 = fnums;
  }
  return arr1;
}

// 时间格式化
function ftt(ms) {
  if (!ms) {
    return ''
  };
  var _date = (ms instanceof Date) ? ms : new Date(ms);
  var _y = _date.getFullYear(),
    _m = _date.getMonth() + 1,
    _d = _date.getDate();
  var a = {
    _y: (_y < 10) ? ('0' + _y) : (_y + ''),
    _m: (_m < 10) ? ('0' + _m) : (_m + ''),
    _d: (_d < 10) ? ('0' + _d) : (_d + '')
  }
  return a._y.slice(-2) + a._m + a._d;
}

// 获取某一天的数据
function getDayFn (fnums, ms) {
  let arr = [];
  let tt = ftt(ms);
  let q = '';
  each(fnums, (i, o) => {
    q = o.q + '';
    if ( q.indexOf(tt) === 0 ) {
      arr.push(o)
    }
  });
  return arr;
}
