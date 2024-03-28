const express = require('express')
const router = express.Router()

// 引入一对一消息表
const MessageModel = require('../models/message')


// 获取最新一条聊天信息
router.post('/getonemsg', async (req,res) => {
  const {uid,fid} = req.body
  try {
    const result = await MessageModel
    .findOne({})
    .where({$or:[{'userID':uid,'friendID':fid},{'userID':fid,'friendID':uid}]})
    .sort({'time':-1})
    .exec()
    // console.log(result)
    res.send({status:0,data:{
      message:result.message,
      types:result.types,
      time:result.time
    }})
  } catch (error) {
    res.send({status:500})
  }
})

// 获取一对一未读消息数
router.post('/unreadmsg',async (req,res) => {
  const {uid,fid} = req.body
  try {
    let where = {'userID':uid,'friendID':fid,'state':1}
    const result = await MessageModel.countDocuments(where)
    res.send({status:0,data:{total:result}})
  } catch (error) {
    res.send({status:500})
  }
})

// 修改一对一未读消息改为已读
router.post('/readmsg',async (req,res) => {
  const {uid,fid} = req.body
  try {
    let where = {'userID':uid,'friendID':fid,'state':1}
    let updateState = {'state':0}
    const result = await MessageModel.updateMany(where,updateState)
    res.send({status:0,data:result})
  } catch (error) {
    res.send({status:500})
  }
})

// 分页
router.post('/page',async (req,res) =>{
  const {page,pageSize,uid,fid} = req.body
  // console.log(page,pageSize,uid,fid)
  // 跳过的条数
  let skipNum = (page-1) * pageSize 
  // console.log(skipNum)
  try {
    const result = await MessageModel
    .find({})
    .where({$or:[{'userID':uid,'friendID':fid},{'userID':fid,'friendID':uid}]})
    .sort({'time':-1})
    .populate('userID')
    .skip(skipNum)  // 跳过条数
    .limit(pageSize) // 查询几条
    .exec()
    // res.send({status:0,data:result})
    let chatList = result.map(chat => {
      return {
        id:chat._id,   // 消息id
        fromid:chat.userID._id,  // 发送者ID
        message:chat.message,  // 内容
        types:chat.types,  // 消息类型
        imgurl:chat.userID.imgurl,  // 发送者头像
        time:chat.time
      }
    })
    res.send({status:0,data:chatList})
  } catch (error) {
    res.send({status:500})
  }
})


// 添加一条一对一消息
router.post('/addmsg',async (req,res) => {
    const {uid,fid,message,types} = req.body
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
      res.send({status:0, data:result})
    } catch (error) {
      res.send({status:1,data:error})
    }
})



module.exports = router