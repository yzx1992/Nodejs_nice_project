var express = require('express');
var path = require('path');
var app = express();
var xmlparser = require('express-xml-bodyparser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var util = require('./util').util;
var settings = require('./config').settings;
var mongoose=require('mongoose');
var RequestModel = require('./models').RequestModel;
var UserModel = require('./models').UserModel;
mongoose.connect('mongodb://localhost:27017/logistic');
mongoose.connection.on('error',console.error.bind(console,'连接数据库失败'));

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret:'session_logistic',
  resave:false,
  saveUninitialized:true,
  store:new MongoStore({url:'mongodb://localhost:27017/logistic'})
}));

app.get('/',function(req,res){
  console.log('进入应用');
  console.log(req.body);
  req.session.destroy();
  var redirect_uri = "logistic.mysspku.com/main";
  res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid="+settings.CORPID+"&redirect_uri="+redirect_uri+"&response_type=code&scope=snsapi_base#wechat_redirect");
});

app.get('/main',function(req,res,next){
  console.log('进入main');
  console.log(req.url);
  var query = require('url').parse(req.url).query;
  var params = require('qs').parse(query);
  var code  = params.code||"";
  var user = req.session.user;
  if(!user){
    console.log('no user in session');
    util.getUserInfoByCode(code,function(d){
      console.log(d);
      var userId = d.UserId;
      util.getUserInfo(userId,function(userinfo){
        console.log(userinfo);
        var userid = userinfo.userid;
        req.session.user = userinfo;//保存到session
        var position = userinfo.position||"";
        var count = UserModel.count({ 'uid': userid },function(err,count){
          if(count>0){
            console.log('更新user');
            UserModel.update({'uid':userid},{
              'position':position
            }).exec();
          }else{
            console.log('添加user');
            var user = new UserModel({
              uid:userid,
              position:position
            });
            user.save(function(err,doc){
              if(err){console.log(err+'保存user出错');}
            });
          }
        });
        var data = {
          title:'故障报修',
          reqData:""
        };
        if(position==="后勤人员"){
          var time = new Date();
          var t = ''+time.getFullYear()+'-'+(time.getMonth()+1)+'-'+time.getDate();
          RequestModel.find({'time':t},function(err,doc){
            if(err){console.log(err+'查询request数据失败');}
            console.log(doc);
            data.reqData = doc||"";
            if(doc.length<=0)data.reqData = "";
            res.render('logistic',data);
          });
        }else{
          res.render('index',data);
        }
      });
    });
  }else{
    console.log('user in session'+JSON.stringify(user));
    var position = user.position||"";
    var data = {
      title:'故障报修',
      reqData:""
    };
    if(position==="后勤人员"){
      var time = new Date();
      var t = ''+time.getFullYear()+'-'+(time.getMonth()+1)+'-'+time.getDate();
      RequestModel.find({'time':t},function(err,doc){
        if(err){console.log(err+'查询request数据失败');}
        console.log(doc);
        data.reqData = doc||"";
        if(doc.length<=0)data.reqData = "";
        res.render('logistic',data);
      });
    }else{
      res.render('index',data);
    }
  }
});

app.get('/water',function(req,res,next){
  var userid = req.session.user.userid||"";
  if(userid===""){
    var data = {
      title:'送水'
    };
    res.render('water',data);
  }else{
    UserModel.findOne({'uid':userid},function(err,doc){
      if(err){console.log(err+'查询user数据失败');}
      var domId = "";
      if(doc){
        domId = doc.domId||"";
      }
      var data = {
        title:'送水',
        domId:domId
      };
      res.render('water',data);
    });
  }
});

app.get('/fix',function(req,res,next){
  var userid = req.session.user.userid||"";
  if(userid===""){
    var data = {
      title:'送水'
    };
    res.render('water',data);
  }else{
    UserModel.findOne({'uid':userid},function(err,doc){
      if(err){console.log(err+'查询user数据失败');}
      var domId = "";
      if(doc){
        domId = doc.domId||"";
      }
      var data = {
        title:'故障报修',
        domId:domId
      };
      res.render('fix',data);
    });
  }
});

//no use
app.post('/',xmlparser({trim: false, explicitArray: false}),function(req,res,next){
  console.log(req.body);
  var openId = req.body.xml.fromusername;
  console.log(openId);
  res.end("");
});

