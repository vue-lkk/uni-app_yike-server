const express = require('express')
const router = express.Router()

// 群 表
const GroupModel = require('../models/group')
// 群成员表
const GroupMemberModel = require('../models/groupMember')
// 群消息表
const GroupMessageModel = require('../models/groupMessage')

// 获取群列表
router.post('/getgroup', async (req, res) => {
  const { uid } = req.body
  try {
    const result = await GroupMemberModel
      .find({})
      .where({ 'userID': uid })
      .populate('groupID')
      .sort({ 'lastTime': -1 })
      .exec()
    let groupList = result.map(group => {
      return {
        gid: group.groupID._id,
        name: group.groupID.name,
        nickname: group.nickname, //成员表中的群昵称
        imgurl: group.groupID.imgurl,
        tip: group.tip,   // 群消息数
        lastTime: group.lastTime // 成员表中的最后时间
      }
    })
    res.send({ status: 0, data: groupList })
  } catch (error) {
    res.send({ status: 500 })
  }
})

router.get('/all', async (req, res) => {
  let result = await GroupMessageModel.find()
  res.send({ status: 0, data: result })
})

// 增加群未读数量方法
const unReadTotal = async function (uid, gid) {
  let where = { 'userID': { $ne: uid }, 'groupID': gid, systemMsg: 0 }
  let where1 = {}
  // 查找群成员初始化消息列表
  let result = await GroupMessageModel.find(where)
  console.log('!!!', result)
  result.forEach(async (item) => {
    let update = { 'tips': item.tips + 1 }
    // 更改群成员初始化消息的未读消息数
    where1 = { 'userID': item.userID, 'groupID': item.groupID, systemMsg: 0 }
    await GroupMessageModel.updateMany(where1, update)
  })
}


// 添加一条群消息方法
exports.addGroupMsg = async function (uid, gid, message, types) {
  unReadTotal(uid, gid)
  try {
    let data = {
      userID: uid,// 发送者id
      groupID: gid,// 接收者id
      message,// 发送内容 
      types,// 内容类型 --（0文字，1图片链接，2音频链接）                   
      state: 1,// 消息状态 --（0已读，1未读)    
      tips: 0, // 记录未读数                           
      time: new Date()// 发送时间
    }
    let result = await GroupMessageModel.create(data)
    return result
  } catch (error) {

  }
}

// 添加一条群消息接口
router.post('/addmsg', async (req, res) => {
  const { uid, gid, message, types } = req.body
  try {
    let data = {
      userID: uid,// 发送者id
      groupID: gid,// 群id
      message,// 发送内容 
      types,// 内容类型 --（0文字，1图片链接，2音频链接）                   
      state: 1,// 消息状态 --（0已读，1未读)                             
      time: new Date()// 发送时间
    }
    let result = await GroupMessageModel.create(data)
    res.send({ status: 0, data: result })
  } catch (error) {
    res.send({ status: 1, data: error })
  }
})


// 群分页聊天
router.post('/page', async (req, res) => {
  const { page, pageSize, gid } = req.body
  // 跳过的条数
  let skipNum = (page - 1) * pageSize
  // console.log(skipNum)
  try {
    const result = await GroupMessageModel
      .find({})
      .where({ 'groupID': gid })
      .sort({ 'time': -1 })
      .populate('userID')
      .skip(skipNum)  // 跳过条数
      .limit(pageSize) // 查询几条
      .exec()
    // res.send({status:0,data:result})
    console.log(result)
    // return
    let chatList = result.map(chat => {
      return {
        id: chat._id,   // 消息id
        fromid: chat.userID._id,  // 发送者ID
        message: chat.systemMsg === 0 ?'"' +  chat.userID.username  + '" ' + "加入群聊" : chat.message,  // 内容
        types: chat.types,  // 消息类型
        imgurl: chat.userID.imgurl,  // 发送者头像
        name: chat.userID.username, // 发送者名字
        systemMsg:chat.systemMsg,  // 系统消息
        time: chat.time
      }
    })
    res.send({ status: 0, data: chatList })
  } catch (error) {
    res.send({ status: 500 })
  }
})

// 获取一对一未读消息数
router.post('/unreadmsg', async (req, res) => {
  const { uid, gid } = req.body
  try {
    // $ne排除自己的id
    let where = { 'userID': { $ne: uid }, 'groupID': gid, 'state': 1 }
    const result = await GroupMessageModel.countDocuments(where)
    res.send({ status: 0, data: { total: result } })
  } catch (error) {
    res.send({ status: 500 })
  }
})

// 获取群读未读消息数
router.post('/unreadgroupmsg', async (req, res) => {
  const { uid, gid } = req.body
  try {
    // 获取自己的未读消息
    let where = { 'userID': uid, 'groupID': gid, 'systemMsg': 0 }
    const result = await GroupMessageModel.find(where)
    res.send({ status: 0, data: { total: result[0].tips } })
  } catch (error) {
    res.send({ status: 500 })
  }
})



// 更新群最后通信时间 
exports.updategrouplasttime = async function (uid, gid) {
  try {
    let where = { 'userID': uid, '_id': gid }
    // 实时时间
    let update = { 'lastTime': new Date() }
    // 更新2条
    let res = await FriendModel.GroupModel(where, update)
    console.log('最新一条消息', res)
  } catch (error) {
    console.log('更新群最后通信时间出错')
  }
}

