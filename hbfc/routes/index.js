/**
作用：首页的路由
**/
const fsql = require('./fsql.js');
const frandom = require('./frandom.js');
module.exports =  (router) => {
  // router.get('/welcome', async function (ctx, next) {
  //   ctx.state = {
  //     title: 'koa2 title'
  //   };
  //   await ctx.render('welcome', {title: ctx.state});
  // })
  fsql(router); // 数据库模式的福彩3d
  frandom(router); // 伪造数据或者一次性形式的福彩3d
}

function yyy() {
  return new Promise(function(resolve, reject) {
    setTimeout(() => {
      resolve(123)
    }, 1000);
  });
}
async function ddd () {
  let a = await yyy();
  console.log(a);
  return '456'
}
