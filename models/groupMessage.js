/**
 * 群消息表
 */
const mongoose = require('mongoose')

const GroupMessageSchema = new mongoose.Schema({
  groupID:{type:mongoose.Schema.Types.ObjectId,ref:'Group'},  // 群id
  userID:{type:mongoose.Schema.Types.ObjectId,ref:'User'},    // 发送者id
  message:{type:String},                             // 发送内容
  types:{type:Number, default:0},                    // 内容类型（0文字，1图片链接，2音频链接）
  state:{type:Number, default:1},                    // 消息状态 --（0已读，1未读)  
  tips:{type:Number,default:1},                       // 记录未读数 
  systemMsg:{type:Number,default:1},                  // 系统消息标记--（0系统，1用户)  
  time:{type:Date},                                  // 发送时间
})

const GroupMessageModel = mongoose.model('GroupMessage', GroupMessageSchema)
module.exports = GroupMessageModel

