var express = require('express');
var path = require('path');
var wxqiyehao = require("wechat-crypto")
var config = require('./config');
var wxqiyehao = require("wechat-crypto")
//var wxprocessor = require('./wxprocessor');
// var wxprocessor = require('./wxprocessor');
var session = require('express-session');
var app = express();
var bodyParser  = require('body-parser');

var xmlparser = require('express-xml-bodyparser');
var xml_Parse = require('xml2js').parseString;
var Util = require('./util');
var util = new Util();
var settings = new config();
//var processor = new wxprocessor();
var openid='';
var mailsender = require('./mailsend');
var mailreceiver = require('./getmail').getmail;

var w_config = require('./waterline/config').config;
var w_orm    =  require('./waterline/instance').orm;
var User;
w_orm.initialize(w_config,function(err,models){
  if(err) throw err;
  console.log("database initialize success");
  User = models.collections.user;
});
// var Util = require('./util');
// var util = new Util();
var settings = new config();
// var processor = new wxprocessor();

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));

var openid ="";

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
//util.createMenu();

app.get('/',function(req,res){
    var query = require('url').parse(req.url).query;
    var params = require('qs').parse(query);
    var signature = params.msg_signature||"";
    var timestamp = params.timestamp||"";
    var nonce = params.nonce||"";
    var echostr = params.echostr||"";

    if(signature!==""&&timestamp!==""&&nonce!==""&&echostr!==""){
        console.log('验证签名');
        var crypto = new wxqiyehao(settings.TOKEN,settings.encodingAES,settings.corpID);
        var s = crypto.decrypt(echostr);
        res.end(s.message);
    }else{
        res.cookie('openid', openid, {maxAge: 1000*60*60*24*7});
        console.log(openid);
        res.render('index',{title:'邮箱绑定', openid: openid});
    }
});

app.post('/',xmlparser({trim: false, explicitArray: false}),function(req,res,next){
    console.log(req.body);
    var crypto = new wxqiyehao(settings.TOKEN,settings.encodingAES,settings.corpID);
    var s = crypto.decrypt(req.body.xml.encrypt);
    console.log(s.message);
    xml_Parse(s.message, function(err, data) {
        if (err) {
            console.log(err);
            res.end('err');
        } else {
            console.log(data);
            console.log(data.xml.FromUserName);
            openid = data.xml.FromUserName;
        }
    });
    res.end("");
});

//app.get('/',function(req,res){
//  console.log('get');
//  var query = require('url').parse(req.url).query;
//  var params = require('qs').parse(query);
//  var signature = params.signature||"";
//  var timestamp = params.timestamp||"";
//  var nonce = params.nonce||"";
//  var echostr = params.echostr||"";
//  if(signature!==""&&timestamp!==""&&nonce!==""&&echostr!==""){
//    console.log('验证签名');
//    if(!processor.checkSignature(params, settings.TOKEN)){//签名错误
//      res.end('signature fail');
//    }else{
//      res.end(params.echostr);
//    }
//  }else{
//    res.cookie('openid', openid, {maxAge: 1000*60*60*24*7});
//    console.log(openid);
//    res.render('index',{title:'邮箱绑定'});
//  }
//});
//
//app.post('/',xmlparser({trim: false, explicitArray: false}),function(req,res,next){
//  console.log(req.body);
//  openid=req.body.xml.fromusername;
//  res.end("");
//});
app.get('/mailbind',function(req,res){
  res.render('mailbindlist',{title:'邮箱绑定'});
});

