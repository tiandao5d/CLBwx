/**
作用：福彩3d数据库数据
**/
const objFnums = require('../controller/formatNums.js');
const sql = require('../controller/sql/sql.js');
const {each, gettype} = require('../controller/jxl.js');
const {rnfn} = require('../controller/errorobj.js');
module.exports =  (router) => {
  router.post('/add', fc3dAddNums); // 添加福彩3d数据
  router.get('/gets', getSqlData); // 获取数据库数据
}

async function getSqlData ( ctx ) {
  var num = parseInt(ctx.query.num);
  num = num > 0 ? num : 50;
  let fnums = await sql.getSqlLast(`0,${num}`);
  fnums = ftok(fnums);
  fnums = objFnums.fnToArray(fnums);
  ctx.body = fnums;
}

// 添加fc3d数据
// 传参方式：{bodystr: JSON.stringify([{q: '182569956', n: [2,2,5]}])}
// 或者：{q: '1585855', n: '2,2,5')}
async function fc3dAddNums ( ctx ) {
  let arr = getFc3dAddBody(ctx);
  if ( !validFc3dNums(arr) ) {
    ctx.body = rnfn(10002);
    return false;
  }
  // 获取最后一次添加的数据
  let sqlArr = await sql.getSqlLast(1);
  let prev_o = ftok(sqlArr)[0]; // 存储为字符串数据，转为对象
  let addNums = objFnums.getAddObj(arr, prev_o);
  addNums = ktof(addNums); // 转为json字符串储存
  let pall = addNums.map(o => sql.insertObj(o));
  let robj = await Promise.all(pall);
  ctx.body = robj ? rnfn(80000) : rnfn(10000);
}

// 客服端转到服务端字符串储存
function ktof ( arg0 ) {
  let arr = [...arg0]
  each(arr, (i, o) => { // 转为json字符串储存到数据库
    each(o, (k, v) => {
      if ( typeof v === 'object' ) {
        o[k] = JSON.stringify(v);
      }
    })
  });
  return arr;
}
// 服务端数据库转到客户端json数据
function ftok ( arg0 ) {
  let arr = [...arg0];
  each(arr, (i, o) => { // 将数据库中数据输出对象格式
    each(o, (k, v) => {
      v += '';
      if ( /^[\[\{]/.test(v) ) {
        o[k] = JSON.parse(v);
      }
    })
  });
  return arr;
}

// 获取要添加的fc3d的数据
function getFc3dAddBody (ctx) {
  let q = ctx.request.body.q;
  let n = ctx.request.body.n;
  let bodystr = ctx.request.body.bodystr; // 如果存在，则为批量
  let arr;
  if ( bodystr ) {
    arr = JSON.parse(bodystr);
  } else {
    if ( typeof n === 'string' ) {
      n = n.split(',');
    }
    arr = [{q, n}];
  }
  return arr;
}

// 福彩3d号码验证
function validFc3dNums ( arr ) {
  var istrue = true;
  if ( gettype(arr) === 'array' ) {
    each(arr, (i, o) => {
      if ( !(o && gettype(o.n) === 'array' && o.n.length === 3 && o.q) ) {
        istrue = false;
      }
      o.q += '';
      each(o.n, (ni, nn) => {
        nn = parseInt(nn);
        o.n[ni] = nn;
        if ( !(nn >= 1 && nn <= 6) ) {
          istrue = false;
          return false;
        }
      });
      if ( istrue === false ) {
        return false;
      }
    });
  } else {
    istrue = false;
  }
  return istrue;
}
