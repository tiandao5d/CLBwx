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

class FriendTable extends sql {
  constructor () {
    super(sqlcg)
    this.tableName = 'friend'
    // 用户表的字段名对比，客户端转服务端用
    this.table_k_f = {
      id: 'ID',
      sender: 'SENDER',
      receiver: 'RECEIVER',
      tt: 'TT'
    }
    // 数据库 服务端转到客户端用
    this.table_k_k = this.kvvk(this.table_k_f)
  }
  // 用户查询
  // 查询用户的好友
  async getfriend ( op = {} ) {
    op = this.keyformat([op], this.table_k_f)[0]
    if ( !op ) { // 只判断字段是否存在于数据库中，不判断是否少了字段
      return jsk.returnMsg(20405)
    }
    let sqlstr = ''
    if ( op.RECEIVER ) {
      sqlstr = `
        SELECT u.ID AS id, u.PHOTO AS photo,  u.USERNAME AS userName, u.TT AS tt
        FROM friend AS f
        WHERE RECEIVER=${op.RECEIVER}, SENDER=${op.SENDER}
      `
    } else {
      sqlstr = `
        SELECT u.ID AS id, u.PHOTO AS photo,  u.USERNAME AS userName, u.TT AS tt
        FROM friend AS f
        INNER JOIN tbl_user_info AS u
        ON u.ID=f.RECEIVER AND f.SENDER=${op.SENDER}
      `
    }
    let rd = await this.xquery(sqlstr)
    return rd
  }
  // 添加好友
  // 查询用户的好友
  async addfriend ( op = {} ) {
    op = this.keyformat([op], this.table_k_f)[0]
    if ( !op ) { // 只判断字段是否存在于数据库中，不判断是否少了字段
      return jsk.returnMsg(20405)
    }
    op.TT = jsk.ftt()
    let sqlstr = this.sqladd(this.tableName, op)
    let rd = await this.xquery(sqlstr)
    if ( rd.code >= 80000 ) {
      rd.result = 'success'
    }
    return rd
  }

}

module.exports = new FriendTable()
