var express = require('express');
var webot = require('weixin-robot');

var log = require('debug')('webot-example:log'); //print
var verbose = require('debug')('webot-example:verbose');//明文显示调试信息等,

// 启动服务
var app = express();

// 设置token
var wx_token = process.env.WX_TOKEN || 'unix';

// 载入回复规则
require('./rules')(webot);

// 启动机器人, 接管 web 服务请求
webot.watch(app, { token: wx_token });

// 如果需要 session 支持，sessionStore 必须放在 watch 之后
app.use(express.cookieParser());
// 为了使用 waitRule 功能，需要增加 session 支持
app.use(express.session({
  secret: 'abced111',
  store: new express.session.MemoryStore()
}));
// 在生产环境，你应该将此处的 store 换为某种永久存储。
// 请参考 http://expressjs.com/2x/guide.html#session-support

// 在环境变量提供的 $PORT 或 3000 端口监听
var port = process.env.PORT || 3000;
app.listen(port, function(){
  log("Listening on %s", port);
});

// 微信接口地址只允许服务放在 80 端口
// 所以需要做一层 proxy
app.enable('trust proxy');

// 当然，如果你的服务器允许，你也可以直接用 node 来 serve 80 端口
// app.listen(80);

if(!process.env.DEBUG){ //最后是否显示调试信息
  console.log("set env variable `DEBUG=webot-example:*` to display debug info.");
}
