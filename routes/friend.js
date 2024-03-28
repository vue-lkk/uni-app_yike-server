const express = require('express')
const router = express.Router()

// 引入好友表
const FriendModel = require('../models/friends')
// 引入一对一聊天表
const MessageModel = require('../models/message')

// 好友操作
// 添加好友表
async function buildFriend(uid,fid,state) {
  try {
    let data = {
      userID:uid,// 用户id     
      friendID:fid,// 好友id
      state,// 好友状态 ( 0已为好友，1申请中， 2申请发送方,对方还未同意 ) 
      nickname:'',// 昵称
      time:new Date(),// 生成时间
      lastTime:new Date()// 最后通信时间（后加入项目）
    }
    // 添加
    await FriendModel.create(data)
  } catch (error) {
    console.log('申请好友表出错')
  }
}

// 更新好友最后通信时间 
exports.updatefriendlasttime = async function (uid,fid) {
  try {
    let where = {$or:[{'userID':uid,'friendID':fid},{'userID':fid,'friendID':uid}]}
    // 实时时间
    let update = {'lastTime':new Date()}
    // 更新2条
    await FriendModel.updateMany(where,update)
  } catch (error) {
    console.log('更新好友最后通信时间出错')
  }
}

// 添加一对一消息
exports.addmsg =  async function (uid,fid,message,types) {
  try {
    let data = {
      userID:uid,// 发送者id
      friendID:fid,// 接收者id
      message,// 发送内容 
      types,// 内容类型 --（0文字，1图片链接，2音频链接）                   
      state:1,// 消息状态 --（0已读，1未读)                             
      time:new Date()// 发送时间
    }
    let result = await MessageModel.create(data)
    return result
  } catch (error) {
    
  }
}

// 好友申请
router.post('/applyfriend',async (req,res) => {
  const {uid,fid,message} = req.body
  try {
    let where = {'userID':uid,'friendID':fid}
    let result = await FriendModel.countDocuments(where)
    // 未申请过好友
    if(result === 0) {
      buildFriend(uid,fid,2) //申请发送方
      buildFriend(fid,uid,1) //申请中
    }else{ 
      // 已经申请过好友,更新好友最后通信时间
      updatefriendlasttime(uid,fid)
    }
    // 添加一对一消息
    let data = addmsg(uid,fid,message,0,res)
    res.send({status:0, data})
  } catch (error) {
    res.send({status:1,data:error})
  } 
})

// 更新好友状态(同意加为好友)
router.post('/updatefriendstate',async (req,res) => {
  const {uid,fid} = req.body
  try {
    let where = {$or:[{'userID':uid,'friendID':fid},{'userID':fid,'friendID':uid}]}
    let result = await FriendModel.updateMany(where,{'state':0})
    res.send({status:0,data:result})
  } catch (error) {
    
  }
})

// 拒接好友/删除好友
router.post('/deletefriend',async (req,res) => {
  const {uid,fid} = req.body
  try {
    let where = {$or:[{'userID':uid,'friendID':fid},{'userID':fid,'friendID':uid}]}
    let result = await FriendModel.deleteMany(where)
    res.send({status:0,data:result})
  } catch (error) {
    
  }
})

// 根据0获取好友列表/根据1获取申请列表
router.post('/getuser', async (req,res) => {
  const {uid,state} = req.body
  try {
    const result = await FriendModel
    .find({})                            // 查询全部
    .where({'userID':uid,'state':state}) // 查询条件
    .populate('friendID')                // 它会填充 friendID 字段，这意味着它会根据 friendID 中的外键值去关联的集合中查找并将关联的文档一并返回
    .sort({'lastTime':-1})               // -1 表示倒序，1 表示正序
    .exec()                              // 执行整个查询，并返回一个 promise 对象
    // console.log(result)
    let userList = result.map(user => {
      return {
        id:user.friendID._id,
        name:user.friendID.username,
        nickname:user.nickname,
        imgurl:user.friendID.imgurl,
        lastTime:user.lastTime
      }
    })
    res.send({status:0,data:userList})
  } catch (error) {
    res.send({status:500})
  }
})


module.exports.friendRouter = router