app.get('/qqmailbind',function(req,res){
  res.cookie('mailtype', 'qq', {maxAge: 1000*60*60*24*7});
  res.render('mailbind',{title:'QQ邮箱绑定'});
});
app.get('/nemailbind',function(req,res){
  res.cookie('mailtype', 'ne', {maxAge: 1000*60*60*24*7});
  res.render('mailbind',{title:'163网易邮箱绑定'});
});
app.get('/pkumailbind',function(req,res){
  res.cookie('mailtype', 'pku', {maxAge: 1000*60*60*24*7});
  res.render('mailbind',{title:'北京大学邮箱绑定'});
});
app.post('/qqmailbind',function(req,res){
  var  userid = req.cookies.openid;
  var username = req.body.username,
      password = req.body.password,
      authcode = req.body.authcode;
  console.log("qqbind");
  console.log(userid);
  console.log(username);
  console.log(password);
    console.log(authcode);
  User.findOne({ userid: userid })
      .exec(function(err, user) {
        if(err){
          console.log(err);
          return res.redirect('/qqmailbind');
        }
        if(user){
          console.log('username exit');
          var mailtype = util.mailtypeParser(user.mailtype,"qq");
          User.update({ userid:userid},{ mailtype:mailtype,qqusername: username ,qqpassword:password,qqauthcode:authcode})
              .exec(function(err, newuser) {
                if(err){
                  console.log(err);
                  return res.redirect('/');
                }
                console.log('bind success');
                return res.redirect('/');
              });
        }
        else{
            User.create({ userid:userid,mailtype:"qq",qqusername: username ,qqpassword:password,qqauthcode:authcode})
                .exec(function(err, newuser) {
                    if(err){
                        console.log(err);
                        return res.redirect('/');
                    }
                    console.log('bind success');
                    return res.redirect('/');
                });
        }
      });
});
app.post('/nemailbind',function(req,res){
    var  userid = req.cookies.openid;
    var username = req.body.username,
        password = req.body.password,
        authcode = req.body.authcode;
    console.log("nebind");
    console.log(userid);
    console.log(username);
    console.log(password);
    User.findOne({ userid: userid })
        .exec(function(err, user) {
            if(err){
                console.log(err);
                return res.redirect('/nemailbind');
            }
            if(user){
                console.log('username exit');
                var mailtype = util.mailtypeParser(user.mailtype,"ne");
                User.update({ userid:userid},{ mailtype:mailtype,neusername: username ,nepassword:password,neauthcode:authcode})
                    .exec(function(err, newuser) {
                        if(err){
                            console.log(err);
                            return res.redirect('/');
                        }
                        console.log('bind success');
                        return res.redirect('/');
                    });
            }
            else{
                User.create({ userid:userid,mailtype:"ne",neusername: username ,nepassword:password,neauthcode:authcode})
                    .exec(function(err, newuser) {
                        if(err){
                            console.log(err);
                            return res.redirect('/');
                        }
                        console.log('bind success');
                        return res.redirect('/');
                    });
            }
        });
});
app.post('/pkumailbind',function(req,res) {
    var userid = req.cookies.openid;
    var username = req.body.username,
        password = req.body.password,
        authcode = req.body.authcode;
    console.log("pkubind");
    console.log(userid);
    console.log(username);
    console.log(password);
    User.findOne({userid: userid})
        .exec(function (err, user) {
            if (err) {
                console.log(err);
                return res.redirect('/pkumailbind');
            }
            if (user) {
                console.log('username exit');
                var mailtype = util.mailtypeParser(user.mailtype, "pku");
                User.update({userid: userid}, {
                        mailtype: mailtype,
                        pkuusername: username,
                        pkupassword: password,
                        pkuauthcode:authcode
                    })
                    .exec(function (err, newuser) {
                        if (err) {
                            console.log(err);
                            return res.redirect('/');
                        }
                        console.log('bind success');
                        return res.redirect('/');
                    });
            }
            else {
                User.create({userid: userid, mailtype: "pku", pkuusername: username, pkupassword: password,pkuauthcode:authcode})
                    .exec(function (err, newuser) {
                        if (err) {
                            console.log(err);
                            return res.redirect('/');
                        }
                        console.log('bind success');
                        return res.redirect('/');
                    });
            }
        });
});
//util.createMenu();

app.get('/',function(req,res){
  var query = require('url').parse(req.url).query;
  var params = require('qs').parse(query);
  var signature = params.msg_signature||"";
  var timestamp = params.timestamp||"";
  var nonce = params.nonce||"";
  var echostr = params.echostr||"";

  if(signature!==""&&timestamp!==""&&nonce!==""&&echostr!==""){
    console.log('验证签名');
    var crypto = new wxqiyehao(settings.TOKEN,settings.encodingAES,settings.corpID);
    var s = crypto.decrypt(echostr);
    res.end(s.message);
  }else{
    res.cookie('openid', openid);
    res.render('index',{title:'邮箱管理', openid: openid});
  }
});

app.post('/',xmlparser({trim: false, explicitArray: false}),function(req,res,next){
  console.log(req.body);
  var crypto = new wxqiyehao(settings.TOKEN,settings.encodingAES,settings.corpID);
  var s = crypto.decrypt(req.body.xml.encrypt);
  console.log(s.message);
  xml_Parse(s.message, function(err, data) {
      if (err) {
        console.log(err);
        res.end('err');
      } else {
        console.log(data);
        console.log(data.xml.FromUserName);
        openid = data.xml.FromUserName;
      }
    });
  // var event = req.body.xml.event || "";
  // if (event === "VIEW") {
  //     console.log("123");
  // }
  // console.log(openid);
    res.end("");
});

