/* create by Micheal Xiao 2018/11/7 16:52 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: './src/app.js'
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {test: /\.js$/, exclude: /node_modules/, loader: ['babel-loader', 'eslint-loader']},
      {
        test: /\.tsx?$/,
        use: ['ts-loader'],
        exclude: /node_modules/
      }, {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader"
          }, {
            loader: "css-loader",
            options: {
              sourceMap: true,
              modules: true,
              localIdentName: "[local]___[hash:base64:5]"
            }
          }, {
            loader: "less-loader"
          }
        ]
      }, {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ]
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      assets: path.resolve(__dirname, 'src/assets/'),
    }
  },
  optimization: {
    splitChunks: { // 代码模块拆分
      chunks: 'all',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({ // html 模板插件，不指定模板会自动创建模板
      template: 'src/index.html',
    })
  ],

};