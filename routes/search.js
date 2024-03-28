const express = require('express')
const router = express.Router()

// 引入用户表
const UserModel = require('../models/users')
// 引入好友表
const FriendModel = require('../models/friends')
// 引入群表
const GroupModel = require('../models/group')
// 引入群成员表
const GroupMember = require('../models/groupMember')

// 搜索页面
// 搜索用户
router.get('/user',async (req,res) => {
  try {
    const {keyword}  = req.query
    console.log(keyword)
    let where = {}
    // 彩蛋：搜索词为‘yike’
    if(keyword === 'yike') {
      where = {}
    }else{
      // 查询条件：$regex模糊匹配  用户名/邮箱
      where = {$or:[{'username':{$regex:keyword}},{'email':{$regex:keyword}}]}
    }
    // 输出字段
    let out = {
      'username':1,
      'email':1,
      'imgurl':1
    }
    const result = await UserModel.find(where,out)
    res.send({
      status:0,
      data:result
    })
  } catch (error) {
    res.send({
      status:1
    })
  }
  
})

// 判断是否为好友
router.post('/isFriend',async (req,res) => {
  try {
    let {uid,fid} = req.body
    // console.log(uid,fid)
    // 查询条件：用户id 好友id 好友状态
    let where = {'userID':uid, 'friendID':fid,'state':0}
    let result = await FriendModel.findOne(where)
    // console.log('@',result)
    if(result) {
      // 是好友
      res.send({status:0})
    }else{
      // 不是好友
      res.send({status:1})
    }
  } catch (error) {
    res.send({status:500})
  }
 
})

// 搜索群
router.get('/group', async (req,res) => {
  try {
    const {keyword}  = req.query
    // console.log(keyword)
    let where = {}
    // 彩蛋：搜索词为‘yike’
    if(keyword === 'yike') {
      where = {}
    }else{
      // 查询条件：模糊匹配 用户名/邮箱
      where = {'name':{$regex:keyword}}
    }
    // 输出字段
    let out = {
      'name':1,
      'imgurl':1
    }
    const result = await GroupModel.find(where,out)
    res.send({
      status:0,
      data:result
    })
  } catch (error) {
    res.send({
      status:1
    })
  }
})

// 判断是否在群内
router.post('/isingroup',async (req,res) => {
  try {
    let {uid,gid} = req.body
    // 查询条件：用户id 好友id 好友状态
    let where = {'userID':uid, 'groupID':gid}
    let result = await GroupMember.findOne(where)
    if(result) {
      // 是在群内
      res.send({status:0})
    }else{
      // 不在群内
      res.send({status:1})
    }
  } catch (error) {
    res.send({status:500})
  }
 
})

module.exports = router