app.get('/mailunbind',function(req,res){
    var  userid = req.cookies.openid;
    console.log(userid);
    User.findOne({ userid: userid })
        .exec(function(err, user) {
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(user){
                console.log('username exit');
                console.log(user.mailtype);
                if(user.mailtype==null)
                    return res.redirect('/');
                else{
                    var mailtype =  user.mailtype.split(',');
                    if(mailtype.length==0){
                        res.render("tip_success",{
                            iconcode:0,
                            content:"请先绑定邮箱",
                            yes:'/',
                            yestext:"返回主页"});
                    }
                    else
                        res.render('mailunbindlist',{title:'请选择需要解绑邮箱',mailtype:mailtype});
                }
            }
            else{
                return res.redirect('/');
            }
        });
});
app.get('/qqmailunbind',function(req,res){
    var  userid = req.cookies.openid;
    console.log("qqunbind");
    console.log(userid);
    User.findOne({ userid: userid })
        .exec(function(err, user) {
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(user){
                console.log('username unbind');
                var mailtype = util.mailtypeDel(user.mailtype,"qq");
                User.update({ userid:userid},{ mailtype:mailtype,qqusername: null ,qqpassword:null,qqauthcode:null})
                    .exec(function(err, newuser) {
                        if(err){
                            console.log(err);
                            return res.redirect('/');
                        }
                        console.log('unbind success');
                        res.render("tip_success",{
                            iconcode:1,
                            content:"解绑成功",
                            yes:'/',
                            yestext:"返回主页"});
                    });
            }
            else{
                return res.redirect('/');
            }
        });
});
app.get('/nemailunbind',function(req,res){
    var  userid = req.cookies.openid;
    console.log("neunbind");
    console.log(userid);
    User.findOne({ userid: userid })
        .exec(function(err, user) {
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(user){
                console.log('username unbind');
                var mailtype = util.mailtypeDel(user.mailtype,"ne");
                User.update({ userid:userid},{ mailtype:mailtype,neusername: null ,nepassword:null,neauthcode:null})
                    .exec(function(err, newuser) {
                        if(err){
                            console.log(err);
                            return res.redirect('/');
                        }
                        console.log('unbind success');
                        res.render("tip_success",{
                            iconcode:1,
                            content:"解绑成功",
                            yes:'/',
                            yestext:"返回主页"});
                    });
            }
            else{
                return res.redirect('/');
            }
        });
});
app.get('/pkumailunbind',function(req,res){
    var  userid = req.cookies.openid;
    console.log("pkiunbind");
    console.log(userid);
    User.findOne({ userid: userid })
        .exec(function(err, user) {
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(user){
                console.log('username unbind');
                var mailtype = util.mailtypeParser(user.mailtype,"pku");
                User.update({ userid:userid},{ mailtype:mailtype,pkuusername: null ,pkupassword:null,pkuauthcode:null})
                    .exec(function(err, newuser) {
                        if(err){
                            console.log(err);
                            return res.redirect('/');
                        }
                        res.render("tip_success",{
                            iconcode:1,
                            content:"解绑成功",
                            yes:'/',
                            yestext:"返回主页"});
                    });
            }
            else{
                return res.redirect('/');
            }
        });
});

app.get('/sendmail',function(req,res){
    var  userid = req.cookies.openid;
    console.log(userid);
    User.findOne({ userid: userid })
        .exec(function(err, user) {
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(user){
                console.log('username exit');
                console.log(user.mailtype);
                if(user.mailtype==null){
                    res.render("tip_success",{
                        iconcode:0,
                        content:"请先绑定邮箱",
                        yes:'/',
                        yestext:"返回主页"});
                }
                else{
                    var mailtype =  user.mailtype.split(',');
                    if(mailtype.length==0){
                        res.render("tip_success",{
                            iconcode:0,
                            content:"请先绑定邮箱",
                            yes:'/',
                            yestext:"返回主页"});
                    }
                    else
                        res.render('sendmaillist',{title:'请选择发邮箱账户',mailtype:mailtype});
                }
            }
            else{
                return res.redirect('/');
            }
        });
});
app.get('/qqmailsend',function(req,res){
    var  userid = req.cookies.openid;
    User.findOne({ userid: userid })
        .exec(function(err, user) {
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(user){
                console.log('username exit');
                res.render('sendmail',{title:'发邮件',mail:user.qqusername});
            }
        });
});
app.get('/nemailsend',function(req,res){
    var  userid = req.cookies.openid;
    User.findOne({ userid: userid })
        .exec(function(err, user) {
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(user){
                console.log('username exit');
                res.render('sendmail',{title:'发邮件',mail:user.neusername});
            }
        });
});
app.get('/pkumailsend',function(req,res){
    res.render("tip_success",{
        iconcode:0,
        content:"抱歉，功能未完善，敬请期待",
        yes:'/',
        yestext:"返回主页"});
});
app.post('/qqmailsend',function(req,res){

    var  userid = req.cookies.openid;

    var sendto = req.body.sendto,
        subject = req.body.subject,
        text = req.body.plaintext;
    console.log(sendto);
    console.log(subject);
    console.log(text);
    User.findOne({ userid: userid })
        .exec(function(err, user) {
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(user){
                var option = {
                            mail:user.qqusername,
                            password:user.qqauthcode,
                            type:'QQ',
                            sendto:sendto,
                            subject:subject,
                            text:text
                            };
                mailsender.sendmail(option,res,"/qqmailsend");
            }
        });
});
app.post('/nemailsend',function(req,res){
    var  userid = req.cookies.openid;

    var sendto = req.body.sendto,
        subject = req.body.subject,
        text = req.body.plaintext;
    console.log(sendto);
    console.log(subject);
    console.log(text);
    User.findOne({ userid: userid })
        .exec(function(err, user) {
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(user){
                var option = {
                    mail:user.neusername,
                    password:user.neauthcode,
                    type:'163',
                    sendto:sendto,
                    subject:subject,
                    text:text
                };
                mailsender.sendmail(option,res,"/nemailsend");
            }
        });
});
app.post('/pkumailsend',function(req,res){
    var  userid = req.cookies.openid;

    var sendto = req.body.sendto,
        subject = req.body.subject,
        text = req.body.plaintext;
    console.log(sendto);
    console.log(subject);
    console.log(text);
    User.findOne({ userid: userid })
        .exec(function(err, user) {
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(user){
                var option = {
                    mail:user.neusername,
                    password:user.pkuauthcode,
                    type:'pku.edu.cn',
                    sendto:sendto,
                    subject:subject,
                    text:text
                };
                mailsender.sendmail(option,res,"/pkumailsend");
            }
        });
});

