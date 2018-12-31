// 全局调用的函数库

module.exports = (() => {
  var o = {};
  // 判断元素属性
  // gettype([]) // array
  o.gettype = gettype;
  // 合并数组
  o.extend = extend;
  // 遍历
  o.each = each;
  // 随机值，包含最大和最小值
  // 参数为最小和最大数
  o.randommm = randommm;
  return o;
})();

// 随机值，包含最大和最小值
// 参数为最小和最大数
function randommm ( min, max ) {
  min = parseInt(min) || 0;
  max = parseInt(max) || 9;
  return parseInt(Math.random()*(max - min + 1) + min);
}
// 判断元素属性
// gettype([]) // array
function gettype(arg0) {
  var str = Object.prototype.toString.call(arg0).slice(8, -1).toLocaleLowerCase();
  if ( (arg0 + '' === 'NaN') && (str === 'number') ) {
    return 'NaN'
  }
  return str;
}
// 合并数组
function extend ( o1, o2 ) {
  for ( var k in o2 ) {
    o1[k] = o2[k];
  }
  return o1;
}
// 遍历
function each ( o, fn ) {
  var ty = gettype(o);
  var i = 0;
  var l = 0;
  if ( ty === 'array' ) {
    l = o.length;
    for ( i = 0; i < l; i++ ) {
      if ( fn(i, o[i]) === false ) {
        break;
      }
    }
  } else if ( ty === 'object' ) {
    for ( i in o ) {
      if ( fn(i, o[i]) === false ) {
        break;
      }
    }
  } else if ( ty === 'number' ) {
    for ( i = 0; i < o; i++ ) {
      if ( fn(i) === false ) {
        break;
      }
    }
  }
}