// 群最后一条消息
router.post('/getlastgroupmsg', async (req, res) => {
  const { gid } = req.body
  try {
    const result = await GroupMessageModel
      .findOne({})
      .where({ 'groupID': gid })
      .populate('userID')
      .sort({ 'time': -1 })
      .exec()
    // console.log('******',result)

    res.send({
      status: 0, data: {
        message: result.message,
        types: result.types,
        name: result.userID.username,
        time: result.time
      }
    })
  } catch (error) {
    res.send({ status: 500 })
  }
})

// 修改群未读消息改为已读
router.post('/readgroupmsg', async (req, res) => {
  const { uid, gid } = req.body
  try {
    let where = { 'userID': uid , 'groupID': gid, 'systemMsg': 0 }
    let updateState = { 'tips': 0 }
    const result = await GroupMessageModel.updateOne(where, updateState)
    res.send({ status: 0, data: result })
  } catch (error) {
    res.send({ status: 500 })
  }
})


// 添加群成员方法
async function insertGroupMember(data) {
  await GroupMemberModel.create(data)
}

// 给每个成员初始化一条消息方法
async function initOneMsg(uid, gid) {
  // 初始化一条消息
  let data = {
    userID: uid,// 成员id
    groupID: gid,// 群id
    message: '[系统消息]',// 发送内容 
    types: 0,// 内容类型 --（0文字，1图片链接，2音频链接）                   
    state: 0,// 消息状态 --（0已读，1未读)    
    tips: 0, // 记录未读数  
    systemMsg: 0, // 系统消息                         
    time: new Date()// 发送时间
  }
  await GroupMessageModel.create(data)
}

// 建群
router.post('/creategroup', async (req, res) => {
  /**
   * uid： 用户id
   * name: 群名
   * imgurl：群体现
   * memberList: 成员id数组
   */
  let { uid, name, imgurl, memberList } = req.body
  console.log(req.body)
  try {
    // 创建群信息
    let gruopData = {
      userID: uid,         // 群主id
      name,               // 群名 
      imgurl,             // 群封面链接
      time: new Date(),    // 群建立时间
    }
    // 创建群
    let result = await GroupModel.create(gruopData)
    // 添加群主入群
    let udata = {
      groupID: result._id, // 群id
      userID: uid,  // 用户id 
      // name:'',    // 群内名
      // tip:'',     // 未读消息数
      // shield:'',  // 是否屏蔽群消息
      time: new Date(),    // 加入时间
      lastTime: new Date(),// 最后通信时间（后加入项）
    }
    // 加入
    insertGroupMember(udata)
    initOneMsg(uid, result._id)
    // 添加好友入群
    memberList.map(async (fid) => {
      let fdata = {
        groupID: result._id, // 群id
        userID: fid,     // 用户id 
        // name:'',    // 群内名
        // tip:'',     // 未读消息数
        // shield:'',  // 是否屏蔽群消息
        time: new Date(),    // 加入时间
        lastTime: new Date(),// 最后通信时间（后加入项）
      }
      // 加入
      insertGroupMember(fdata)
      initOneMsg(fid, result._id)
    })
    res.send({ status: 0, message: '创建群成功！' })
  } catch (error) {
    res.send({ status: 500 })
  }
})

// 获取群信息
router.post('/getgroupinfo', async (req, res) => {
  const { gid } = req.body
  try {
    const result = await GroupModel.find({ "_id": gid })

    res.send({ status: 0, data: result })
  } catch (error) {
    res.send({ status: 500 })
  }
})

// 获取群成员
router.post('/getgroupmembers', async (req, res) => {
  const { gid } = req.body
  try {
    const result = await GroupMemberModel
      .find({})
      .where({ 'groupID': gid })
      .populate('userID')
      .sort({ 'lastTime': -1 })
      .exec()
      console.log(result)
    let memberList = result.map(member => {
      return {
        uid: member.userID._id,   // 成员id
        username: member.userID.username,  // 成员名字
        imgurl: member.userID.imgurl,  // 成员头像
        groupalias:member.name, // 群内名
        shield:member.shield // 屏蔽群消息
      }
    })
    res.send({ status: 0, data: memberList })
  } catch (error) {
    res.send({ status: 500 })
  }
})

// 修改群信息
router.post('/updategroupinfo', async (req,res) => {
  try {
    const {gid,type,message} = req.body
    let where = {'_id':gid}
    let update = {}
    let result = await GroupModel.find(where)
    // res.send({status:0,data:result})
    // return 
    if(result.length > 0) {
      update[type] = message
      await GroupModel.findByIdAndUpdate(where,update)
      res.send({status:0})
    }
  } catch (error) {
    res.send({status:500})
  }
})

// 修改群内名、群消息屏蔽
router.post('/updatememberinfo', async (req,res) => {
  try {
    const {gid,uid,type,message} = req.body
    console.log(gid,uid,type,message)
    let where = {'groupID':gid,'userID':uid}
    let update = {}
    let result = await GroupMemberModel.find(where)
    // res.send({status:0,data:result})
    // return 
    if(result.length > 0) {
      update[type] = message
      // 如果不存在此字段，就会新添加,注意字段名必须与表中的字段一致
      await GroupMemberModel.updateOne(where,update) 
      res.send({status:0})
    }
  } catch (error) {
    res.send({status:500})
  }
})



module.exports.groupRouter = router
