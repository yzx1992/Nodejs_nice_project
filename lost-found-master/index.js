var express = require('express')
var mongoose = require('mongoose')
var models = require('./models')
var bodyParser = require('body-parser')
var session = require('express-session')
var MongoDBStore = require('connect-mongodb-session')(session)
var OAuth = require('wechat-oauth')

var client = new OAuth('appid', 'appsecret')

var store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/test',
  collection: 'mySessions'
})
store.on('error', function(error) {
  assert.ifError(error);
  assert.ok(false);
});

var app = express()
app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : true}))
app.set('view engine', 'ejs')
app.use(session({
  secret: 'sspku',
  resave: false,
	saveUninitialized: true,
  store: store,
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 7}
}))

mongoose.connect('mongodb://localhost:27017/test')
mongoose.connection.on('error', console.error.bind(console, '连接数据库失败'))
var Item = models.Item

Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

app.get('/', function(req, res){
  if(req.query.code){
    client.getAccessToken(req.query.code, function(err, result){
      var accessToken = result.data.access_token
      var openid = result.data.openid
      client.getUser(openid, function(err, result){
        req.session.user = {nickname: result.nickname, headimgurl: result.headimgurl}
        res.redirect('/')
      })
    })
  }
  else{
    if(!req.session.user){
      var url = client.getAuthorizeURL('site', 'STATE', 'snsapi_userinfo')
      return res.redirect(url)
    }
    //console.log(req.session.user.headimgurl)
    var curPage = 1, totalPage, data
    if(req.query.curPage && req.query.curPage > 0){
      curPage = req.query.curPage
    }
    Item.find({}).count().exec(function(err, res){
      totalPage = parseInt((res + 4) / 5)
      if(totalPage == 0){
        totalPage = 1
      }
    })
    Item.find({}).sort({createTime: -1}).limit(5).skip(5 * (curPage - 1)).exec(function(err, res2){
      data = res2
      var json = {curPage: curPage, totalPage: totalPage, data: data}
      //console.log(data)
      res.render('index', {json: json})
    })
  }
})

app.get('/add', function(req, res){
  if(!req.session.user){
    var url = client.getAuthorizeURL('site', 'STATE', 'snsapi_userinfo')
    return res.redirect(url)
  }
  res.render('add')
})

app.post('/add', function(req, res){
  //console.log(req.body)
  if(!req.session.user){
    var url = client.getAuthorizeURL('site', 'STATE', 'snsapi_userinfo')
    return res.redirect(url)
  }
  var title = req.body.title, descripthon = req.body.descripthon, contact = req.body.contact
  var temp = new Item({
    title: title,
    descripthon: descripthon,
    contact: contact,
    nickname: req.session.user.nickname,
    headimgurl: req.session.user.headimgurl,
    createTime: new Date().Format("yyyy-MM-dd hh:mm:ss")
  })
  temp.save(function(err, doc){
    if(err){
      console.log(err)
    }
    //console.log(doc)
    res.redirect('/')
  })
})

app.get('/show', function(req, res){
  if(!req.session.user){
    var url = client.getAuthorizeURL('site', 'STATE', 'snsapi_userinfo')
    return res.redirect(url)
  }
  if(!req.query._id){
    res.redirect('/')
  }
  var _id = req.query._id
  Item.findOne({_id: _id}).exec(function(err, res2){
    res.render('show', {json: res2})
  })
})

app.listen(80, (req, res) => {
	console.log('app is running at port 80');
})