app.get('/recmail',function(req,res){
    var  userid = req.cookies.openid;
    console.log(userid);
    User.findOne({ userid: userid })
        .exec(function(err, user) {
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(user){
                console.log('username exit');
                console.log(user.mailtype);
                if(user.mailtype==null){
                    res.render("tip_success",{
                        iconcode:0,
                        content:"请先绑定邮箱",
                        yes:'/',
                        yestext:"返回主页"});
                }
                else{
                    var mailtype =  user.mailtype.split(',');
                    if(mailtype.length==0){
                        res.render("tip_success",{
                            iconcode:0,
                            content:"请先绑定邮箱",
                            yes:'/',
                            yestext:"返回主页"});
                    }
                    else
                        res.render('recmaillist',{title:'请选择收件箱',mailtype:mailtype});
                }
            }
            else{
                return res.redirect('/');
            }
        });
});
app.get('/qqmailrec',function(req,res){
    var  userid = req.cookies.openid;
    User.findOne({ userid: userid })
        .exec(function(err, user) {
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(user){
                console.log('username exit');
                var options={
                     userid:userid,
                     user:user.qqusername,
                     mailtype:'qq',
                     password:user.qqauthcode,
                     host: 'imap.qq.com'
                };
                mailreceiver(options,res);
                //res.render('recmail',{title:'发邮件',mail:user.qqusername});
            }
        });
});
app.get('/nemailrec',function(req,res){
    res.render("tip_success",{
        iconcode:0,
        content:"抱歉，功能未完善，敬请期待",
        yes:'/',
        yestext:"返回主页"});
});
app.get('/pkumailrec',function(req,res){
    var  userid = req.cookies.openid;
    User.findOne({ userid: userid })
        .exec(function(err, user) {
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(user){
                console.log('username exit');
                var options={
                    userid:userid,
                    user:user.pkuusername,
                    mailtype:'pku',
                    password:user.pkupassword,
                    host: 'mail.pku.edu.cn'
                };
                mailreceiver(options,res);
                //res.render('recmail',{title:'发邮件',mail:user.qqusername});
            }
        });
});
app.get('/qqdetail/:id',function(req,res){
    var  userid = req.cookies.openid;
    var seqno =req.params.id;
    console.log(seqno);
    var path=userid+'/'+'qq';
    var file=path+'/mail-'+seqno+'-body.ejs'
    res.render(file);
});
app.get('/nedetail/:id',function(req,res){
    var  userid = req.cookies.openid;
    User.findOne({ userid: userid })
        .exec(function(err, user) {
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(user){
                console.log('username exit');
                res.render('sendmail',{title:'发邮件',mail:user.neusername});
            }
        });
});
app.get('/pkudetail/:id',function(req,res){
    var  userid = req.cookies.openid;
    var seqno =req.params.id;
    console.log(seqno);
    var path=userid+'/'+'pku';
    var file=path+'/mail-'+seqno+'-body.ejs'
    res.render(file);
});

app.listen(settings.PORT,function(req,res){
  console.log("Server runing at port: " + settings.PORT);
});