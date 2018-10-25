/**
针对某个数据库的操作
*/
"use strict"
const sql = require('../sql') // 常用sql整理统一返回
const cg = require('../configG') // 数据库配置
const sqlcg = {
  host: cg.host,
  user: cg.user,
  password: cg.password,
  port: cg.port,
  database: 'xl_chat'
}

class UserTable extends sql {
  constructor () {
    super(sqlcg)
    this.tableName = 'tbl_user_info'
    // 用户表的字段名对比，客户端转服务端用
    this.table_k_f = {
      id: 'ID',
      userName: 'USERNAME',
      password: 'PASSWORD',
      photo: 'PHOTO',
      token: 'TOKEN',
      tt: 'TT',
      loginTt: 'LOGINTT'
    }
    // 数据库 服务端转到客户端用
    this.table_k_k = this.kvvk(this.table_k_f)
  }
  // 注册
  async register ( op = {} ) {
    op = this.keyformat([op], this.table_k_f)[0]
    if ( !op ) { // 只判断字段是否存在于数据库中，不判断是否少了字段
      return jsk.returnMsg(20405)
    }
    // 查询时候已经有这个用户
    let num = await this.xcount(this.tableName, {USERNAME: op.USERNAME})
    if ( num > 0 ) {
      return jsk.returnMsg(10002)
    }
    // 可以正式注册
    op.TT = jsk.ftt()
    let sqlstr = this.sqladd(this.tableName, op)
    return await this.xquery(sqlstr)
  }

  // 登录
  async login ( op = {} ) {
    op = this.keyformat([op], this.table_k_f)[0]
    if ( !op ) { // 只判断字段是否存在于数据库中，不判断是否少了字段
      return jsk.returnMsg(10005)
    }
    // 查询数据库是否存在此用户
    let sqlstr = this.sqlquery(this.tableName, op)
    let rd = await this.xquery(sqlstr)
    if ( !rd.result[0] ) {
      return global.jsk.returnMsg(10005)
    }
    // 解析数据库数据，就是把数据库字段转换为前端使用字段
    rd.result = this.keyformat(rd.result, this.table_k_k) // 对照表数据转换
    return rd
  }

  // 设置用户信息
  async setUserInfo ( op = {}, id = 0 ) {
    op = this.keyformat([op], this.table_k_f)[0]
    if ( !op ) { // 只判断字段是否存在于数据库中，不判断是否少了字段
      return jsk.returnMsg(20405)
    }
    let sqlstr = this.sqlupdata(this.tableName, op, {ID: id})
    let rd = await this.xquery(sqlstr)
    return rd
  }

  // 用户查询
  // 支持用户名和id查询，用户名可以是模糊查询
  async getuser ( op = {} ) {
    let sqlstr = ''
    if ( op.id ) {
      sqlstr = this.sqlquery(this.tableName, {ID: op.id})
    } else if ( op.userName ) {
      sqlstr = `SELECT * FROM tbl_user_info WHERE USERNAME LIKE '%${op.userName}%'`
    }
    let rd = await this.xquery(sqlstr)
    // 解析数据库数据，就是把数据库字段转换为前端使用字段
    rd.result = this.keyformat(rd.result, this.table_k_k)
    return rd
  }
}

module.exports = new UserTable()
