
const path = require('path');
const webpack = require('webpack');
// 用于在构建前清除dll目录中的内容
const Rimraf = require('rimraf');


function resolve(dir) {
    return path.join(__dirname, '..', dir)
}


// 清除dist构建目录文件
Rimraf(resolve('dist'), (err) => {
    if (err) {
        throw err;
    }
    console.log('------------------- static 静态文件目录已经清除 -------------------');
})



module.exports = {
    mode: 'development',    // 当前环境是开发还是生产
    entry: {
        vendor: ['jquery'],
    },

    /* 
        path：manifest.json文件的输出路径，这个文件会用于后续的业务代码打包；
        name：dll暴露的对象名，要跟output.library保持一致;
        context：解析包路径的上下文，这个要跟接下来配置的 webpack.config.js 一致。
    */
    output: {
        path: path.join(__dirname, '../dist/lib'),
        filename: '[name].min.js',
        library: '[name]'                           // 这个要和下面的【name】一致
    },

    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, '../dist/lib', '[name]-mainfest.json'),
            name: '[name]',
            context: __dirname,
        }),
    ]
};