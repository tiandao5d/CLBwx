const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

var nodeModules = {};
fs.readdirSync('./server/node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });
module.exports = {
  entry: './server/app.js',
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
        from: 'server/public',
        to: 'public'
      },{
        from: 'server/views',
        to: 'views'
      },{
        from: 'dist',
        to: 'public'
      },
      'server/package.json'
    ])
  ],
  mode: 'development', // 'production'
  externals: nodeModules
}
