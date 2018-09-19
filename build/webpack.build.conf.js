// 合并文件
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

// 公用的配置
const BASE_CONFIG = require('./webpack.base.conf')('production');

// js代码压缩，速度相对较快，多线程
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

// 提取css 
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// 压缩了代码、删掉了代码中无用的注释、还去除了冗余的 css、优化了 css 的书写顺序
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");


// 打包视图可视化
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const BUILD_CONFIG = {
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

        minimizer: [
            // js代码压缩，速度相对较快，多线程
            new UglifyJsPlugin({
                cache: true,            // 开启缓存
                parallel: true,
                sourceMap: false,       // 正式不用开
                uglifyOptions: {        
                    ecma: 8,
                    warnings: false,                // 显示警告
                    compress: {
                        warnings: false,            // 在删除没用到代码时 不输出警告
                        drop_console: true,         // 删除console
                        collapse_vars: true,        // 把定义一次的变量，直接使用，取消定义变量
                        reduce_vars: true           // 合并多次用到的值，定义成变量
                    },
                    output: {
                        beautify: false,            // 代码压缩成一行 true为不压缩 false压缩
                        comments: true              // 去掉注释
                    },
                    toplevel: false,                // 启用顶级变量和函数名称修改并删除未使用的变量和函数
                    ie8: false,                     // 启用IE8支持
                }
            }),

            // css 压缩
            new OptimizeCSSAssetsPlugin({})
        ]
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




