const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
function resolvePath(src) {
  return path.resolve(__dirname, src);
}
module.exports = merge(common, {
  mode: "development", // development  production
  // devServer: {
  //   contentBase: "./dist",
  //   hot: true,
  //   port: 9000,
  //   host: "0.0.0.0",
  //   noInfo: true,
  //   open: true,
  // },
  module: {
    rules: [
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      { test: /\.less$/, use: ["style-loader", "css-loader", "less-loader"] },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  // watchOptions: {
  //   ignored: [/node_modules/],
  // },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: "管理html",
      template: resolvePath("../src/index.html"),
    }),
  ],
});
