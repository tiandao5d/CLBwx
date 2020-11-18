const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
function resolvePath(src) {
  return path.resolve(__dirname, src);
}
module.exports = merge(common, {
  mode: "production", // development  production
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: true,
              publicPath: "../",
            },
          },
          "css-loader",
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: true,
              publicPath: "../",
            },
          },
          "css-loader",
          "less-loader",
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: true,
              publicPath: "../",
            },
          },
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },
  stats: "errors-only",
  plugins: [
    new HtmlWebpackPlugin({
      template: resolvePath("src/index.html"),
      env,
      minify: { collapseWhitespace: true },
      baseprod: true,
    }),
    new MiniCssExtractPlugin({
      filename: "./css/[name].[hash:8].css",
    }),
    new OptimizeCssAssetsPlugin(),
  ],
  devtool: "source-map",
});
