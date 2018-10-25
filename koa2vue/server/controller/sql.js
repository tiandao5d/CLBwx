/**
创建一个数据库的连接池
对相应的数据库，表统一连接和断开
*/
"use strict"
const mysql = require('mysql')

class sql {
  constructor ( sqlconfig = {} ) {
    this.sqlconfig = sqlconfig
    this.pool = mysql.createPool(sqlconfig) // 创建连接池
  }
  // 用于字段反向
  kvvk (obj) {
    let o = {}
    jsk.each(obj, (k, v) => {
      o[v] = k
    })
    return o
  }

  // 对照表数据转换
  keyformat ( arr, obj ) {
    let newarr = []
    let co = null
    let err = false
    jsk.each(arr, ( i, o ) => {
      co = {}
      jsk.each(o, ( k, v ) => {
        if ( !obj[k] ) {
          err = true
          return false
        }
        co[obj[k]] = v
      })
      if ( err ) {
        newarr = []
        return false
      }
      newarr[newarr.length] = co
    })
    return newarr
  }

  // 获取连接
  // 连接池，mysql配置
  getConnection () {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {throw err}
        resolve(connection)
      })
    })
  }
  // 查询数据库
  // sqlstr 用于查询的sql语句
  // connection 数据库连接对象
  searchSql ( sqlstr, connection ) {
    return new Promise((resolve, reject) => {
  	  if ( !sqlstr ) {
  	  	resolve(this.getRd({err: {errcode: 20405}, result: null}))
  	  }
  	  connection.query(sqlstr, (err, result) => {
        connection.release()
        if ( err ) {
          err.errcode = 20405
        }
  	  	resolve({err, result})
  	  })
    })
  }
  // 外部获取数据库指定条数
  // tablename 表名
  // num 数字或's, n' '开始索引, 条数'
  async xline ( tablename, num ) {
    let sqlstr = `SELECT * FROM ${tablename} LIMIT ${num || 1}`
    return await this.xquery(sqlstr)
  }

  // 返回指定条件的行数
  async xcount ( tablename, obj ) {
    let ws = this.sqlwhere(obj)
    let sqlstr = `SELECT COUNT(ID) AS num FROM ${tablename + ws}`
    let o = await this.xquery(sqlstr, true)
    o = o.result[0] || {};
    return  o.num || 0
  }

  // 外部查询修改等
  // sqlstr 用于查询的sql语句
  async xquery ( sqlstr ) {
    // 获取数据库连接
    let connection = await this.getConnection()
    let cobj = null
    // {err, result} 数据库查询后获得返回值格式
    if ( arguments[2] === true ) {
      cobj = await this.searchSql(sqlstr, connection)
    } else {
      cobj = jsk.returnMsg(await this.searchSql(sqlstr, connection))
    }
    if (cobj.err || (cobj.code && cobj.code < 80000) ) {
      jsk.clog(sqlstr, new Error())
    }
    return cobj
  }

  // 查询语句数据格式化
  sqlwhere ( data ) {
  	let str = ''
    let dtype = jsk.getType(data)
  	if ( dtype === 'function' ) {
  		str = data()
  	} else if ( dtype === 'string' ) {
  		str = data
  	} else if ( dtype === 'object' ) {
  		if ( data.id ) { // 有id存在就不管其他的鬼
  			str = ' WHERE id=' + data.id
  		} else {
  			let k, arr = [], vtype = ''
  			let _or = data._or
  			delete data._or
  			for ( k in data ) {
          vtype = typeof data[k]
  				if ( vtype === 'string' ) {
  					arr[arr.length] = k + '=\'' + data[k] + '\''
  				} else if ( vtype === 'number' ) {
  					arr[arr.length] = k + '=' + data[k]
  				} else if ( vtype === 'object' ) {
            arr[arr.length] = k + data[k].joinstr + '\'' + data[k].val + '\''
          }
  			}
  			str = _or ? arr.join(' OR ') : arr.join(' AND ')
  			str = str && (str ? (' WHERE ' + str) : '')
  		}
  	}
  	return str
  }

  // 更新语句数据格式化
  sqlset ( data ) {
  	let str = ''
    let dtype = jsk.getType(data)
  	if ( dtype === 'function' ) {
  		str = data()
  	} else if ( dtype === 'string' ) {
  		str = data
  	} else if ( dtype === 'object' ) {
  		if ( data.id ) { // 有id存在就不管其他的鬼
  			delete data.id
  		}
  		let k, arr = []
  		for ( k in data ) {
  			if ( typeof data[k] === 'string' ) {
  				arr[arr.length] = k + '=\'' + data[k] + '\''
  			} else if ( typeof data[k] === 'number' ) {
  				arr[arr.length] = k + '=' + data[k]
  			}
  		}
  		str = arr.join(', ')
  		str = str && (str ? (' SET ' + str) : '')
  	}
  	return str
  }
  // 查找语句基本
  // 表名称，查询条件，排序
  // SELECTSE  * FROM Websites WHERE country='CN'
  sqlquery ( _tname, _where, _orderby ) {
  	let ns = _tname
  	let ws = this.sqlwhere(_where)
  	let os = (_orderby ? (' ORDER BY ' + _orderby) : '')
  	if ( ns ) {
  		return `SELECT * FROM ${ ns + ws + os }`
  	}
  	return ''
  }
  // 添加语句基本
  // 表名称，查询条件
  // INSERT INTO Websites (name, url, alexa)
  // VALUES ('百度','https://www.baidu.com/','4')
  sqladd ( _tname, _valobj ) {
  	let ns = _tname
  	let k
  	let ks = [], vs = []
  	for ( k in _valobj ) {
  		ks[ks.length] = k
  		vs[vs.length] = '\'' + _valobj[k] + '\''
  	}
  	ks = ks ? ( '(' + ks.join(', ') + ')') : ''
  	vs = vs ? ( '(' + vs.join(', ') + ')') : ''
  	if ( ns && ks && vs ) {
  		return `INSERT INTO ${ ns + ' ' + ks + ' VALUES ' + vs }`
  	}
  	return ''
  }

  // 更新语句基本
  // 表名称，更新的字段，查询条件
  // UPDATE Websites
  // SET alexa='5000', country='USA'
  // WHERE id=1
  sqlupdata ( _tname, _setdata, _where ) {
  	let ns = _tname
  	let ws = this.sqlwhere(_where)
  	let ss = this.sqlset(_setdata)
  	if ( ns && ws && ss ) {
  		return `UPDATE ${ ns + ss + ws }`
  	}
  	return ''
  }
  // 删除语句基本
  // 表名称，查询条件
  // DELETE FROM Websites
  // WHERE name='百度' AND country='CN'
  sqldelete ( _tname, _where ) {
  	let ns = _tname
  	let ws = this.sqlwhere(_where)
  	if ( ns && ws ) {
  		return `DELETE FROM ${ ns + ws }`
  	}
  	return ''
  }
}


module.exports = sql
