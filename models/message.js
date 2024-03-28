/**
 * 一对一聊天表
 */
const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  userID:{type:mongoose.Schema.Types.ObjectId,ref:'User'},   // 发送者id
  friendID:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, // 接收者id
  message:{type:String},                            // 发送内容 
  types:{type:String, default:0},                   // 内容类型 --（0文字，1图片链接，2音频链接,3位置）
  state:{type:Number, default:1},                   // 消息状态 --（0已读，1未读)
  time:{type:Date}                                  // 发送时间
})

const MessageModel = mongoose.model('Message', MessageSchema)
module.exports = MessageModel

