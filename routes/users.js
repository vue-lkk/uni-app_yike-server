var express = require('express');
var router = express.Router();

// 密码加密
const bcrypt = require('bcrypt')

// 引入用户表
const UserModel = require('../models/users')
// 引入好友表
const FriendModel = require('../models/friends')

// 用户详情页面
// 用户详情
router.get('/detail',async (req,res) => {
  const {id} = req.query
  try {
    let where = {'_id':id}
    // 排除密码字段
    let out = {'password':0}
    let result = await UserModel.findOne(where,out)
    // console.log(result)
    if(result) {
      return res.send({status:0,data:result})
    }
    res.send({status:1})
  } catch (error) {
    res.send({status:500})
  }
})

// 用户信息修改
router.post('/update', async (req,res) => {
  try {
    const {id,password,type,message} = req.body
    let where = {'_id':id}
    let update = {}
    let result = await UserModel.find(where)
    if(result.length > 0) {
      // 修改的是密码
      if(type === 'password') {
        // 加密密码与用户输入的密码进行对比验证，返回布尔值
        const compareResult = await bcrypt.compare(password,result[0].password)
        // 密码一致
        if(compareResult) {
          // 修改密码时，需要加密
          update[type] = await bcrypt.hash(message, 10)
          // 通过前端传递过来的 修改字段 和 修改内容 来确定修改
          let result1 = await UserModel.findByIdAndUpdate(where,update)
          // console.log('@',result1) // 输出未修改前的一条数据
          return res.send({status:0})
        }
        return res.send({status:1,message:'原密码不正确！'})
      }else{
         // 修改的是普通项
        update[type] = message
        await UserModel.findByIdAndUpdate(where,update)
        res.send({status:0})
      }
    }
  } catch (error) {
    res.send({status:500})
  }
})

// 修改好友昵称
router.post('/updatenickname',async (req,res) => {
  const {uid,fid,message} = req.body
  // console.log(message)
  let where = {'userID':uid,'friendID':fid}
  let update = {'nickname':message}
  try {
    let result = await FriendModel.updateOne(where,update)
    // console.log(result)
    res.send({status:0})
  } catch (error) {
    res.send({status:500})
  }
})

// 获取好友昵称
router.post('/getnickname',async (req,res) => {
  const {uid,fid} = req.body
  let where = {'userID':uid,'friendID':fid}
  try {
    let result = await FriendModel.find(where)
    res.send({status:0,data:result})
  } catch (error) {
    res.send({status:500})
  }
})





module.exports = router;
