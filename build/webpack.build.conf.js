// 合并文件
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

// 公用的配置
const BASE_CONFIG = require('./webpack.base.conf')('production');

// 提取css 
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


// 打包视图可视化
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const BUILD_CONFIG = {
    // 只需要配置mode为"production"，即可显式激活 UglifyjsWebpackPlugin 插件
    mode: 'production',                                  // 当前环境是开发还是生产
    devtool: false,

    // 出口
    // 使用chunkhash可以长缓存
    output: {
        filename: 'js/[name].[chunkhash].js',
        chunkFilename: 'js/[name].[chunkhash].js',          // 动态打包的文件名
        path: path.resolve(__dirname, '../dist'),
        publicPath: '../',                               // 因为引入路径时候，打包后找不到，所以要设置路径,  build "../" ,  dev'/
    },

    // 提出公共的JS,css文件
    optimization: {
        // 把webpack的公用代码，和别的公用代码区分开
        runtimeChunk: {
            name: "manifest"
        },

        // 提取公用代码
        splitChunks: {
            cacheGroups: {
                commoms: {
                    name: "commoms",
                    minSize: 10240,         // 最小10kb以上才打包
                    chunks: "initial",
                    minChunks: 3,           // 出现过几次
                    priority: 10,           // 层级高为正数，低为负数
                },
                // 打包node_modules里面的
                vendor: {
                    name: 'vendor',
                    chunks: 'initial',
                    test: /[\\/]node_modules[\\/]/,
                    priority: 20,
                }
            }
        },
    },

    plugins: [

        // 解决引入新模块，模块顺序发生改变，vendor, hash变化（长缓存优化）
        // 显示模块的相对路径和chunk名字
        new webpack.NamedChunksPlugin(),
        new webpack.NamedModulesPlugin(),

        // 提取css 
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash:12].css',        // 提取出来的文件名字
            chunkFilename: 'css/[name].[contenthash:12].css'
        }),

        // 打包视图可视化
        // new BundleAnalyzerPlugin(),
    ],



}
module.exports = merge(BASE_CONFIG, BUILD_CONFIG);




