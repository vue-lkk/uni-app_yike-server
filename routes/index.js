var express = require('express');
var router = express.Router();

// 密码加密
const bcrypt = require('bcrypt')

// 引入用户表
const UserModel = require('../models/users')

// 引入自定义secret密钥
const {secretKey}  = require('../config/jwt')
// 生成JWT字符串
const jwt = require('jsonwebtoken')


// 注册页面
// 注册
router.post('/register', async (req,res) => {
  let {username,email,password} = req.body
  // 密码加密
  password = await bcrypt.hash(password, 10)
  // 操作用户表
  try {
    let result = await UserModel.find({
      $or:[{username},{email}]
    })
    if(result.length > 0) {
      res.send({status:1,message:'用户或者邮箱已存在！'})
      return
    }
    // 新增用户
    await UserModel.create({
      username,  // 用户名
      email,     // 邮箱
      password,  // 密码
      time: new Date() // 注册时间
    })
    res.send({status:0,message:'注册成功!'})
  } catch (error) {
    res.send({status:500,message:'注册失败!'})
  }
})

// 注册时验证用户名或邮箱是否存在
router.post('/verify', async (req,res) => {
  let {username,email} = req.body
  try {
    let result = await UserModel.find({
      $or:[{username},{email}]
    })

    if(result.length > 0 && username) {
      res.send({status:1,message:'用户已存在！'})
    }else if(result.length > 0 && email){
      res.send({status:1,message:'邮箱已存在！'})
    }else{
      res.send({status:0,message:'不存在'})
    }
  } catch (error) {
    res.send({status:500,message:'错误'})
  }
})

// 登录页面
// 登录
router.post('/login', async (req,res) => {
  const {username, password} = req.body
  
  // 查询用户
  const result = await UserModel.find({username})
  // 判断是否存在此用户
  if(result.length > 0) {
    // 加密密码与用户输入的密码进行对比验证，返回布尔值
    const compareResult = await bcrypt.compare(password,result[0].password)
    // 对比密码是否正确
    if(!compareResult) {
      return res.json({status:1, message:'登录失败,用户名或密码错误!'})
    }
    // 剔除密码
    const userInfo = Object.assign(result[0],{password:''})
    // console.log(userInfo)
    // 生成token字符串
    // 参数1：用户的信息对象
    // 参数2：自定义secre密钥
    // 参数3：配置token有效期
    const tokenStr = jwt.sign({...userInfo},secretKey,{expiresIn:'10h'})
    return res.json({status:0, data:{
      message:'登录成功!',
      id:userInfo._id,
      username:userInfo.username,
      imgurl:userInfo.imgurl,
      token:'Bearer ' + tokenStr
    }})
  }
  res.json({status:1, message:'用户不存在,先去注册!'})
})




module.exports = router;
