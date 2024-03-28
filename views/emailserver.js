// 引入发送邮箱插件
const nodemailer = require("nodemailer");
// 引入授权码
const credentials = require('../config/credentials')

// 创建一个SMTP客户端配置对象
const transporter = nodemailer.createTransport({
  service: 'qq',
  auth: {
    user: credentials.qq.user,
    pass: credentials.qq.pass,
  }
});

// 注册发送邮箱给用户
exports.emailSignUp = function(email, res) {
  // 创建发送的消息
  let options = {
    from: '591568596@qq.com',
    to:email,  // 用户邮箱
    subject:'感谢您在yike注册,欢迎使用!', // 主题
    html:`<span>yike欢迎您加入</span>
          <a href='http://localhost:8080'>点击</a>`
  }

  // 发送消息
  transporter.sendMail(options, function(err, msg) {
    if(err) {
      res.send(err)
    }else{
      transporter.close()
      res.send({status:0,message:'邮箱发送成功!'})
    }
  })
}



