/**
 * 用户表
 */
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username:{type:String},                   // 用户名
  password:{type:String},                   // 密码
  email:{type:String},                      // 邮箱
  sex:{type:String, default:'asexual'},     // 性别，默认为中性
  birth:{type:Date},                        // 生日
  phone:{type:Number},                      // 电话
  explain:{type:String},                    // 签名
  imgurl:{type:String, default:'user.png'}, // 头像链接
  time:{type:Date}                          // 注册时间
})

const UserModel = mongoose.model('User', UserSchema)
module.exports = UserModel
