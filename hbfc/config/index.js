module.exports = {
  port: 3000,
  sql: { // 用于数据库的配置
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'test'
  },
  // 获取数据的接口
  // gameId":9,"realIssue":3116,"showIssue":"190101074","winNum":"123"
  // 游戏id  流水号  销售期号 开奖号码 190107043
  getNumsUrl: 'http://39.105.48.233:8015/ips/game/getK3WinNumInfo?count=500',
  // getNumsUrl: 'http://localhost:3000/123.json',
  getNumsType: 'get', // 请求方式
  usesql: false // 用于判断是否使用数据库方式
}
