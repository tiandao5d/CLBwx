let vd = require("./venueDict");
const fs = require("fs");
const path = require("path");
const open = require("open");
const stream = require("stream");
const config = require("../config");
const { Builder, By, Key, until } = require("selenium-webdriver");
const request = require("request");
const superagent = require("superagent");
const { bkListCls } = require("../services/bkList");

function join(p) {
  return path.join(__dirname, p);
}

module.exports = (router) => {
  router.get("/user", async function (ctx, next) {
    ctx.set({ "Cache-Control": "max-age=10" });
    console.log(111);
    ctx.body = "胜多负少";
  });
  router.get("/bk_list/get", async function (ctx, next) {
    const { id } = ctx.request.query || {};
    const res = bkListCls.get([+id]);
    ctx.body = res;
  });

  router.post("/bk_list/update", async function (ctx, next) {
    const reqBody = await getbody(ctx);
    const res = bkListCls.update([reqBody]);
    ctx.body = res;
  });
  router.post("/bk_list/add", async function (ctx, next) {
    const reqBody = await getbody(ctx);
    const res = bkListCls.add([reqBody]);
    ctx.body = res;
  });
  router.get("/bk_list/del", async function (ctx, next) {
    const { id } = ctx.request.query || {};
    const res = bkListCls.del([+id]);
    ctx.body = res;
  });
};

function getbody(ctx) {
  return new Promise((res) => {
    let reqBody = "";
    ctx.req.addListener("data", (data) => {
      reqBody += data;
    });
    ctx.req.on("end", () => {
      try {
        reqBody = JSON.parse(reqBody);
      } catch (error) {
        reqBody = {};
      }
      res(reqBody);
    });
  });
}

// nodejs 遍历文件夹
// const fs = require('fs');
// const path = require('path');
function eachDir(dirstr) {
  let arr = [];
  aa(dirstr);
  function aa(dirs) {
    let list = fs.readdirSync(dirs);
    list.forEach((s) => {
      s = path.join(dirs, s);
      let stat = fs.statSync(s);
      if (stat.isDirectory()) {
        // 文件夹
        aa(s);
      } else {
        arr.push(s);
      }
    });
  }
  return arr;
}
// superagent('https://mbd.baidu.com/newspage/data/landingsuper?context=%7B%22nid%22%3A%22news_9982784823930476871%22%7D&n_type=0&p_from=1')
// .then((res) => {
// console.log(res.text)
// })

// const handleBaiDuDriver = async () => {
//   let driver = await new Builder().forBrowser('chrome').build();
//   try {
//     await driver.get('https://www.baidu.com');

//     await driver.findElement(By.id('kw')).sendKeys('ddd df东方闪电', Key.RETURN);//正常使用

//     await driver.findElement(By.id('su')).click();

//     await driver.wait(until.titleIs('百度一下，你就知道'), 1000);

//   } catch (error) {
//     console.log(error)
//   } finally {
//     await driver.sleep(2000);
//     await driver.quit();
//   }
// }
// handleBaiDuDriver()

function copyFileDir(odir, ndir) {
  try {
    fs.rmdirSync(ndir, { recursive: true });
  } catch (err) {
    fs.mkdirSync(ndir);
  }
  let arr = [];
  try {
    arr = eachDir(odir);
  } catch (error) {
    arr = [];
  }

  arr = arr.map((s) => {
    return {
      old: s,
      to: s.replace(odir, ndir),
    };
  });
  arr.forEach((item) => {
    try {
      fs.copyFileSync(item.old, item.to);
    } catch (error) {
      fs.mkdirSync(path.parse(item.to).dir);
      fs.copyFileSync(item.old, item.to);
    }
  });
  if (arr.some((o) => o.to.includes("index.html"))) {
    open(`http://localhost:${config.port}/apac/index.html`);
  }
}
