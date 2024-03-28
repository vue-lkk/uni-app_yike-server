const express = require('express')
const router = express.Router()

// 引入邮箱发送方法
const {emailSignUp} = require('../views/emailserver')


// 测试
router.get('/', function(req,res,next) {
  // console.log('@',req.user)
  res.send({
    status:200,
    data:{
      name:'lkk',
      age:18
    }
  })
})

// 邮箱测试
router.post('/email',function(req, res) {
  let {email} = req.body
  emailSignUp(email,res)
})

module.exports = router