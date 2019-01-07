/**
作用：首页的路由
**/
'use strict';
const config = require('../config');
const fsql = require('./fsql.js');
const frandom = require('./frandom.js');
module.exports =  (router) => {
  // router.get('/welcome', async function (ctx, next) {
  //   ctx.state = {
  //     title: 'koa2 title'
  //   };
  //   await ctx.render('welcome', {title: ctx.state});
  // })
  if ( config.usesql ) {
    fsql(router); // 数据库模式的福彩3d
  } else {
    frandom(router); // 伪造数据或者一次性形式的福彩3d
  }
}
