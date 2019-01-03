/**
作用：统一化报错
**/
const {gettype} = require('./jxl.js');
const eobj = {
  'a80000': {result: 'success', error: ''},
  'a10000': {result: '', error: '未知错误'},
  'a10001': {result: '', error: '数据库错误'},
  'a10002': {result: '', error: '参数错误'}
}
var num = 0;


module.exports = (() => {
  var o = {};
  o.rnfn = eobjFn;
  o.clogErr = clogErr;
  return o;
})()

function eobjFn (arg0 = {}, arg1) {
  let obj = null;
  let tp = gettype(arg0);
  if ( tp === 'error' ) {
    clogErr(arg0);
    if ( arg1 ) {
      obj = {...eobj.a10000, arg1};
    } else {
      obj = {...eobj.a10000}
    }
  } else if ( tp === 'number' ) {
    obj = eobj[('a' + arg0)];
  } else {
    obj = {...eobj.a80000, result: arg0};
  }
  return obj;
}

// 控制台显示错误
function clogErr (arg0, arg1 = '没有内容') {
  let n = num++;
  if ( arg0.stack ) {
    arg0 = arg0.stack.split(' at ')[1];
  }
  console.log(`${n}======================================${n}`);
  console.log(arg0);
  console.log(arg1);
  console.log(`${n}======================================${n}`);
}
