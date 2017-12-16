var express = require ('express');
var path=require('path');
var bodyParser=require('body-parser');
var crypto=require('crypto');
var session=require('express-session');
//引入mongoose
var mongoose=require('mongoose');
//引入模型
var models=require('./models/models');
//var checkLogin=require('./checkLogin');
var User=models.User;
var Book=models.Book;
//使用mongoose连接服务器
mongoose.connect('mongodb://localhost:27017/notes');
mongoose.connection.on('error',console.error.bind(console,'连接数据库失败'));
var app=express();//创建express实例
var moment=require('moment');
//定义EJS模块引擎和模板文件位置
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
    cookies:{maxAge: 1000*60*20*24*7},//设立session的保存时间为20分钟
    resave:false,
    saveUninitialized:true
}));

//响应首页get请求
//app.get('/',checkLogin.noLogin);
app.get('/',function(req,res){
    if(req.session.user!=null){//这里的user是什么？
        Book.find()
            .exec(function(err,allBooks){
                if(err){
                    console.log(err);
                    return res.redirect('/');
                }
                res.render('index',{
                    title:'首页',
                    user:req.session.user,
                    books:allBooks
                });
            })
    }
    else{
        res.render('index',{
            user:req.session.user,
            title:'首页'
        });
    }
});
app.get('/register',function(req,res){
    //res.setEncoding('utf-8');
    if(req.session.user==null){
        console.log('注册');
        res.render('register',{
            user:req.session.user,
            title:"注册",
            usertip:"0"
            //err:''
        });
    }
    else{
        Book.find()
            .exec(function(err,allBooks){
                if(err){
                    console.log(err);
                    return res.redirect('/');
                }
                res.render('index',{
                    title:'首页',
                    user:req.session.user,
                    books:allBooks
                });
            })
    }
});
//post请求
app.post('/register',function(req,res){
    //req.body可以获得表单的每一项数据
    var username=req.body.username,
        password=req.body.password,
        passwordRepeat=req.body.passwordRepeat;
    if (!username.match( /^[a-zA-Z0-9_]{3,20}$/)) {
        return res.render('register',{
            user:req.session.user,
            title:"注册",
            usertip:"1"
            //err:''
        });
    }
    if (!password.match( /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{6,}$/)) {
        return res.render('register',{
            user:req.session.user,
            title:"注册",
            usertip:"2"
            //err:''
        });
    }
    if(username.trim().length==0){
        console.log('用户名不能为空');
        return res.redirect('/register');
    }
    if(password.trim().length==0||passwordRepeat.trim().length==0){
        console.log('密码不能为空');
        return res.redirect('/register');
    }
    if(password!=passwordRepeat){
        console.log('两次密码输入不一致');
        return res.redirect('/register');
    }

    //检查用户名是否存在，如果不存在，则保存该记录
    User.findOne({username:username},function(err,user){
        if(err){
            console.log(err);
            return res.redirect('/register');
        }

        if(user){
            console.log('用户名已经存在');
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

        newUser.save(function(err,doc){
            if(err){
                console.log(err);
                return res.redirect('/register');
            }
            console.log('注册成功');
            return res.redirect('/login');
        });
    });
});
app.get('/login',function(req,res){
    if(req.session.user==null){
        console.log('登录');
        res.render('login',{
            user:req.session.user,
            title:"登录",
            flag:"0"
        });
    }
    else {
        Book.find()
            .exec(function(err,allBooks){
                if(err){
                    console.log(err);
                    return res.redirect('/');
                }
                res.render('index',{
                    title:'首页',
                    user:req.session.user,
                    books:allBooks
                });
            })
    }
});
app.post('/login',function(req,res){
    var username=req.body.username,
        password=req.body.password;
    //console.log(username);
    //console.log(password);

    User.findOne({username:username},function(err,user){
        if(err){
            console.log(err);
            return res.redirect('/login');
        }

        if(!user){
            console.log('用户不存在');
            return res.render('login',{
                user:req.session.user,
                title:"登录",
                flag:"1"
            });
        }

        //对密码进行md5加密
        var md5=crypto.createHash('md5'),
            md5password=md5.update(password).digest('hex');
        if(user.password!==md5password){
            console.log('密码错误！');
            return res.render('login',{
                user:req.session.user,
                title:"登录",
                flag:"2"
            });
        }
        console.log('登录成功！');
        user.password=null;
        delete user.password;
        req.session.user=user;
        return res.redirect('/')
    });
});
app.get('/quit',function(req,res){
    console.log('退出');
    //return res.redirect('/login');
    req.session.user=null;
    //req.session=null;
    return res.redirect('/login');
});
app.get('/post',function(req,res){
    //res.setEncoding('utf-8');
    console.log('上传');
    res.render('post',{
        user:req.session.user,
        title:"上传"
    });
});
app.post('/post',function(req,res){
    var book=new Book({
        title:req.body.title,
        author:req.body.author,
        owner:req.body.owner,
        username:req.session.user.username,
        content:req.body.content,
        phone:req.body.phone
    });

    book.save(function(err,doc){
        if(err) {
            console.log(err);
            return res.redirect('/post');
        }
        console.log("upload successfully");
        return res.redirect('/');
    });
});

app.get('/detail/:_id', function(req,res){
    console.log('查看书籍');
    Book.findOne({_id:req.params._id})
        .exec(function(err,art){
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(art){
                res.render('detail',{
                    title:'书籍详情',
                    user:req.session.user,
                    art:art,
                    moment:moment
                });
            }
        });
});
app.get('/delete/:_id', function(req,res){
    console.log('删除');
    Book.findOne({_id:req.params._id})
        .exec(function(err,art){
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(art){
               if(art.username==req.session.user.username)
                   Book.remove({_id:req.params._id},function(optional){});
            }
        });
    //Book.remove({_id:req.params._id},function(optional){});

    return res.redirect('/');

});
app.get('/search',function(req,res){
    res.render('search',{
        user:req.session.user,
        title:"搜书"
    });
});
app.post('/search', function(req,res){
    console.log('搜书');
    var title=req.body.search;
    Book.find({title:title})
        .exec(function(err,allBooks){
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            res.render('index',{
                title:'搜索结果',
                user:req.session.user,
                books:allBooks
            });
        });
});
app.get('/mybook',function(req,res){
    Book.find({username:req.session.user.username})
        .exec(function(err,allBooks){
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            res.render('index',{
                title:'我的书单',
                user:req.session.user,
                books:allBooks
            });
        });
});
app.listen(3000,function(req,res){
    console.log('app is running at port 3000');
});

