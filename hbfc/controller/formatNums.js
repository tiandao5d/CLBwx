// 格式化彩票列表数据信息
'use strict';
const {each, extend} = require('./jxl.js');
const objNums = require('./getNums.js');
module.exports = (() => {
  var o = {};
  o.getAddObj = getAddObj;
  o.getAhzYl = getAhzYl;
  o.getFnums = async () => {
    let nums = await objNums.getNums();
    return nums;
  }
  // 获取号码
  o.formatNums = async () => {
    let nums = await o.getFnums();
    return formatNums(nums);
  };
  o.fnToArray = fnToArray; // 将o.formatNums值转为数组
  // 获取和值遗漏
  o.fAhzYl = async () => {
    let fnums = await o.formatNums();
    return getAhzYl(fnums);
  };
  o.ahzToArray = ahzToArray; // 将和值遗漏统计转为数组
  return o;
})();

// 客户端添加数据整理，期号，号码，上一期
function getAddObj(arr, prev_o) {
  return formatNums(arr, prev_o);
}
// 获取和值遗漏
// ass 实际出现次数
// als 理论出现次数
// a3y 近3次遗漏
// a3q 近3周期遗漏
function getAhzYl ( arg0 ) {
  var a = [...arg0].reverse();
  var ahzgl = getAhzGl(); // 出现概率
  var b = {};
  var c = {};
  var hnum = 0; // 记录和值
  var s = '';
  var po = null; // 记录对象
  var l = a.length;
  var zq = 78; // 一周期的期数
  each((18 - 3 + 1), (i) => {
    s = 'a' + (i + 3);
    b[s] = {
      h: (i + 3),
      lastqo: a[0],
      als: ahzgl[s]*l,
      ass: 0,
      a3y: {a0: 0, a1: 0, a2: 0, a3: (a[0]['ahz'][s][1] === 0 ? a[0]['ahz'][s][0] : 0), a4: 0, a5: 0}, // a0前三，a1前二，a2前1，a3当前，a4平均，a5最大
      a3q: {a0: 0, a1: 0, a2: 0} // a0前三周期，a1前二周期，a2前一周期
    };
    c[s] = {n: 0, max: b[s]['a3y']['a3']}; // 记录出现次数最大值
  })
  each(a, (i, o) => {
    hnum = o.ahz.cnum;
    s = 'a' + hnum;
    c[s]['n'] += 1; // 记录出现次数
    c[s]['max'] = c[s]['max'] || 0;
    po = a[(i + 1)] && a[(i + 1)]['ahz'][s];
    // 记录最大遗漏
    if ( po && po[1] === 0 && po[0] > c[s]['max'] ) {
      c[s]['max'] = po[0];
    }
    b[s]['ass'] += 1;
    if ( c[s]['n'] <= 3 ) {
      getA3yYl(a, i, o, c[s]['n'], b[s]['a3y']); // 前三次数据
    }
    if ( i < zq*3 ) { // 统计三周期
      getA3qYl(l, zq, c, i, b);
    }
  })
  each(c, (k, o) => { // 获取前三的平均值和最大遗漏
    b[k]['a3y']['a5'] = o.max;
    b[k]['a3y']['a4'] = (b[k]['a3y']['a0'] + b[k]['a3y']['a1'] + b[k]['a3y']['a2'])/3;
  })
  return b;
}


// 三周期统计
function getA3qYl (l, zq, c, i, b) {
  // 一周期78期
  i += 1;
  if ( i === zq ) {
    fn1 (['a2']);
  } else if ( i === zq*2 ) {
    fn1 (['a1']);
  } else if ( i === zq*3 ) {
    fn1 (['a0']);
  }
  // 统计数少于三周期
  if ( i === l ) {
    if ( l < zq ) {
      fn1 (['a2', 'a1', 'a0']);
    } else if ( l < zq*2 ) {
      fn1 (['a1', 'a0']);
    } else if ( l < zq*3 ) {
      fn1 (['a0']);
    }
  }
  function fn1 (_arr) {
    each(c, (k, o) => {
      each(_arr, (i, _a) => {
        b[k]['a3q'][_a] = o.n;
      });
    })
  }
}

// 将和值统计转为数组形式
function ahzToArray (arg0) {
  var a = {...arg0};
  var ks = ['a3y', 'a3q'];
  var ar1 = [];
  var arr;
  each(a, function ( i, o ) {
    each(ks, function (ki, kv) {
      arr = [];
      each(o[kv], function (k, v) {
        arr.push(v);
      });
      o[kv] = arr;
    });
    ar1.push(o);
  })
  return ar1;
}


