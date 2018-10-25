/**
	作用：前端接口返回数据格式化，统一化
	code 大于等于80000 表示成功数据
	code 大于等于10000 表示失败数据
*/

"use strict"
const failarr = [
	{code: 10000, result: 'failure', txt: '未知错误'},
	{code: 10001, result: 'failure', txt: '操作失败'},
	{code: 10002, result: 'failure', txt: '用户名已存在'},
	{code: 10003, result: 'failure', txt: '地址错误'},
	{code: 10004, result: 'failure', txt: 'id数据不存在'},
	{code: 10005, result: 'failure', txt: '用户名或密码错误'},
	{code: 10006, result: 'failure', txt: '查询的数据不存在'},
	{code: 10007, result: 'failure', txt: '无效签字'},
	{code: 10008, result: 'failure', txt: '重复添加'},


	{code: 20405, result: 'failure', txt: '参数错误'},
	{code: 80000, result: 'success', txt: '操作成功'}
]
const failobj = {}
failarr.forEach((o) => {
	failobj[('a' + o.code)] = o
})
// 数据返回统一管理
class RdFormat {
	constructor () {
		this.failobj = failobj
	}
	// 获取错误代号数据
	getFail ( fail ) {
		return this.failobj[fail] || this.failobj['a10000']
	}
	// 数据格式化
	sussFormat ( msg ) {
		let obj = null
		if ( typeof msg === 'string' ) {
			obj = this.getFail(msg)
		} else if ( typeof msg === 'number' ) {
			obj = this.getFail('a' + msg)
		} else if ( typeof msg === 'object' && (msg.result === 'success' || msg.result === 'failure') ) {
			obj = msg
		} else if ( typeof msg === 'function') {
			return this.sussFormat(msg())
		}
		return obj || {...failobj['a80000'], result: msg}
	}
}
module.exports = new RdFormat()
