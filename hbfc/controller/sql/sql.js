/**
作用：用于数据库操作
**/
const mysql = require('mysql2');
const {each, extend} = require('../jxl.js');
const ct = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'test'
})

module.exports = (() => {
  var o = {};
  o.insertObj = insertObj;
  o.getIssue = getIssue;
  o.getSqlTop = getSqlTop;
  o.getSqlLast = getSqlLast;
  return o;
})()

// 数据库字段参数说明
// const sqlArr = [
//     'q', 'n', 'ahf', 'axt', 'azh', 'ajs', 'aos', 'ads',
//     'axs', 'ahz', 'awh', 'a3y', 'akd', 'an012'
// ];
const sqlArr = [
    'q', // 期数
    'n', // 号码
    'ahf', // 号码分布图
    'ajs', // 奇数
    'aos', // 偶数
    'ads', // 大数
    'axs', // 小数
    'ahz', // 和值
    'awh', // 尾和
    'a3y', // 和值除以3余数
    'akd', // 跨度
    'axt', // 形态
    'azh', // 组合走势
    'an012', // 012位余数
    'an0', // 第一位除以三余数
    'an1', // 第二位除以三余数
    'an2' // 第三位除以三余数
];

// 插入数据
function insertObj (robj) {
  let sqlstr;
  let ks = [];
  let vs = [];
  each(sqlArr, (i, k) => {
    ks.push(k);
    vs.push('\'' + robj[k] + '\'');
  });
  sqlstr = `INSERT INTO hbfc3d (${ks.join(', ')}) VALUES (${vs.join(', ')})`;
  return rnPromise(sqlstr);
}

// 返回一个promise的sql语句
function rnPromise ( sqlstr ) {
  return new Promise(function(resolve, reject) {
    ct.query(sqlstr, ( err, res ) => {
      if ( err ) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

// 获取对应期号数据
async function getIssue ( issue ) {
  let sqlstr = `SELECT * FROM hbfc3d WHERE q='${str}'`;
  let arr = await rnPromise(sqlstr);
  return arr[0];
}

// 获取前面多少条
function getSqlTop (str = '1') {
  let sqlstr = `SELECT * FROM hbfc3d LIMIT ${str}`;
  return rnPromise(sqlstr);
}
// 获取最后多少条条
function getSqlLast (str = '1') {
  let sqlstr = `SELECT * FROM hbfc3d ORDER BY id DESC LIMIT ${str}`;
  return rnPromise(sqlstr);
}
