const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

var nodeModules = {};
fs.readdirSync('./node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });
const pjsonstr = fs.readFileSync('./package.json', 'utf8');
var pjson = JSON.parse(pjsonstr);
delete pjson.scripts.dev;
delete pjson.scripts.build;
delete pjson.devDependencies;
var writerStream = fs.createWriteStream('./package1.json');
writerStream.write(JSON.stringify(pjson), 'UTF8');
writerStream.end();
module.exports = {
  entry: './app.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'box'),
    filename: 'app.js'
  },
  module: {
    rules: [{
      parser: {
        node: false
      }
    }]
  },
  plugins: [
    new CleanWebpackPlugin(['box']),
    new CopyWebpackPlugin([
      {
        from: 'public',
        to: 'public'
      },
      {
        from: 'views',
        to: 'views'
      },
      {
        from: 'bin',
        to: 'bin'
      },
      {
        from: 'package1.json',
        to: 'package.json'
      }
    ])
  ],
  mode: 'production', // 'production', 'development'
  externals: nodeModules
}