app.post('/getWater',function(req,res,next){
  console.log(req.body);
  var domId = req.body.domId||"";
  var brand = req.body.brand||"";
  var extra = req.body.extra||"";
  if(domId===""||brand==="")res.end('invalid request');
  if(extra!==""){
    extra = "("+extra+")";
  }
  var msg = "收到新的送水请求！"+"宿舍"+domId+"需要一桶"+brand+extra+"。";
  console.log(msg);
  var time = new Date();
  var t = ''+time.getFullYear()+'-'+(time.getMonth()+1)+'-'+time.getDate();
  var userid = req.session.user.userid||"";
  var position = req.session.user.position||"";
  var request = new RequestModel({
    reqType:'water',
    uid:userid,
    msg:msg,
    time:t
  });
  var count = UserModel.count({ 'uid': userid },function(err,count){
    if(count>0){
      console.log('更新user');
      UserModel.update({'uid':userid},{
        'position':position,
        'domId':domId
      }).exec();
    }else{
      var user = new UserModel({
        uid:userid,
        position:position,
        domId:domId
      });
      user.save(function(err,doc){
        if(err){
          console.log(err+'保存user出错');
          return res.redirect('/water');
        }
      });
    }
  });
  request.save(function(err,doc){
    if(err){
      console.log(err+'保存request出错');
      return res.redirect('/water');
    }
    console.log('保存数据成功！');
    //发送到后勤人员
    // util.sendMessage("1501211015",msg,function(err){
    //   if(err){res.end(err);}
    //   else{res.end("ok");}
    // });
    UserModel.find({'position':'后勤人员'},function(err,doc){
      if(err){console.log(err);}
      console.log(doc);
      if(doc.length>0){
        var tosuer = doc[0].uid+"";
        for(var i = 1; i<doc.length; i++){
          var uid = doc[i].uid;
          tosuer += ("|"+uid);
        }
        util.sendMessage(tosuer,msg,function(err){
          if(err){res.end(err);}
          else{res.end("ok");}
        });
      }else{
        util.sendMessage("1501211015",msg,function(err){
          if(err){res.end(err);}
          else{res.end("ok");}
        });
      }
    });
  });
});

app.post('/getfix',function(req,res,next){
    console.log(req.body);
    var domId = req.body.domId||"";
    var fixreason = req.body.fixreason||"";
    var extra = req.body.extra||"";
    if(domId===""||fixreason==="")res.end('invalid request');
    if(extra!==""){
      extra = "("+extra+")";
    }
    var msg = "收到新的故障维修请求！"+"宿舍"+domId+","+fixreason+extra+"。";
    console.log(msg);
    var time = new Date();
    var t = ''+time.getFullYear()+'-'+(time.getMonth()+1)+'-'+time.getDate();
    var userid = req.session.user.userid||"";
    var position = req.session.user.position||"";
    var request = new RequestModel({
      reqType:'fix',
      userid:userid,
      msg:msg,
      time:t
    });

    var count = UserModel.count({ 'uid': userid },function(err,count){
      if(count>0){
        console.log('更新user');
        UserModel.update({'uid':userid},{
          'position':position,
          'domId':domId
        }).exec();
      }else{
        var user = new UserModel({
          uid:userid,
          position:position,
          domId:domId
        });
        user.save(function(err,doc){
          if(err){
            console.log(err+'保存user出错');
            return res.redirect('/fix');
          }
        });
      }
    });
    request.save(function(err,doc){
      if(err){
        console.log(err+'保存request出错');
        return res.redirect('/fix');
      }
      console.log('保存数据成功！');
      // util.sendMessage("1501211015",msg,function(err){
      //   if(err){res.end(err);}
      //   else{res.end("ok");}
      // });
      UserModel.find({'position':'后勤人员'},function(err,doc){
        if(err){console.log(err);}
        console.log(doc);
        if(doc.length>0){
          var tosuer = doc[0].uid+"";
          for(var i = 1; i<doc.length; i++){
            var uid = doc[i].uid;
            tosuer += ("|"+uid);
          }
          util.sendMessage(tosuer,msg,function(err){
            if(err){res.end(err);}
            else{res.end("ok");}
          });
        }else{
          util.sendMessage("1501211015",msg,function(err){
            if(err){res.end(err);}
            else{res.end("ok");}
          });
        }
      });
    });
});

app.listen(settings.PORT,function(req,res,next){
  console.log("Server runing at port: " + settings.PORT);
});
