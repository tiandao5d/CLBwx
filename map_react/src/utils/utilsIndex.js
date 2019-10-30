// 自定义的全局方法调用
import { fetch } from 'whatwg-fetch';
import jsSHA from 'jssha';
import 'xxl-toast/dist/xlToast.css';
import XLToast from 'xxl-toast';
import { userInfoL } from './storage';
import { createHashHistory } from 'history';
export let toast = new XLToast();
const history = createHashHistory();

// 判断变量属性的比较安全方法，可以判断出null，undefined，array，object，number，NaN
// gettype([]) // array
export function gettype(arg0) {
    var str = Object.prototype.toString.call(arg0).slice(8, -1).toLocaleLowerCase();
    if ((arg0 + '' === 'NaN') && (str === 'number')) {
        return 'NaN'
    }
    return str;
}

// 获取指定范围的随机正数，包含最大和最小值
// 参数为最小和最大数
export function randomNum(min, max) {
    min = parseInt(min) || 0;
    max = parseInt(max) || 9;
    return parseInt(Math.random() * (max - min + 1) + min);
}

// 随机获取数组中的任意值
export function randomArr(arr) {
    var min = 0;
    var max = arr.length - 1;
    return arr[randomNum(min, max)];
}

// 存储常量
// 请不要外部直接使用存储方法，以免污染全局
export const storageKey = { // 浏览器本地缓存的数据存储常量
    GLOBAL_LANGUAGE_LOCALSTORAGE: 'GLOBAL_LANGUAGE_LOCALSTORAGE', // 全局使用的语言切换
    GLOBAL_USER_LOGIN_INFO: 'GLOBAL_USER_LOGIN_INFO', // 登录信息
    GLOBAL_MAP_ZOOM_CENTER: 'GLOBAL_MAP_ZOOM_CENTER' // 记录地图的层级和中心
}

// 用于浏览器缓存
// val存在就是赋值，为null，undefined则是获取
// 默认存储方式为localstorage，如果传入第三个参数为true，则可以切换为sessionStorage
export function storageL(key, val) {
    if (typeof (Storage) !== 'undefined') {
        if ((val === undefined) || (val === null)) { //不存储undefined和null
            if (arguments[2] === true) {
                val = sessionStorage[key];
            } else {
                val = localStorage[key];
            }
            if (val && val.indexOf('obj-') === 0) {
                val = val.slice(4);
                return JSON.parse(val);
            } else {
                return val;
            }
        } else {
            var a = val;
            if (val instanceof Object) {
                val = 'obj-' + JSON.stringify(val);
            } else {
                val = val + '';
            }
            if (arguments[2] === true) {
                sessionStorage[key] = val;
            } else {
                localStorage[key] = val;
            }
            return a;
        }
    }
}

// 用于浏览器缓存的删除
// 默认存储方式为localstorage，如果传入第二个参数为true，则可以切换为sessionStorage
export function rmStorageL(key) {
    if (typeof (Storage) !== 'undefined' && key) {
        if (arguments[1] === true) {
            sessionStorage.removeItem(key);
        } else {
            localStorage.removeItem(key);
        }
    }
}

// 用于浏览器缓存，清空数据
// 默认存储方式为localstorage，如果传入第二个参数为true，则可以切换为sessionStorage
export function rmStorageLAll() {
    if (typeof (Storage) !== 'undefined') {
        if (arguments[0] === true) {
            sessionStorage.clear();
        } else {
            localStorage.clear();
        }
    }
}

class Request {
    constructor() {
        this.el = document.createElement('a');
    }
    async request(p = {}) {
        // 获取用户信息
        let userInfo = userInfoL();
        // method默认值为'get'转大写
        p.method = p.method || 'get';
        p.method = p.method.toLocaleUpperCase();
        // 补全url
        if (p.url.startsWith('/')) {
            p.url = locaObj.apiUrl + p.url;
        }
        // 传送的数据如果是对象将转为字符串
        p.body = typeof p.body === 'object' ? JSON.stringify(p.body) : (p.body + '');
        // 默认请求参数
        p.headers = Object.assign({
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json;charset=UTF-8',
            'X-Request-From': '1'
        }, (p.headers || {}));
        if (userInfo && !p.url.includes('/login')) {
            let kobj = this.getSecrets(p, userInfo);
            p.headers = Object.assign({
                'Authorization': ('Bearer ' + userInfo.token),
                'LG-Content-Sig': kobj.secrets,
                'LG-Timestamp': kobj.timestamp
            }, p.headers);
        }
        let url = p.url;
        delete p.url;
        return await fetch(url, p)
            .then(res => {
                if ( res.status === 401 || res.status === 403 ) {
                    history.push('/login');
                    return {};
                }
                try {
                    return res.json();
                } catch (err) {
                    return res.text();
                }
            }).catch(err => {
                return (err || {})
            })
    }
    // 获取加密数据
    getSecrets(p, userInfo) {
        let timestamp = Math.floor((Date.now() / 1000));
        let secrets = '';
        let shaObj = new jsSHA('SHA-256', 'TEXT');
        this.el.href = p.url;
        shaObj.setHMACKey(userInfo.secrets, 'TEXT');
        // console.log(`${p.method} ${this.el.pathname} ${timestamp}`);
        shaObj.update(`${p.method} ${this.el.pathname} ${timestamp}`);
        secrets = shaObj.getHMAC('HEX');
        return { secrets, timestamp };
    }
}
export async function login(p) {
    return request({
        url: '/login',
        method: 'post',
        body: JSON.stringify(p)
    }).then(res => {
        if (res && res.token) {
            return userInfoL(res);
        }
        return {};
    })
}
let req = new Request();
export const request = req.request.bind(req);