// 前三次遗漏值统计
// {a0: 0, a1: 0, a2: 0, a3: 0, a4: 0, a5: 0}// 前三，前二，前1，当前，平均，最大
function getA3yYl (a, i, o, n, a3y) {
  var hnum = o.ahz.cnum;
  var s = 'a' + hnum;
  function fn1 ( ii, ss ) {
    var ar1 = a[ii] && a[ii].ahz[ss];
    if ( ar1 && ar1[1] === 0 ) {
      return ar1[0];
    }
    return 0;
  }
  switch (n) {
    case 1:
      a3y.a2 = fn1((i + 1), s);
      break;
    case 2:
      a3y.a1 = fn1((i + 1), s);
      break;
    case 3:
      a3y.a0 = fn1((i + 1), s);
      break;
  }
}

// 获取和值概率
function getAhzGl () {
  var a = {"a3":["111"],"a4":["112"],"a5":["122","113"],"a6":["222","114","123"],"a7":["133","115","223","124"],"a8":["116","233","224","125","134"],"a9":["333","144","225","126","135","234"],"a10":["244","226","334","136","145","235"],"a11":["155","344","335","245","236","146"],"a12":["444","255","336","345","246","156"],"a13":["166","355","445","346","256"],"a14":["266","455","446","356"],"a15":["555","366","456"],"a16":["466","556"],"a17":["566"],"a18":["666"]};
  var b = {};
  var c = {};
  var nn = 0;
  each(a, function (k, o) {
    var num = 0;
    each(o, function (i, s) {
      var n = ntongNum(s.split(''))
      switch (n) {
        case 1:
          num += 1
          break;
        case 2:
          num += 3
          break;
        case 3:
          num += 6
          break;
      };
    })
    b[k] = num;
    nn += num;
  })
  each(b, function (k, n) {
    c[k] = n/nn;
  });
  return c;
}

// ahf 号码分布图
// ajs 奇数个数
// aos 偶数个数
// ads 大数个数
// axs 小数个数
// ahz 和值
// awh 尾和
// a3y 和值除以3余数
// akd 跨度
// axt 号码形态
// azh 组合走势
function formatNums ( arg0, prev_o ) {
  var a = [...arg0];
  var l = a.length;
  var i = 0;
  for ( i = 0; i < l; i++ ) {
    a[i]['ahf'] = getAhf(a[i]['n'], prev_o); // 开奖号码分布
    a[i]['axt'] = getAxt(a[i]['n'], prev_o); // 号码形态
    a[i]['azh'] = getAzh(a[i]['n'], prev_o); // 组合走势
    extend(a[i], getStype(a[i]['n'], prev_o));
    prev_o = a[i];
  }
  return a;
}

function fnToArray (arg0) {
  var a = [...arg0];
  var ks = ['ahf', 'axt', 'azh', 'ajs', 'aos', 'ads', 'axs', 'ahz', 'awh', 'a3y', 'akd', 'an0', 'an1', 'an2'];
  var arr;
  each(a, function ( i, o ) {
    each(ks, function (ki, kv) {
      arr = [];
      each(o[kv], function (k, v) {
        if ( typeof v === 'object' ) {
          arr.push(v);
        }
      });
      o[kv] = arr;
    });
  })
  return a;
}

