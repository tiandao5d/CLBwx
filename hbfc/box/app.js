!function(n){var a={};function t(e){if(a[e])return a[e].exports;var r=a[e]={i:e,l:!1,exports:{}};return n[e].call(r.exports,r,r.exports,t),r.l=!0,r.exports}t.m=n,t.c=a,t.d=function(n,a,e){t.o(n,a)||Object.defineProperty(n,a,{configurable:!1,enumerable:!0,get:e})},t.r=function(n){Object.defineProperty(n,"__esModule",{value:!0})},t.n=function(n){var a=n&&n.__esModule?function(){return n.default}:function(){return n};return t.d(a,"a",a),a},t.o=function(n,a){return Object.prototype.hasOwnProperty.call(n,a)},t.p="",t.w={},t(t.s=19)}([function(n,a,t){const e=t(3);var r;function o(n,a){return new Promise((t,r)=>{e({method:a,uri:n},(n,a,e)=>{n?r(n):t(e)})})}function u(n,a){return n=parseInt(n)||0,a=parseInt(a)||9,parseInt(Math.random()*(a-n+1)+n)}function i(n){var a=Object.prototype.toString.call(n).slice(8,-1).toLocaleLowerCase();return n+""=="NaN"&&"number"===a?"NaN":a}function s(n,a){for(var t in a)n[t]=a[t];return n}function c(n,a){var t=i(n),e=0,r=0;if("array"===t)for(r=n.length,e=0;e<r&&!1!==a(e,n[e]);e++);else if("object"===t){for(e in n)if(!1===a(e,n[e]))break}else if("number"===t)for(e=0;e<n&&!1!==a(e);e++);}n.exports=((r={}).gettype=i,r.extend=s,r.each=c,r.reqp=o,r.randommm=u,r)},function(n,a){n.exports=require("koa-static")},function(n,a,t){"use strict";const{each:e,randommm:r}=t(0);var o;n.exports=((o={}).getNums=(async()=>await new Promise(function(n,a){var t=[],o=181213030;e(50,function(n){t.push({q:o++,n:[r(1,6),r(1,6),r(1,6)]})}),n(t)})),o)},function(n,a){n.exports=require("request")},function(n,a,t){"use strict";const{each:e,extend:r}=t(0),o=t(2);var u,i=null;function s(n,a){return m(n,a)}function c(n){var a=[...n].reverse(),t=function(){var n={},a={},t=0;return e({a3:["111"],a4:["112"],a5:["122","113"],a6:["222","114","123"],a7:["133","115","223","124"],a8:["116","233","224","125","134"],a9:["333","144","225","126","135","234"],a10:["244","226","334","136","145","235"],a11:["155","344","335","245","236","146"],a12:["444","255","336","345","246","156"],a13:["166","355","445","346","256"],a14:["266","455","446","356"],a15:["555","366","456"],a16:["466","556"],a17:["566"],a18:["666"]},function(a,r){var o=0;e(r,function(n,a){switch(h(a.split(""))){case 1:o+=1;break;case 2:o+=3;break;case 3:o+=6}}),n[a]=o,t+=o}),e(n,function(n,e){a[n]=e/t}),a}(),r={},o={},u=0,i="",s=null,c=a.length;return e(16,n=>{r[i="a"+(n+3)]={h:n+3,lastqo:a[0],als:t[i]*c,ass:0,a3y:{a0:0,a1:0,a2:0,a3:0===a[0].ahz[i][1]?a[0].ahz[i][0]:0,a4:0,a5:0},a3q:{a0:0,a1:0,a2:0}},o[i]={n:0,max:r[i].a3y.a3}}),e(a,(n,t)=>{u=t.ahz.cnum,o[i="a"+u].n+=1,o[i].max=o[i].max||0,(s=a[n+1]&&a[n+1].ahz[i])&&0===s[1]&&s[0]>o[i].max&&(o[i].max=s[0]),r[i].ass+=1,o[i].n<=3&&function(n,a,t,e,r){var o="a"+t.ahz.cnum;function u(a,t){var e=n[a]&&n[a].ahz[t];return e&&0===e[1]?e[0]:0}switch(e){case 1:r.a2=u(a+1,o);break;case 2:r.a1=u(a+1,o);break;case 3:r.a0=u(a+1,o)}}(a,n,t,o[i].n,r[i].a3y),n<234&&function(n,a,t,r,o){(r+=1)===a?u(["a2"]):r===2*a?u(["a1"]):r===3*a&&u(["a0"]);r===n&&(n<a?u(["a2","a1","a0"]):n<2*a?u(["a1","a0"]):n<3*a&&u(["a0"]));function u(n){e(t,(a,t)=>{e(n,(n,e)=>{o[a].a3q[e]=t.n})})}}(c,78,o,n,r)}),e(o,(n,a)=>{r[n].a3y.a5=a.max,r[n].a3y.a4=(r[n].a3y.a0+r[n].a3y.a1+r[n].a3y.a2)/3}),r}function f(n){var a,t={...n},r=["a3y","a3q"],o=[];return e(t,function(n,t){e(r,function(n,r){a=[],e(t[r],function(n,t){a.push(t)}),t[r]=a}),o.push(t)}),o}function m(n,a){var t=[...n],e=t.length,o=0;for(o=0;o<e;o++)t[o].ahf=d(t[o].n,a),t[o].axt=v(t[o].n,a),t[o].azh=y(t[o].n,a),r(t[o],p(t[o].n,a)),a=t[o];return t}function l(n){var a,t=[...n],r=["ahf","axt","azh","ajs","aos","ads","axs","ahz","awh","a3y","akd","an0","an1","an2"];return e(t,function(n,t){e(r,function(n,r){a=[],e(t[r],function(n,t){"object"==typeof t&&a.push(t)}),t[r]=a})}),t}function p(n,a){var t={ajs:{num:0,min:0,max:3},aos:{num:0,min:0,max:3},ads:{num:0,min:0,max:3},axs:{num:0,min:0,max:3},ahz:{num:0,min:3,max:18},awh:{num:0,min:0,max:9},a3y:{num:0,min:0,max:2},akd:{num:0,min:0,max:5},an0:{num:0,min:0,max:2},an1:{num:0,min:0,max:2},an2:{num:0,min:0,max:2}},r=["ahz","awh","an0","an1","an2","akd"];r=r.join("|,|"),e(n,function(n,a){a%2==0?t.aos.num+=1:t.ajs.num+=1,a>3?t.ads.num+=1:t.axs.num+=1,t.ahz.num+=a}),t.an0.num=n[0]%3,t.an1.num=n[1]%3,t.an2.num=n[2]%3,t.akd.num=Math.max.apply(null,n)-Math.min.apply(null,n),t.awh.num=parseInt((t.ahz.num+"").substr(-1)),t.a3y.num=t.ahz.num%3;var o={},u=null;return e(t,function(i,s){o[i]=function(t,o,u,i){var s={};return e(o-t+1,function(n){x(s,u,"a"+(n+t),a)}),r.indexOf(u)>=0?s["a"+i]=[i,h(n)]:s["a"+i]=[i,1],s}(s.min,s.max,i,s.num),o[i].cnum=s.num,"an0"===i&&(u=[t.an0.num,t.an1.num,t.an2.num])}),o.an012=function(n){var a=[0,0,0];return e(n,function(n,t){switch(t){case 0:a[0]+=1;break;case 1:a[1]+=1;break;case 2:a[2]+=1}}),a}(u),o}function h(n){var a={},t=0,r="";return e(n,function(n,t){a[r="a"+t]?a[r]+=1:a[r]=1}),e(a,function(n,a){t++}),t}function x(n,a,t,e){e&&0===e[a][t][1]?n[t]=[e[a][t][0]+1,0]:n[t]=[1,0]}function y(n,a){var t=[11,22,33,44,55,66,12,13,14,15,16,23,24,25,26,34,35,36,45,46,56],r=[[n[0],n[1]],[n[0],n[2]],[n[1],n[2]]],o=0,u={};t.join(",");return e(t,function(n,t){x(u,"azh","a"+t,a)}),e(r,function(n){o=parseInt(Math.min.apply(null,r[n])+""+Math.max.apply(null,r[n])),u["a"+o]=[o,1]}),u}function v(n,a){var t={},r=h(n);return e(4,function(n){x(t,"axt","a"+n,a)}),3===r?(t.a1=["三不同号",2],t.a3=["二不同号",4]):2===r?(t.a2=["二同号",3],t.a3=["二不同号",4]):1===r&&(t.a0=["三同号",1],t.a2=["二同号",3]),t}function d(n,a){var t={},o={},u="";return e(n,function(n,a){t[u="a"+a]?t[u][1]+=1:t[u]=[a,1]}),e(6,function(n){x(o,"ahf","a"+(n+1),a)}),r(o,t)}n.exports=((u={}).getAddObj=s,u.getAhzYl=c,u.getFnums=(async()=>(i||(i=await o.getNums()),i)),u.formatNums=(async()=>m(await u.getFnums())),u.fnToArray=l,u.fAhzYl=(async()=>c(await u.formatNums())),u.ahzToArray=f,u)},function(n,a,t){"use strict";const e=t(4);var r=null;n.exports=(n=>{n.get("/gethzyl",async(n,a)=>{var t=await e.fAhzYl();t=e.ahzToArray(t),n.body=t}),n.get("/get",async(n,a)=>{var t,o=null,u=n.query.num;u=parseInt(u)||50,r||(r=await e.formatNums()),o=(t=(r=e.fnToArray(r)).length)>=u?r.slice(t-u):r,n.body=o})})},function(n,a,t){"use strict";const e=t(5);n.exports=(n=>{e(n)})},function(n,a){n.exports={port:3e3,sql:{host:"localhost",user:"root",password:"123456",database:"test"},usesql:!1}},function(n,a){n.exports=require("path")},function(n,a){n.exports=require("debug")},function(n,a){n.exports=require("koa-logger")},function(n,a){n.exports=require("koa-bodyparser")},function(n,a){n.exports=require("koa-onerror")},function(n,a){n.exports=require("koa-json")},function(n,a){n.exports=require("koa-convert")},function(n,a){n.exports=require("co")},function(n,a){n.exports=require("koa-views")},function(n,a){n.exports=require("koa-router")},function(n,a){n.exports=require("koa")},function(n,a,t){const e=t(18),r=t(17),o=new e,u=new r,i=t(16),s=(t(15),t(14),t(13)),c=t(12),f=t(11),m=t(10),l=(t(9)("koa2:server"),t(8)),p=t(7),h=t(6);process.env.PORT||p.port;c(o),o.use(f()).use(s()).use(m()).use(t(1)(__dirname+"/public")).use(i(l.join(__dirname,"/views"),{options:{settings:{views:l.join(__dirname,"views")}},map:{njk:"nunjucks"},extension:"njk"})).use(u.routes()).use(u.allowedMethods()),o.use(async(n,a)=>{const t=new Date;await a();new Date;console.log(`${n.method} ${n.url} - $ms`)}),h(u),o.on("error",function(n,a){console.log(n),m.error("server error",n,a)}),n.exports=o.listen(p.port,()=>{console.log(`Listening on http://localhost:${p.port}`)})}]);