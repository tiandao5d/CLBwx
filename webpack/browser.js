const open = require("open");
const webpack = require("webpack");
const webpackConfig = require("./webpack.dev");
const config = require("../config");
const fs = require("fs");
const path = require("path");
function resolvePath(src) {
  return path.resolve(__dirname, src);
}

const weburl = `http://localhost:${config.port}`;
async function wp() {
  return new Promise((res) => {
    fs.rmdirSync(resolvePath("../dist"), { recursive: true });
    webpack(webpackConfig, (err, stats) => {
      console.log(err);
      res();
    });
  });
}

module.exports = async function webbs() {
  await wp();
  open(weburl);
  fs.watch(resolvePath("../src"), (err, filename) => {
    if (filename) {
      wp();
      console.log(filename);
    }
  });
};
