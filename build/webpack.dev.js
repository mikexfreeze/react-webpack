/* create by Micheal Xiao 2018/11/7 16:52 */

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const config = require('../config')
const webpack = require('webpack')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(config.dev.env)
    }),
  ]
});