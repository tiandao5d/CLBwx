// 获取彩票原始数据列表

'use strict'
const {each, randommm} = require('./jxl.js');
module.exports = (() => {
  var o = {};
  // 获取号码
  o.getNums = async () => {
    let nums = await getNums();
    return nums;
  };
  return o;
})();

// 获取号码
// [{q: 181213037, n: [1,2,3]}]
function getNums () {
  return new Promise(function(resolve, reject) {
    var a = [];
    var f = 181213037;
    each(10, function ( i ) {
      a.push({
        q: f++,
        n: [randommm(1,6), randommm(1,6), randommm(1,6)]
      })
    });
    resolve(a);
  });
}
