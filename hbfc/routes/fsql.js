/**
作用：福彩3d数据库数据
**/
'use strict';
const fs = require('fs');
const koaBody = require('koa-body');
const objFnums = require('../controller/formatNums.js');
const sql = require('../controller/sql/sql.js');
const {each, gettype} = require('../controller/jxl.js');
const {rnfn} = require('../controller/errorobj.js');
const {getSqlNewNums} = require('../controller/getNums.js');
module.exports =  (router) => {
  // router.post('/add', addFc3d); // 添加福彩3d数据
  // router.post('/addfile', koaBody({multipart: true}), addFc3dFile); // 添加福彩3d数据，通过文件方式添加
  router.get('/get', getSqlData); // 获取数据库数据
  router.get('/gethzyl', getAhzyl); // 和值遗漏统计
}

// 统计和值遗漏
async function getAhzyl ( ctx ) {
  let fnums = await sql.getRow();
  fnums = ftok(fnums);
  var fAhzYl = objFnums.getAhzYl(fnums);
  fAhzYl = objFnums.ahzToArray(fAhzYl); // 将和值遗漏统计转为数组
  ctx.body = fAhzYl;
}

 // 获取数据库数据
async function getSqlData ( ctx ) {
  var num = parseInt(ctx.query.num);
  num = num > 0 ? num : 50;
  let newarr = await getSqlNewNums();
  console.log(newarr)
  if ( newarr.length > 0 ) {
    await fc3dAddNums(newarr); // 存储新数据到数据库
  }
  let fnums = await sql.getSqlLast(`0,${num}`);
  fnums = ftok(fnums);
  fnums = objFnums.fnToArray(fnums);
  ctx.body = fnums;
}

// 添加fc3d数据，通过文件方式添加
async function addFc3dFile ( ctx ) {
  let file = ctx.request.files.file;
  let arr = formatFile(file);
  let ans;
  if ( typeof arr === 'number' ) {
    ans = arr;
  } else {
    ans = await fc3dAddNums(arr);
  }
  ctx.body = rnfn(ans);
}

// 文件解析
function formatFile ( file ) {
  if ( file && file.type === 'application/json' ) {
    var data = fs.readFileSync(file.path, 'utf8');
    fs.unlinkSync(file.path); // 删除自动储存的文件，以免造成冗余
    try{
      data = JSON.parse(data);
    } catch (err) {
      return 10000;
    }
    return data;
  } else {
    return 10000;
  }
}

// 添加fc3d数据
async function addFc3d ( ctx ) {
  let arr = getFc3dAddBody(ctx);
  let ans = await fc3dAddNums(arr);
  ctx.body = rnfn(ans);
}

// 传参方式：{bodystr: JSON.stringify([{q: '182569956', n: [2,2,5]}])}
// 或者：{q: '1585855', n: '2,2,5')}
async function fc3dAddNums ( arr ) {
  if ( !validFc3dNums(arr) ) {
    return 10002;
  }
  // 获取最后一次添加的数据
  let sqlArr = await sql.getSqlLast(1);
  let prev_o = ftok(sqlArr)[0]; // 存储为字符串数据，转为对象
  let addNums = objFnums.getAddObj(arr, prev_o);
  addNums = ktof(addNums); // 转为json字符串储存
  for ( let i = 0, l = addNums.length; i < l; i++ ) {
    await sql.insertObj(addNums[i]);
  }
  return 80000;
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