function getStype (arr, prev_o) {
  var obj = {
    ajs: {num: 0, min: 0, max: 3}, // 奇数
    aos: {num: 0, min: 0, max: 3}, // 偶数
    ads: {num: 0, min: 0, max: 3}, // 大数
    axs: {num: 0, min: 0, max: 3}, // 小数
    ahz: {num: 0, min: 3, max: 18}, // 和值
    awh: {num: 0, min: 0, max: 9}, // 尾和
    a3y: {num: 0, min: 0, max: 2}, // 和值除以3余数
    akd: {num: 0, min: 0, max: 5}, // 跨度
    an0: {num: 0, min: 0, max: 2}, // 1位除三
    an1: {num: 0, min: 0, max: 2}, // 2位除三
    an2: {num: 0, min: 0, max: 2} // 3位除三
  }
  var oar = ['ahz', 'awh', 'an0', 'an1', 'an2', 'akd']; // 用于判断数据元素颜色
  oar = oar.join('|,|');
  each(arr, function ( i, num ) {
    if ( num%2 === 0 ) {
      obj.aos.num += 1;
    } else {
      obj.ajs.num += 1;
    }
    if ( num > 3 ) {
      obj.ads.num += 1;
    } else {
      obj.axs.num += 1;
    }
    obj.ahz.num += num;
  });
  obj.an0.num = arr[0]%3;
  obj.an1.num = arr[1]%3;
  obj.an2.num = arr[2]%3;
  obj.akd.num = Math.max.apply(null, arr) - Math.min.apply(null, arr);
  obj.awh.num = parseInt(((obj.ahz.num + '').substr(-1)));
  obj.a3y.num = obj.ahz.num%3;
  function fn1 ( min, max, k, num ) {
    var o = {};
    each((max - min + 1), function ( i ) {
      getYl(o, k, ('a' + (i + min)), prev_o);
    });
    if ( oar.indexOf(k) >= 0 ) { // 需要用到不同号的数量，决定元素颜色
      o[('a' + num)] = [num, ntongNum(arr)];
    } else {
      o[('a' + num)] = [num, 1];
    }
    return o;
  }
  var rnobj = {};
  var an012 = null;
  each(obj, function ( k, o ) {
    rnobj[k] = fn1(o.min, o.max, k, o.num);
    rnobj[k]['cnum'] = o.num;
    if ( k === 'an0' ) {
      an012 = [obj.an0.num, obj.an1.num, obj.an2.num];
    }
  });
  rnobj.an012 = get012(an012);
  return rnobj;
}

// 获取012余数比
function get012 (arr) {
  var an012 = [0, 0, 0];
  each(arr, function (i, n) {
    switch (n) {
      case 0:
        an012[0] += 1;
        break;
      case 1:
        an012[1] += 1;
        break;
      case 2:
        an012[2] += 1;
        break;
    }
  });
  return an012;
}

// 获取不同号的数量
function ntongNum (arr) {
  var or1 = {};
  var l = 0;
  var s = '';
  each(arr, function (ai, an) {
    s = 'a' + an;
    if ( or1[s] ) {
      or1[s] += 1;
    } else {
      or1[s] = 1;
    }
  });
  each(or1, function (k, v) {
    l++;
  });
  return l;
}

// 获取遗漏值
// getYl(o2, 'ahf', ('a' + (i + 1)), prev_o);
function getYl ( o, k1, k2, po ) {
  if ( po && po[k1][k2][1] === 0 ) {
    o[k2] = [po[k1][k2][0] + 1, 0];
  } else {
    o[k2] = [1, 0];
  }
}
// 组合走势
function getAzh (arr, prev_o) {
  var ar1 = [11,22,33,44,55,66,12,13,14,15,16,23,24,25,26,34,35,36,45,46,56];
  var ar2 = [[arr[0], arr[1]], [arr[0], arr[2]], [arr[1], arr[2]]];
  var ar2h = 0;
  var o1 = {};
  var s = '';
  var astr = ar1.join(',');
  each(ar1, function ( i, num ) {
    s = 'a' + num;
    getYl(o1, 'azh', s, prev_o);
  });
  each(ar2, function (i) {
    ar2h = parseInt(Math.min.apply(null, ar2[i]) + '' + Math.max.apply(null, ar2[i]))
    s = 'a' + ar2h;
    o1[s] = [ar2h, 1];
  });
  return o1;
}

// 获取形态
function getAxt (arr, prev_o) {
  var o2 = {};
  var l = ntongNum(arr);
  each(4, function ( i ) {
    getYl(o2, 'axt', ('a' + i), prev_o);
  });
  // 1 三同号，2三不同号，3二同号，4二不同号
  if ( l === 3 ) {
    o2.a1 = ['三不同号', 2];
    o2.a3 = ['二不同号', 4];
  } else if ( l === 2 ) {
    o2.a2 = ['二同号', 3];
    o2.a3 = ['二不同号', 4];
  } else if ( l === 1 ) {
    o2.a0 = ['三同号', 1];
    o2.a2 = ['二同号', 3];
  }
  return o2;
}

// 获取开奖号码分布图
function getAhf (arr, prev_o) {
  var o1 = {}; // 号码解析
  var o2 = {}; // 遗漏值数据
  var s = '';
  // 定义号码的数据
  // [2, 2] 第一个表示号码或者遗漏值
  //第二个表示这一期中有几个这个号码，如果是遗漏值则为0
  each(arr, function ( i, num ) {
    s = ('a' + num);
    if ( o1[s] ) {
      o1[s][1] += 1;
    } else {
      o1[s] = [num, 1];
    }
  });
  each(6, function ( i ) {
    getYl(o2, 'ahf', ('a' + (i + 1)), prev_o);
  });
  return extend(o2, o1);
}
