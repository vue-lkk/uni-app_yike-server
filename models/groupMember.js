/**
 * 群成员表
 */
const mongoose = require('mongoose')

const GroupMemberSchema = new mongoose.Schema({
  groupID:{type:mongoose.Schema.Types.ObjectId,ref:'Group'},  // 群id
  userID:{type:mongoose.Schema.Types.ObjectId,ref:'User'},    // 用户id 
  name:{type:String},                                // 群内名
  tip:{type:Number, default:0},                      // 未读消息数
  shield:{type:Number, default:0},                   // 是否屏蔽群消息（0：不屏蔽，1：屏蔽）
  time:{type:Date},                                  // 加入时间
  lastTime:{type:Date}                               // 最后通信时间（后加入项）
})

const GroupMemberModel = mongoose.model('GroupMember', GroupMemberSchema)
module.exports = GroupMemberModel



