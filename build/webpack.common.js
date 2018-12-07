/* create by Micheal Xiao 2018/11/7 16:52 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack')
const config = require('../config')


module.exports = {
  entry: ["babel-polyfill", "./src/index.js"],
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
    path: config.dist
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
    alias: {
      components: path.resolve(__dirname, '../src/components/'),
      utils: path.resolve(__dirname, '../src/utils/'),
      index: path.resolve(__dirname, '../src/index'),
      fetch: path.resolve(__dirname, '../src/utils/fetch'),
      assets: path.resolve(__dirname, '../src/assets'),
      acom: path.resolve(__dirname, '../src/acom'),
      services: path.resolve(__dirname, '../src/services'),
      routes: path.resolve(__dirname, '../src/routes'),
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/, exclude: /node_modules/, loader: ['babel-loader']
      }, {
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
            loader: "less-loader",
            options: {javascriptEnabled: true}
          }
        ]
      }, {
        test: /\.scss$/,
        use: [{
          loader: "style-loader"
        }, {
          loader: "css-loader", options: {
            sourceMap: true
          }
        }, {
          loader: "sass-loader", options: {
            sourceMap: true
          }
        }]
      }, {
        test: /\.css$/,
        use: [
          {loader: "style-loader"},
          {loader: "css-loader"}
        ]
      }, {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },

  optimization: {
    splitChunks: { // 代码模块拆分
      chunks: 'all',
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        agGrid: {
          test: /ag-grid-community/,
          name: 'ag-grid'
        },
        echarts: {
          test: /echarts/,
          name: 'echarts'
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
  },
  plugins: [
    new HtmlWebpackPlugin({ // html 模板插件，不指定模板会自动创建模板
      chunksSortMode: 'none',
      template: 'src/index.html',
    }),
    new CopyWebpackPlugin([ // copy public 文件夹至 dist
      {from: 'src/public', to: ''}
    ]),
    new webpack.ProvidePlugin({
      React: "react", // React 设为全局变量
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // 忽略moment.js中的locals文件，需要时单独引入
  ],

};