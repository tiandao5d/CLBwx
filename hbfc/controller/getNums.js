// 获取彩票原始数据列表

'use strict'
const config = require('../config');
const sql = require('./sql/sql.js');
const {each, randommm, reqp} = require('./jxl.js');
var count = 50; // 请求的数据量，就是多少条
var tt = 0;
module.exports = (() => {
  var o = {};
  // 获取号码
  o.getNums = async () => {
    let nums = await getNums();
    return nums;
  };
  o.getSqlNewNums = getSqlNewNums;
  return o;
})();

// 获取号码
// [{q: 181213037, n: [1,2,3]}]
function getNums () {
  return new Promise(function(resolve, reject) {
    requestFn(data => {
      var a = [];
      each(data, ( i, o ) => {
        a.push({
          q: o.showIssue,
          n: o.winNum.split('').map(n => parseInt(n))
        })
      });
      resolve(a);
    })
  });
}

// 模拟数据请求
// gameId":9,"realIssue":3116,"showIssue":"190101074","winNum":"123"
// 游戏id  流水号  销售期号 开奖号码 190107043
// reqp('http://hb579n.natappfree.cc/ips/game/getK3WinNumInfo?count=50', 'get').then(function (body) {
//   console.log(body)
// })
function requestFn( cb = () => {}) {
  reqp(config.getNumsUrl, config.getNumsType).then(function (body) {
    if ( body && body.data && body.data.length > 0 ) {
      var arr = body.data;
      if ( parseInt(arr[0].showIssue) > parseInt(arr[1].showIssue) ) {
        arr.reverse();
      }
      cb(arr);
    } else {
      cb([]);
    }
  })
}

// 获取新的数据
async function getSqlNewNums () {
  let ctt = +new Date();
  if ( !(ctt - tt > (10*60*1000)) ) { // 超过十分钟才会请求
    tt = ctt;
    return [];
  }
  let nums = await getNums(); // [{q: 181213037, n: [1,2,3]}]
  let slarr = await sql.getSqlLast('1'); // 获取数据库最后一条数据
  let sobj = slarr[0];
  let newarr;
  let lq; // 获取数据库最后一条数据的期号
  if ( sobj ) { // 数据库中最后一条数据是否存在
    newarr = [];
    lq = parseInt(sobj.q);
    each(nums.reverse(), (i, o) => {
      if ( parseInt(o.q) > lq ) {
        newarr.unshift(o);
      } else {
        return false;
      }
    })
    return newarr;
  } else {
    newarr = nums;
  }
  return newarr;
}
