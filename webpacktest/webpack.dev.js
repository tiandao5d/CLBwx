const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
module.exports = merge(common, {
    mode: 'development', // development  production
    devServer: {
        contentBase: './dist',
        hot: true,
        port: 9000,
        host: '0.0.0.0',
        noInfo: true
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
});