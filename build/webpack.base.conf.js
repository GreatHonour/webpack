const path = require('path');
const webpack = require('webpack');
// 用于在构建前清除dist目录中的内容
const Rimraf = require('rimraf');
// 获取全局的文件路径
const Glob = require('glob-all');
// 复制静态文件
const CopyWebpackPlugin = require('copy-webpack-plugin');

// 编译html文件
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 提取css 
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


// 获取绝对路径
function resolve(dir) {
    return path.join(__dirname, '..', dir)
}


// 清除dist构建目录文件
Rimraf(resolve('dist'), (err) => {
    if (err) {
        throw err;
    }
    console.log('------------------- dist目录已经清除 -------------------');
})


// 返回一个对象
// env是对当前环境的区分
module.exports = (env) => {
    // js入口的路径
    const ENTRY_PATH_JS = getEntry('src/js/**/*.js');
    // html的template模板路径
    const ENTRY_PATH_HTML = getEntry('src/view/**/*.html');
    // html的文件名
    const htmlName = Object.keys(ENTRY_PATH_HTML);

    // 当前环境变量
    const MODE_ENV = env === 'development' ? true : false;

    const PATH_SRC = resolve('src');

    const BASE_CONFIG = {
        // 入口
        entry: ENTRY_PATH_JS,

        // 配置路劲
        resolve: {
            extensions: ['.js', '.scss', '.json'],
            alias: {
                "@": PATH_SRC,
            }
        },

        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: '/node_modules/',                // 忽略的文件
                    include: [PATH_SRC],                      // 精确指定要处理的目录
                    // cacheDirectory=true 默认为false; 设置时，给定的目录将用于缓存加载器的结果
                    use: ['babel-loader?cacheDirectory=true']
                },
                {
                    test: /\.scss$/,
                    exclude: '/node_modules/',
                    include: [PATH_SRC],
                    use: [
                        MODE_ENV ?
                            {
                                loader: 'style-loader',
                                options: {
                                    sourceMap: MODE_ENV,
                                }
                            } : MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: MODE_ENV,
                            }
                        }, {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',                      // 指定插件给谁用
                                sourceMap: MODE_ENV,                   // 开启 source-map
                            }
                        }, {
                            loader: "sass-loader",
                            options: {
                                sourceMap: MODE_ENV
                            }
                        }]
                },
                {
                    test: /\.html$/,
                    exclude: '/node_modules/',
                    include: [PATH_SRC],
                    use: ['html-loader']
                },
                {   // 转化为base64编码只能使用url-loader
                    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                    exclude: '/node_modules/',
                    include: [PATH_SRC],
                    use: [{
                        loader: 'url-loader',
                        options: {
                            fallback: 'file-loader',         // 超过设置的limit大小，就引用file-loader
                            name: '[name]-[hash:8].[ext]',   // 图片打包出来的名字
                            outputPath: "static/imgs/",      // 指定图片路径
                            limit: 10240,                    // 当图片小于10240,会被转化为base64编码
                        }
                    }]
                },
                {   // 文字图标
                    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                    exclude: '/node_modules/',
                    include: [PATH_SRC],
                    use: [{
                        loader: 'url-loader',
                        options: {
                            fallback: 'file-loader',         // 超过设置的limit大小，就引用file-loader
                            name: '[name]-[hash:8].[ext]',   // 图片打包出来的名字
                            outputPath: "static/fonts/",     // 指定图片路径
                            limit: 10240,                    // 当图片小于10240,会被转化为base64编码
                        }
                    }]
                },
                {   // 音频
                    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                    exclude: '/node_modules/',
                    include: [PATH_SRC],
                    use: [{
                        loader: 'url-loader',
                        options: {
                            fallback: 'file-loader',         // 超过设置的limit大小，就引用file-loader
                            name: '[name]-[hash:8].[ext]',   // 图片打包出来的名字
                            outputPath: "static/fonts/",     // 指定图片路径
                            limit: 10240,                    // 当图片小于10240,会被转化为base64编码
                        }
                    }]
                },
            ]
        },

        plugins: [


            // 全局引入JQ，npm下载的包
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery'
            }),

            // 复制静态文件
            new CopyWebpackPlugin([{
                from: path.resolve(__dirname, '../static'),
                to: path.resolve(__dirname, '../dist/static/'),
                ignore: ['.*']
            }])
        ]
    }


    htmlName.forEach(item => {
        BASE_CONFIG.plugins.push(new HtmlWebpackPlugin({
            filename: "view/" + item + '.html',
            template: ENTRY_PATH_HTML[item],            // 模板
            inject: 'body',                             // false 放在body下面
            chunks: ['manifest', 'vendor', 'commons', item],       // 如果不指定chunks：[],会把entry相关的入口都在载入这个html中，如果指定chunks：['app'],那只会把这个相关的入口chunks载入这个页面中
            hash: true,                                 // 在引入JS里面加入hash值 比如: <script src='index.js?2f373be992fc073e2ef5'></script>
            minify: {
                removeComments: !MODE_ENV,              // 去除注释
                collapseWhitespace: !MODE_ENV,          // 去除空格
                removeAttributeQuotes: !MODE_ENV        // 去掉引号，减少文件大小<script src=index.js></script>
            }
        }))
    });


    // 获取文件路径
    function getEntry(globPath, pathDir) {
        const ENTRY_PATH = {};
        let time = +new Date();
        let dirName = null;
        let extName = null;
        let baseName = null;
        let pathName = Glob.sync(globPath);

        pathName.forEach(item => {
            dirName = path.dirname(item);                   // 返回路径，去除文件名和后缀名 'src\pages\home\home' => src\pages\home
            extName = path.extname(item);                   // 返回后缀名
            baseName = path.basename(item, extName);        // src/index.html ==> path:路径  ； ext: '.html'后缀名， 最终返回index文件名
            ENTRY_PATH[baseName] = `./${item}?t=${time}`;
        })
        return ENTRY_PATH;
    }

    return BASE_CONFIG;
};



