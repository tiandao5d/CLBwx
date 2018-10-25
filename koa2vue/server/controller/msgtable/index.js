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

class MsgTable extends sql {
  constructor () {
    super(sqlcg)
    this.tableName = 'message'
    // 用户表的字段名对比，将数据的key值转为当前对象的val, 转到数据库用的
    this.table_k_f = {
      id: 'ID',
      sender: 'SENDER',
      receiver: 'RECEIVER',
      message: 'MESSAGE',
      tt: 'TT'
    }
    // 用户表的字段名对比，将数据的key值转为当前对象的val, 转到客户端用的
    this.table_k_k = this.kvvk(this.table_k_f)

  }
  // 获取信息数据
  // 参数为发送者，接收者的ID
  async getMsg ( op = {} ) {
    op = this.keyformat([op], this.table_k_f)[0]
    if ( !op ) {
      return jsk.returnMsg(20405)
    }
    let ws = ` WHERE (SENDER=${op.SENDER} AND RECEIVER=${op.RECEIVER}) OR (SENDER=${op.RECEIVER} AND RECEIVER=${op.SENDER})`
    if ( op.MESSAGE ) {
      ws = `(${ws}) AND MESSAGE LIKE '%${op.MESSAGE}%'`
    }
    let sqlstr = this.sqlquery(this.tableName, ws, 'ID')
    let rd = await this.xquery(sqlstr)
    // 解析数据库数据，就是把数据库字段转换为前端使用字段
    rd.result = this.keyformat(rd.result, this.table_k_k)
    return rd
  }

  // 写入信息数据
  // 参数为发送者，接收者的ID
  async addMsg ( op ) {
    op = this.keyformat([op], this.table_k_f)[0]
    if ( !op ) {
      return jsk.returnMsg(20405)
    }
    let sqlstr = this.sqladd(this.tableName, op)
    let rd = await this.xquery(sqlstr)
    return rd
  }
}

module.exports = new MsgTable()
