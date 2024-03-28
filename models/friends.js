/**
 * 好友表
 */
const mongoose = require('mongoose')

const FriendSchema = new mongoose.Schema({
  userID:{type:mongoose.Schema.Types.ObjectId,ref:'User'},   // 用户id
  friendID:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, // 好友id
  state:{type:String, default:0},                   // 好友状态 ( 0已为好友，1申请中， 2申请发送方,对方还未同意 ) 
  nickname:{type:String},                           // 昵称
  time:{type:Date},                                 // 生成时间
  lastTime:{type:Date}                              // 最后通信时间（后加入项目）
})

const FriendModel = mongoose.model('Friend', FriendSchema)
module.exports = FriendModel

