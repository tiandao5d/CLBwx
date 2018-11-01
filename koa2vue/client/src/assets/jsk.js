/**
全局公用的js库
常用的处理
*/

"use strict"
import { Message } from 'element-ui';
// import md5 from 'js-md5'
import axios from 'axios'
import qs from 'qs'
import io from 'socket.io-client'
function getDm () {
  return 'http://172.16.46.65:3000'
}
// axios请求报错处理
function axioserr ( err ) {
  return err || {}
}
  // 签字
function ajaxSignature ( url, token, userId ) {
  let u1 = url.substr(0,1)
  let dm = getDm()
  if ( u1 === '/' ) {
    return `${dm + url + (url.indexOf('?') > 0 ? '&' : '?')}token=${token}&id=${userId}`
  } else if ( u1 === '@' ) {
    return (dm + url.substr(1))
  }
}
class Jsk {
	constructor () {
    this.regExpPhone = /^1(3|4|5|7|8)\d{9}$/, // 手机正则表达式
    this.regExpPwd = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,15}$/, // 密码正则表达式，6-15位字母数字混合
    this.regExpName = /^[\u4E00-\u9FA5]{2,15}$/, // 人名正则表达式，只能是汉字
    this.regExpIDNO = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/, // 身份证正则表达式，二代身份证
    // 本地储存数据命名方式（前缀）
    // localStorage 全局使用前缀ls_global_，局部使用前缀ls_partly_
    // sessionStorage 全局使用前缀ss_global_，局部使用前缀ss_partly_
    this.userId = 'ls_global_user_id' // 记录用户ID
    this.token = 'ls_global_token' // 记录用户token值
    this.userName = 'ls_global_user_name' // 记录用户登录时用的账号
    this.userData = 'ls_global_user_data' // 记录用户所有数据
    this.userFlist = 'ls_global_user_flist' // 好友列表
    this.userFids = [] // 存储所有好友的id
    this.domainUrl = getDm()
    this.vcmStr = 'vcall_rtcmsg' // 视频通话的全局websocket事件名
	}

  addf ( uobj ) {
    if ( this.getType(uobj) === 'array' ) {
      this.storageL(this.userFlist, uobj)
      this.userFids = uobj.map((o) => {
        return o.id
      })
      return false
    }
    let userFlist = this.storageL(this.userFlist) || []
    if ( !(userFlist.some((o) => {return (o.id === uobj.id)})) ) {
      userFlist.push(uobj)
      this.userFids = userFlist.map((o) => {
        return o.id
      })
      this.storageL(this.userFlist, userFlist)
    }
  }

  getf ( id ) {
    let userFlist = this.storageL(this.userFlist) || []
    if ( !id ) {
      return userFlist
    } else if ( userFlist.length === 0 ) {
      return {}
    }
    let obj = userFlist.filter((o) => {
      return o.id === id
    })
    return obj[0]
  }

	// 获取数据类型，返回类似'object' 'function'
	getType ( data ) {
		return Object.prototype.toString.call(data).slice(8, -1).toLowerCase()
	}

  userDataL () {
    let obj = arguments[0]
    if ( typeof obj === 'object' ) {
      this.storageL(this.userData, obj)
      return obj
    }
    return this.storageL(this.userData) || {}
  }

  // 合并对象
  extend (...ags) {
    Object.assign(...ags)
  }

  // 循环函数
	each ( data, fn ) {
		let dtype = this.getType(data)
		let k, lgn
		if ( dtype === 'array' ) {
			lgn = data.length
			for ( k = 0; k < lgn; k++ ) {
				if ( fn( k, data[k] ) === false ) {
					break
				}
			}
		} else if ( dtype === 'object' ) {
			for ( k in data ) {
				if ( fn( k, data[k] ) === false ) {
					break
				}
			}
		}
	}
  // 判断是否是空对象
  isEmptyObject ( obj ) {
    if ( !(obj instanceof Object) ) {
      return false
    }
    for ( let v in obj ) {
      return false
    }
    return true
  }
  // 储存数据，有第三个参数，布尔值表示是否是session储存，默认为local储存
  // 不存储undefined和null
  storageL (key, val) {
    if ( typeof(Storage) !== 'undefined' ) {
      if ( (val === undefined) || (val === null) ) { // 不存储undefined和null
        if ( arguments[2] === true ) {
          val = sessionStorage[key]
        } else {
          val = localStorage[key]
        }
        if ( val && val.indexOf('obj-') === 0 ) {
          val = val.slice(4)
          return JSON.parse(val)
        } else {
          return val
        }
      } else {
        let a = val
        if ( val instanceof Object ) {
          val = 'obj-' + JSON.stringify(val)
        } else {
          val = val + ''
        }
        if ( arguments[2] === true ) {
          sessionStorage[key] = val
        } else {
          localStorage[key] = val
        }
        return a
      }
    }
  }
  rmStorageL (key) {
    if ( typeof(Storage) !== 'undefined' && key ) {
      if ( arguments[1] === true ) {
        sessionStorage.removeItem(key)
      } else {
        localStorage.removeItem(key)
      }
    }
  }
  rmStorageLAll () {
    if ( typeof(Storage) !== 'undefined' ) {
      if ( arguments[0] === true ) {
        sessionStorage.clear()
      } else {
        localStorage.clear()
      }
    }
  }
  //是否是在微信中
  isWeixin () {
    let ua = navigator.userAgent.toLowerCase()
    if ( ua.indexOf('micromessenger') >= 0 ) {
      return true
    }
    return false
  }
  // 连接参数格式化
  deCodeUrl (str = document.URL) {
    str = str.split('?')[1] || ''
    str = str.split('#')[0] || ''
    let a = {}
    if ( str ) {
      let b = str.split('&'),
        i = 0, s
      while (b[i]) {
        s = b[i].split('=')
        a[s[0]] = s[1]
        i++
      }
    }
    return a
  }
  // 时间格式化
  msToTime (ms){
    if(!ms){return ''}
    let _date = (ms instanceof Date) ? ms : new Date(ms)
    let _y = _date.getFullYear(),
        _m = _date.getMonth() + 1,
        _d = _date.getDate(),
        _h = _date.getHours(),
        _i = _date.getMinutes(),
        _s = _date.getSeconds()
    let a = {
          _y: (_y < 10) ? ('0' + _y) : (_y + ''),
          _m: (_m < 10) ? ('0' + _m) : (_m + ''),
          _d: (_d < 10) ? ('0' + _d) : (_d + ''),
          _h: (_h < 10) ? ('0' + _h) : (_h + ''),
          _i: (_i < 10) ? ('0' + _i) : (_i + ''),
          _s: (_s < 10) ? ('0' + _s) : (_s + '')
        }
    a.em = (a._y + '-' + a._m)
    a.ed = (a.em + '-' + a._d)
    a.eh = (a.ed + ' ' + a._h)
    a.ei = (a.eh + ':' + a._i)
    a.es = (a.ei + ':' + a._s)
    a.ms = _date.getTime()
    a['date'] = _date
    return a
  }
  // 打开页面
  openPage ( url ) {
    if ( url ) {
      window.location.href = url
    }
  }
  loading ( status, txt = '' ) {
    let box = document.querySelector('.loading_box_show')
    if ( status === 'hide' ) {
      if ( box ) {box.classList.add('hide')}
      return false
    }
    if ( box && status === 'show' ) {
      box.classList.remove('hide')
      if ( typeof txt === 'string' ) {
        box.querySelector('.loading-box-text').innerHTML = txt
      }
      return false
    }
    let str =
        `<div class="loading-con">
          <div class="loading-rotate-img"></div>
        <div class="loading-box-text">${txt}</div>
        </div>`
    box = document.createElement('div')
    box.className = 'loading_box_show loading-box'
    box.innerHTML = str
    document.body.appendChild(box)
  }
  // 返回一个带有用户ID的字符串
  // 如果str不存在则返回纯数字的用户id
  getUserId ( str = '' ) {
    let userId = parseInt(this.storageL(this.userId))
    if ( userId ) {
      if ( str ) {
        return str + '' + userId
      } else {
        return userId
      }
    } else {
      return str
    }
  }

  // 提示内容
  toast ( msg = '没有内容', type = 1, ms = 3000 ) {
    let types = ['success', 'warning', 'info', 'error']
    Message({
      message: msg,
      type: types[type - 1],
      duration: ms,
      customClass: 'elui-message'
    })
  }

  // ajax请求
  // 调用时可以是回调函数方式，可以是异步函数方式
  async ajax ( _url, _method, _data, fn, ispros ) {
    let op = {
      method: 'get',
      timeout: 10000
    }
    let load = true // 用于判断加载进度是否执行了
    ispros = arguments[arguments.length - 1]
    let arg0 = arguments[0]
    let atype = this.getType(arg0)
    let susobj = null // 返回
    let axobj = null // axios返回数据
    if ( ispros ) { // 是否显示加载进度
      setTimeout(() => { // 如果300ms内返回数据，不用执行加载进度，增强用户体验
        if ( load ) {
          this.loading('show', this.getType(ispros) === 'string' ? ispros : '')
        }
      }, 300)
    }
    if ( atype === 'array' || atype === 'object' ) {
      fn = arguments[1] || function () {}
    }
    // 多请求和单请求分开
    if ( atype === 'array' ) {
      let ps = arg0.map((o) => {
        o.data = qs.stringify(o.data) // axios问题，必须转换
        o.url = ajaxSignature(o.url, this.storageL(this.token), this.storageL(this.userId)) // 缩略地址解析拼接
        return axios({...op, ...o})
      })
      axobj = await Promise.all(ps).catch(axioserr)
    } else {
      if ( atype === 'string' ) {
        op.url = _url
        op.method = _method || 'get'
        if ( _data ) {
          op.data = _data
        }
      } else if ( atype === 'object' ) {
        this.extend(op, arg0)
      }
      op.url = ajaxSignature(op.url, this.storageL(this.token), this.storageL(this.userId)) // 缩略地址解析拼接
      op.data = qs.stringify(op.data) // axios问题，必须转换
      axobj = await axios(op).catch(axioserr)
    }
    if ( ispros && load ) { // 是否显示加载进度
      load = false
      this.loading('hide')
    }
    // 多请求和单请求分开
    let issigna = true
    if ( atype === 'array' ) {
      susobj = axobj.map((o) => {
        return o.data || {}
      })
      if ( susobj.some((o) => {return (o.code === 10007)}) ) { // 无效的签字
        issigna = false
      }
    } else {
      susobj = axobj.data || {}
      if ( susobj.code === 10007 ) { // 无效的签字
        issigna = false
      }
    }
    if ( issigna ) {
      fn(susobj) // 外部调用可以使用回调函数
      return susobj // 外部调用可以使用异步函数
    }
    location.hash = '#/login'
  }
}
const jsk = new Jsk()
const chat = io(`${getDm()}/chat`)
export default ( Vue ) => {
  Vue.prototype.$chat = chat
  Vue.prototype.$jsk = jsk
}
