const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const BASE_CONFIG = require('./webpack.base.conf')('development');

// 跨域代理
const Proxy = require('./webpack.proxy.conf');


const DEV_CONFIG = {
    mode: 'development',    // 当前环境是开发还是生产

    // 出口
    output: {
        filename: 'js/[name].[hash:8].js',
        path: path.resolve(__dirname, '../dist'),
        publicPath: '/',                         // 因为引入路径时候，打包后找不到，所以要设置路径,  build "../" ,  dev'/
    },

    // 服务  
    // 多页面不开启hot,因为开启后要手动刷新页面，才会显示已经改变的东西
    // 可以添加--watch ，这样浏览器会自动刷新
    devServer: {
        contentBase: path.join(__dirname, '../dist'),       // 静态文件地址
        port: 8080,                                         // 端口号
        host: 'localhost',                                  // 主机
        overlay: true,                                      // 如果出错，则在浏览器中显示出错误
        compress: true,                                     // 服务器返回浏览器的时候是否启动gzip压缩
        open: true,                                         // 打包完成自动打开浏览器
        hot: true,                                          // 模块热替换 需要webpack.HotModuleReplacementPlugin插件 false关闭，true开启
        hotOnly: true,                                      // 避免全局刷新， 配置hot使用，false关闭，true开启
        inline: true,                                       // 实时构建
        progress: true,                                     // 显示打包进度
        openPage: 'view/login.html',                        // 打开的第一个页面，默认index.html
        proxy: Proxy
    },

    devtool: 'cheap-module-source-map',              // 生成代码映射，查看编译前代码，利于找bug
    plugins: [
        // 配合热跟新使用
        new webpack.HotModuleReplacementPlugin(),
    ]
}
module.exports = merge(BASE_CONFIG, DEV_CONFIG);




/* 

"jquery": "^1.12.4" 和 "jquery": "1.12.4" 的区别
带^会默认加载最新的JQ库， 而不带^， 就会固定版本1.12.4

*/



