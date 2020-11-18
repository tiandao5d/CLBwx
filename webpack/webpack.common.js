const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
function resolvePath(src) {
  return path.resolve(__dirname, src);
}
module.exports = {
  entry: {
    main: resolvePath("../src/index.js"),
  },
  output: {
    filename: "[name].builde.[hash:6].js",
    path: resolvePath("../dist"),
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 1000,
              outputPath: "images",
              name: "[name].[hash:7].[ext]",
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 1000,
              outputPath: "fonts",
              name: "[name].[hash:7].[ext]",
            },
          },
        ],
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      images: resolvePath("../public/images"),
      src: resolvePath("../src"),
    },
    extensions: [".ts", ".tsx", ".js", ".json", ".jsx"],
  },
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
        styles: {
          name: "styles",
          test: /\.(css|scss|sass|less)$/,
          chunks: "all",
          enforce: true,
        },
      },
    },
  },
  // plugins: [
  //   new CleanWebpackPlugin({
  //     cleanAfterEveryBuildPatterns: [resolvePath("../dist")],
  //   }),
  // ],
};
