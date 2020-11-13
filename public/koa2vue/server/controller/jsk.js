/**
全局公用的js库
常用的处理
*/

"use strict"
const rdf = require('./rdFormat')
class Jsk {
	constructor () {
		this.logid = 0;
	}
	// 获取数据类型，返回类似'object' 'function'
	getType ( data ) {
		return Object.prototype.toString.call(data).slice(8, -1).toLowerCase()
	}
	// 时间戳转换
	ftt ( tt = ((+new Date()) + '') ) {
		return parseInt(tt.substr(0, 10))
	}
	// 数据返回统一处理
	// kudata两个字段，{err, result}
	returnMsg ( kudata ) {
		let sendobj = null
		if ( this.getType(kudata) === 'number' ) {
			sendobj = rdf.sussFormat(kudata)
		} else if ( kudata && kudata.err ) {
			sendobj = rdf.sussFormat(kudata.err.errcode)
		} else {
			sendobj = rdf.sussFormat(kudata.result)
		}
		return sendobj
	}
	// 打印到控制台
	clog ( ...args ) {
		this.logid++
		let newerr = args.pop()
		let s1 = `(${this.logid}) ======================= start ======================== (${this.logid})`
		let s2 = ''
		let s3 = []
		let s4 = `(${this.logid}) =======================  end  ======================== (${this.logid})`
		try {
			s2 = `log文件地址：${newerr.stack.replace(/\s+/g, ' ').split(' at ')[1]}\n\nlog内容如下：`
		}catch(err){}
		try {
			s3 = (() => {
				let type = ''
				this.each(args, (i, o) => {
					type = this.getType(o)
					s3[s3.length] = type === 'object' ? JSON.stringify(o) : o + ''
				})
				return s3.join('\n\n')
			})()
		}catch(err){}
		let errarr = [s1, s2, s3, s4]
		console.log(errarr.join('\n\n'))
	}
	each ( data, fn ) {
		let dtype = this.getType(data)
		let k, v, lgn
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
	// 格式化返回的字段或需要去查询的字段
	// arr必须是数组
	// obj为需要用于转换的对象
	keyformat ( arr, obj ) {
	  let newarr = []
	  let co = null
	  jsk.each(arr, ( i, o ) => {
	    co = {}
	    jsk.each(o, ( k, v ) => {
	      co[obj[k]] = v
	    })
	    newarr[newarr.length] = co
	  })
	  return newarr
	}
}

module.exports = new Jsk()
