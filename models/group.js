/**
 * 群 表
 */
const mongoose = require('mongoose')

const GroupSchema = new mongoose.Schema({
  userID:{type:mongoose.Schema.Types.ObjectId,ref:'User'},   // 群主id
  name:{type:String},                               // 群名 
  imgurl:{type:String, default:'group.png'},        // 群封面链接
  notice:{type:String},                             // 群公告
  time:{type:Date}                                  // 群建立时间
})

const GroupModel = mongoose.model('Group', GroupSchema)
module.exports = GroupModel

