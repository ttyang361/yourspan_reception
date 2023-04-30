const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})

let proxyObj = {}

proxyObj['/'] = {
  // websocket
  ws: false,
  // 目标地址
  target: 'http://localhost:9001',
  // 发送请求头host会被设置target
  changeOrigin: true,
  pathRewrite: {
    '^/': '/'
  }
}

module.exports = {
  devServer: {
    host: 'localhost',
    port: 8080,
    proxy: proxyObj
  }
}