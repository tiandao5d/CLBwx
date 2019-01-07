// 获取彩票原始数据列表

'use strict'
const sql = require('./sql/sql.js');
const {each, randommm} = require('./jxl.js');
var tt = +new Date();
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

// reqp('http://127.0.0.1:3001/get', 'get').then(function (body) {
//   console.log(body)
// })
// 获取号码
// [{q: 181213037, n: [1,2,3]}]
function getNums () {
  return new Promise(function(resolve, reject) {
    var a = [];
    var f = 181213047;
    each(10, function ( i ) {
      a.push({
        q: f++,
        n: [randommm(1,6), randommm(1,6), randommm(1,6)]
      })
    });
    resolve(a);
  });
}

// 获取新的数据
async function getSqlNewNums () {
  let ctt = +new Date();
  if ( ctt - tt > (10*60*1000) ) { // 超过十分钟才会请求
    return [];
  }
  let nums = await getNums();
  let slarr = await sql.getSqlLast('1'); // 获取数据库最后一条数据
  let sobj = slarr[0];
  let newarr;
  let lq; // 获取数据库最后一条数据的期号
  if ( sobj ) { // 数据库中最后一条数据是否存在
    newarr = [];
    lq = parseInt(sobj.q);
    each(nums, (i, o) => {
      if ( parseInt(o.q) > lq ) {
        newarr.unshift(o);
      }
    })
    return newarr;
  } else {
    newarr = nums;
  }
  return newarr;
}
// 返回新的数据，
// nums 请求的所有数据，lobj，数据库存储的最后一条数据
function rnNewNums (nums, lobj) {

}
