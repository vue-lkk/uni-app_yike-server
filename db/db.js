module.exports = (function() {
  return new Promise((resolve,reject) => {
    // 引入mongoose
    const mongoose = require('mongoose')
    // 连接mongodb
    mongoose.connect('mongodb://127.0.0.1:27017/xuexi')
    // 监听
    mongoose.connection.once('open', () => {
      console.log('连接mongodb数据库成功')
      resolve()
    })
    mongoose.connection.on('error', (error) => {
      console.log('连接mongodb数据库失败')
      reject()
    })
    mongoose.connection.on('close', () => {
      console.log('连接mongodb数据库关闭')
    })
  })
})()