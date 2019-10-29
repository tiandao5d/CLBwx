// 本地存储的所有数据，为了避免全局污染

const storageKey = { // 浏览器本地缓存的数据存储常量
    GLOBAL_LANGUAGE_LOCALSTORAGE: 'GLOBAL_LANGUAGE_LOCALSTORAGE', // 全局使用的语言切换
    GLOBAL_USER_LOGIN_INFO: 'GLOBAL_USER_LOGIN_INFO', // 登录信息
    GLOBAL_MAP_ZOOM_CENTER: 'GLOBAL_MAP_ZOOM_CENTER' // 记录地图的层级和中心
}

// 语言数据存取
export function languageL(obj) {
    let res = lggl(storageKey.GLOBAL_LANGUAGE_LOCALSTORAGE, obj);
    if ( obj ) {
        return obj;
    }
    if ( res ) {
        return res;
    }
    return {
        language: (navigator.language + '').toLocaleLowerCase().replace(/[^a-zA-Z]+/g, '_')
    }
}

// 用户数据存取
export function userInfoL(obj) {
    return lggl(storageKey.GLOBAL_USER_LOGIN_INFO, obj);
}

// 地图数据存取
export function mapOptionsL(obj) {
    return lggl(storageKey.GLOBAL_MAP_ZOOM_CENTER, obj);
}

// 都存在'lggl'的字段之中，减少全局污染
function lggl(k, obj) {
    let tk = 'lggl';
    let l = storageL(tk) || {};
    if ( obj ) {
        l[k] = obj;
        storageL(tk, l);
        return obj;
    }
    return l[k];
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