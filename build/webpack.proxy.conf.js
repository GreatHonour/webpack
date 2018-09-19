// 跨域代理 继承http-porxy-middleware
module.exports = {
    "/api": {
        target: 'http://admin.ggszwh.com',       // 代理的地址
        changeOrigin: true,                      // 设置为true，否则请求不成功
        // headers: ['请求头'],                  // 代理请求头
        // logLevel: 'debug',                   // 代理的调试，显示代理信息，一般不用                     
        pathRewrite: {                          // 简短写法
            "^/api": ''
        }
    }
}