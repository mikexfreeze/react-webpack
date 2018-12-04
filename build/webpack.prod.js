/* create by Micheal Xiao 2018/11/7 16:53 */
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const config = require('../config')
var path = require('path')

module.exports = merge(common, {
  mode: 'production',
  // devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(config.prod.env)
    }),
    new CleanWebpackPlugin(['dist'], { root: path.resolve(__dirname, '../')}),
    new BundleAnalyzerPlugin(),
  ]
});