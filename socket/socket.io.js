const {updatefriendlasttime,addmsg} = require('../routes/friend')
const {updategrouplasttime,addGroupMsg} = require('../routes/group')

module.exports = function(io) {
  // 收集注册socket的用户列表
  let user = {}

  // 连接
  io.on('connection',(socket) => {
    console.log('客户端socket连接成功!!!')

    // 接收前端用户登录时的用户id
    socket.on('login',(id) => {
      console.log('-----登录id:',id)
      // 后端发送socket.id到前端
      socket.emit('login',socket.id)
      // 将客户端发送过来的用户id,存储到socket对象上
      socket.name = id
      user[id] = socket.id
      // user输出： { '65d4423ce5e3655e482af7b8': 'V6jhIIxtCKNd_LV8AAAD' }
      console.log('user:',user)
    })

    // 用户一对一聊天消息
    socket.on('msg',(data) => {
      console.log('用户一对一聊天消息:',data)
      // {消息内容, 自己的id, 聊天对象的id, 消息类型}
      let {msg,fromId,toId,types} = data
      if(types == 3) {
        msg = JSON.stringify(msg)
      }
      // 操作数据：更新好友最后通信时间
      updatefriendlasttime(fromId,toId)
      // 操作数据：添加一对一消息
      addmsg(fromId,toId,msg,types)

      // 发送给全部连接上的客户端 [浏览器为单位]
      // io.emit('msg',msg,fromId,types,0)  
      // 发送给对方
      if(user[toId]) {
        socket.to(user[toId]).emit('msg',msg,fromId,types,0)
      }
      // 发送给自己
      socket.emit('msg',msg,toId,types,1)
    })

    // 清除未读消息
    socket.on('readMsg',(data) => {
      const {fromId,toid} = data
      socket.emit('readMsg',fromId,toid)
      
    })

    // 加入群
    socket.on('group',(gid) => {
      console.log('群id---',gid)
      // 加入名为根据群id命名的的房间
      socket.join(gid)
    })

    // 接收群消息
    socket.on('groupMsg',(data) => {
      // {消息内容, 自己的id, 群id, 消息类型}  
      let {msg,fromId,toId,types,imgurl,name} = data
      if(types == 3) {
        msg = JSON.stringify(msg)
      }
      // 操作数据：更新群最后通信时间
      updategrouplasttime(fromId,toId)
      // 操作数据：添加一条群消息
      addGroupMsg(fromId,toId,msg,types)
      // 广播到房间中所有连接的客户端
      socket.to(toId).emit('groupMsg',msg,toId,types,0,imgurl,name)
      // 发送给自己
      socket.emit('groupMsg',msg,toId,types,1,imgurl,name)
    })


    // 离开
    socket.on('disconnecting',() => {
      // 返回一个布尔值，检查对象自身属性中是否具有指定属性
      // console.log(user.hasOwnProperty(socket.name))
      console.log('离开',socket.id)
      if(user.hasOwnProperty(socket.name)) {
        // 离开时删除
        delete user[socket.name]
        console.log('@2',user)
      }
    })
  })  
}