const express = require('express')
const router = express.Router()
const fs = require('fs');
const path = require('path')

// 创建目录的函数
// 定义一个函数叫做mkdir
function mkdir(pathname, callback) {
  // 需要判断是否是绝对路径(避免不必要的bug)
  pathname = path.isAbsolute(pathname) ? pathname : path.join(__dirname, pathname);
  console.log('@@@',pathname)  // D:\前端全部项目\yike移动端聊天App\yike-server\public\test
  // 获取相对路径
  pathname = path.relative(__dirname,pathname)
  console.log('@',pathname)  // ..\public\test

  let folders = pathname.split(path.sep); // 使用路径分隔符分割路径: 
  console.log(folders) // [ '..', 'public', 'test' ]

  let pre = ""; // 定义一个前缀

  // 遍历文件夹
  folders.forEach(folder => {
    try {
      // 没有异常，文件已经创建，提示用户文件已经创建
      let stat = fs.statSync(path.join(__dirname, pre, folder));
      let hasMkdir = stat && stat.isDirectory();
      // console.log('***',hasMkdir)
      if (hasMkdir) {
        throw `文件 ${folder} 已经存在，不能重复创建，请重新创建`;
      }
    } catch (error) {
      // 抛出异常，文件不存在则创建文件
      try {
        // 避免父文件还没有创建的时候先创建子文件所出现的意外错误，这里选择同步创建文件
        fs.mkdirSync(path.join(__dirname, pre, folder));
        callback(null); // 成功创建目录，回调null
      } catch (error) {
        callback(error); // 创建失败，回调error
      }
    }
    pre = path.join(pre, folder); // 路径拼合
    // console.log('#',pre)
  });
}


// 引入multer处理(multipart/form-data) 表单
const multer = require('multer')
// 控制文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let {dirname, filename} = req.body
    // console.log('----',dirname)
    // 前端提供动态保存文件夹
    // mkdir(`../public/${dirname}`,(err) => {
    //   console.log(err)
    // })

    // let stat = fs.statSync(path.resolve(__dirname,`../public/${dirname}`));
    // let hasMkdir = stat && stat.isDirectory();
    // if(!hasMkdir) {
    //   fs.mkdirSync(path.resolve(__dirname, `../public/${dirname}`));
    // }else{
    //   console.log('文件夹已存在！')
    // }

    // 配置文件上传目录
    cb(null, path.resolve(__dirname, `../public/20240307`))
  },
  filename: function (req, file, cb) {
    // 获取文件后缀名
    const ext = path.extname(file.originalname)
    // 时间戳+随机数
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // 重命名文件
    cb(null, uniqueSuffix + ext)
  }
})
const upload = multer({ storage: storage })

// 上传文件
router.post('/upload', upload.array('avatar', 9), (req, res) => {
  const {dirname} = req.body

  res.send({
    status: 0, 
    data: {
      filepath: '/' + '20240307' + '/' +  req.files[0].filename,
    }
  })
})

module.exports = router
