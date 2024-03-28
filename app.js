var createError = require('http-errors');
var express = require('express');
var path = require('path');
// cookie解析器
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// 使用CORS 中间件解决跨域问题
const cors = require('cors')
// 引入自定义secret密钥
const {secretKey}  = require('./config/jwt')
// 将JWT字符串还原为json对象
const expressJWT = require('express-jwt')

// 注册、登录相关路由
var indexRouter = require('./routes/index');
// 搜索相关路由
var searchRouter = require('./routes/search')
// 用户相关路由
var usersRouter = require('./routes/users');
// 好友相关路由
var {friendRouter} = require('./routes/friend')
// 文件上传相关路由
var fileRouter = require('./routes/file')
// 一对一消息相关路由
var messageRouter = require('./routes/message')
// 群相关路由
var {groupRouter} = require('./routes/group')
// 测试路由
var testRouter = require('./routes/test')

var app = express();

app.use(cors())

// app.use(expressJWT({ secret: secretKey }).unless({ path: [/^\/api\//] }))


// view engine setup(查看引擎设置)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// 必须放到静态资源之后
app.use(expressJWT({ secret: secretKey }).unless({ path: ['/register','/login','/test/email','/verify'] }));

app.use('/', indexRouter)
app.use('/search',searchRouter)
app.use('/user', usersRouter)
app.use('/friend',friendRouter)
app.use('/file',fileRouter)
app.use('/message',messageRouter)
app.use('/group',groupRouter)
app.use('/test', testRouter)

// catch 404 and forward to error handler(捕获404并转发给错误处理程序)
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler(错误处理程序)
app.use(function(err, req, res, next) {
  // set locals, only providing error in development(设置局部变量，只在开发过程中提供错误)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page(呈现错误页面)
  res.status(err.status || 500);

  if(err.name === 'UnauthorizedError') {
    return res.send({status:401,message:'无效的token'})
  }
  res.render('error');
});

module.exports = app;
