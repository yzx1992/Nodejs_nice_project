/**
 * Created by Nicholas_Wang on 2016/5/20.
 */
var express = require('express');
var ejs = require('ejs');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var crypto = require('crypto');
var url = require('url');
var querystring = require('querystring');
var waterline = require('./waterline');
var moment = require('moment');
var fs = require('fs');
var formidable = require('formidable');
var util = require('util');
var WXBizMsgCrypt = require('wechat-crypto');
var request = require('request');
var xmlParse = require('xml2js').parseString;
var tmpl = require('tmpl');
var config = require('./config');
var wxNotify = require('./wxNotify').wxNotify;
var user = require('./user');
var wechat = require('wechat-enterprise');
var app = express();

app.get('/', function (req, res) {
    //var msg_signature = req.query.msg_signature;
    //var timestamp = req.query.timestamp;
    //var nonce = req.query.nonce;
    var echostr = req.query.echostr;
    var crypto = new WXBizMsgCrypt(config.token, config.encodingAESKey, config.corpId);
    var s = crypto.decrypt(echostr);
    console.log('echostr 解密后：',s);

    res.send(s.message);
});

//定义 ejs 模版引擎和模版文件位置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//定义静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

//定义数据解析器
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: '1234',
    name: 'classman',
    cookie: {maxAge: 1000 * 60 * 20},
    resave: false,
    saveUninitialized: true
}));

//编写中间件 方便使用 waterline 中的 models
app.use(function (req, res, next) {
    req.models = app.get('models');
    next();
});


var configs = {
    token:'nicholas',
    encodingAESKey:'pQqqpTHJ1S4m3LmgSH3hPNxinI4KN9wMyaDetrHtCUA',
    corpId:'wx1d3765eb45497a18'
};
app.post('/',wechat(configs, wechat.event(function (message, req, res, next) {
    console.log('message', message);
    if (message.EventKey == 'notice_content_yuan') {
        //res.reply('notice_yuan');
        //先通过 message.FromUserName 获得学号，然后通过学号获取班级
        //调用老师的接口查询学生班级
        req.models.user.findOne({stu_id:message.FromUserName}).exec(function (err, user) {
            if (err) {
                console.log(err);
                res.reply('查询错误，请在 其他-访问网页 在网页端进行查看');
            }
            var classId = user.stu_class_id;
            req.models.notice.find({notice_type: 1, class_id:classId}).exec(function (err, notices) {
                if (err) {
                    console.log(err);
                    res.reply('查询错误，请在 其他-访问网页 在网页端进行查看');
                }
                var content = '';
                for(var i in notices) {
                    content = content + '['+ (Number(i)+Number(1)) + ']' + notices[i].notice_name + '\n';
                }
                content = content + '详情于 其他-访问网页 进行查看';
                res.reply(content);
            });
        });

    } else if (message.EventKey == 'notice_content_zhibu'){
        //res.reply('notice_zhibu');
        req.models.user.findOne({stu_id:message.FromUserName}).exec(function (err, user) {
            if (err) {
                console.log(err);
                res.reply('查询错误，请在 其他-访问网页 在网页端进行查看');
            }
            var classId = user.stu_class_id;
            req.models.notice.find({notice_type: 2, class_id:classId}).exec(function (err, notices) {
                if(err){
                    console.log(err);
                    res.reply('查询错误，请在 其他-访问网页 在网页端进行查看');
                }
                var content = '';
                for(var i in notices) {
                    content = content + '['+ (Number(i)+Number(1)) + ']' + notices[i].notice_name + '\n';
                }
                content = content + '详情于 其他-访问网页 进行查看';
                res.reply(content);
            });
        });
    } else if (message.EventKey == 'activity_content_yuan'){
        //res.reply('activity_yuan');
        req.models.user.findOne({stu_id:message.FromUserName}).exec(function (err, user) {
            if (err) {
                console.log(err);
                res.reply('查询错误，请在 其他-访问网页 在网页端进行查看');
            }
            var classId = user.stu_class_id;
            req.models.activity.find({activity_type: 1, class_id:classId}).exec(function (err, activities) {
                if(err){
                    console.log(err);
                    res.reply('查询错误，请在 其他-访问网页 在网页端进行查看');
                }
                var content = '';
                for(var i in activities) {
                    content = content + '['+ (Number(i)+Number(1)) + ']' + activities[i].activity_name + '\n';
                }
                content = content + '详情于 其他-访问网页 进行查看';
                res.reply(content);
            });
        });
    } else if (message.EventKey == 'activity_content_zhibu'){
        //res.reply('activity_zhibu');
        req.models.user.findOne({stu_id:message.FromUserName}).exec(function (err, user) {
            if (err) {
                console.log(err);
                res.reply('查询错误，请在 其他-访问网页 在网页端进行查看');
            }
            var classId = user.stu_class_id;
            req.models.activity.find({activity_type: 2, class_id:classId}).exec(function (err, activities) {
                if(err){
                    console.log(err);
                    res.reply('查询错误，请在 其他-访问网页 在网页端进行查看');
                }
                var content = '';
                for(var i in activities) {
                    content = content + '['+ (Number(i)+Number(1)) + ']' + activities[i].activity_name + '\n';
                }
                content = content + '详情于 其他-访问网页 进行查看';
                res.reply(content);
            });
        });
    } else if (message.EventKey == 'file_list'){
        //res.reply('file_list');
        req.models.user.findOne({stu_id:message.FromUserName}).exec(function (err, user) {
            if (err) {
                console.log(err);
                res.reply('查询错误，请在 其他-访问网页 在网页端进行查看');
            }
            var classId = user.stu_class_id;
            req.models.file.find({class_id:classId}).exec(function (err, files) {
                if(err){
                    console.log(err);
                    res.reply('查询错误，请在 其他-访问网页 在网页端进行查看');
                }
                var content = '';
                for(var i in files) {
                    content = content + '['+ (Number(i)+Number(1)) + ']' + files[i].file_name + '\n';
                }
                content = content + '详情于 其他-访问网页 进行查看';
                res.reply(content);
            });
        });
    } else if (message.EventKey == 'contact'){
        //res.reply('contact');
        req.models.user.findOne({stu_id:message.FromUserName}).exec(function (err, user) {
            if (err) {
                console.log(err);
                res.reply('查询错误，请在 其他-访问网页 在网页端进行查看');
            }
            var classId = user.stu_class_id;
            req.models.user.find({stu_class_id:classId}).exec(function (err, users) {
                if(err){
                    console.log(err);
                    res.reply('查询错误，请在 其他-访问网页 在网页端进行查看');
                }
                var content = '';
                for(var i in users) {
                    content = content + '['+ (Number(i)+Number(1)) + ']' + users[i].stu_name + ' ' + users[i].stu_phone +'\n';
                }
                content = content + '详情于 其他-访问网页 进行查看';
                res.reply(content);
            });
        });
    }
})));


app.get('/index', function (req, res) {

    if(req.session.user != null) {
        res.render('index', {
            user: req.session.user
        });
    } else if(req.query.code != null) {
        var code = req.query.code;
        console.log('code: ',code);
        user.getUserId(code).then(function (resp) {
            console.log('res: ',resp);
            var userId = resp.UserId;
            user.getUserInfo(userId).then(function (resp) {
                console.log('user info: ',resp);
                var user = {
                    stu_id: userId,
                    stu_name: resp.name,
                    stu_phone: resp.mobile,
                    stu_class_id:'k2', //现在是写死的
                    stu_photo: resp.avatar || '/assets/avatars/user.jpg'
                };
                req.session.user = user;
                res.render('index', {
                    user: user
                });
            });
        }).catch(function (err) {
            console.log(err);
        });
    } else {
        res.redirect('/login');
    }

});

/**
 * login system
 */
app.get('/login', function (req, res) {
    res.render('login', {
        warn:''
    });
});

app.post('/login', function (req, res) {
    var studentID = req.body.studentID,
        password = req.body.password,
        chRm = req.body.chRm;
    req.models.user.findOne({stu_id:studentID}).exec(function (err, user) {
        if (err) {
            console.log(err);
            return res.redirect('/login');
        }
        if (!user) {
            console.log('用户不存在');
            return res.render('login', {
                user: req.session.user,
                warn: '用户不存在，请先注册'
            });
        }

        var md5 = crypto.createHash('md5'),
            md5password = md5.update(password).digest('hex');

        if(user.stu_password !== md5password) {
            console.log('密码错误');
            return res.render('login', {
                user: req.session.user,
                warn:'密码错误'
            });
        }

        console.log('登录成功');
        //一周免登录
        if (chRm) {
            req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
        }

        user.stu_password = null;
        delete user.stu_password;
        req.session.user = user;
        return res.redirect('/index');

    });

});

/**
 * logout system
 */
app.get('/logout', function (req, res) {
    console.log('退出');
    req.session.user = null;
    return res.redirect('/login');
});

app.post('/register', function (req, res) {
    var stu_id = req.body.studentID,
        stu_name = req.body.username,
        stu_password = req.body.password,
        passwordRepeat = req.body.passwordRepeat,
        stu_role = req.body.stu_role,
        stu_class_id = req.body.stu_class;

    if (stu_password != passwordRepeat) {
        console.log('两次密码输入不一致');
        return res.render('login', {
            user: req.session.user,
            warn: '两次密码输入不一致'
        });
    }

    req.models.user.findOne({stu_id:stu_id}).exec(function (err, user) {
        if (err) {
            console.log(err);
            return res.redirect('/login');
        }
        if (user) {
            console.log('用户已存在');
            return res.render('login', {
               user: req.session.user,
                warn: '用户已存在'
            });
        }

        var md5 = crypto.createHash('md5'),
            md5password = md5.update(stu_password).digest('hex');

        var newUser = {
            stu_id: stu_id,
            stu_name: stu_name,
            stu_password: md5password,
            stu_role: stu_role,
            stu_class_id: stu_class_id
        };

        req.models.user.create(newUser).exec(function (err, user) {
            if (err) {
                console.log(err);
                return res.redirect('/login');
            }
            console.log('注册成功');
            req.session.user = newUser;
            return res.render('index', {
                user: req.session.user
            });
        });
    });

});

/**
 * look through notice content
 */
app.get('/notice_content*', function (req, res) {

    if (req.session.user == null) {
        return res.redirect('/login');
    }

    var pathname = url.parse(req.url).pathname;
    console.log('pathname: ', pathname);
    if (pathname == '/notice_content_yuan') {
        req.models.notice.find({notice_type: 1, class_id:req.session.user.stu_class_id}).exec(function (err, notices) {
            if (err) {
                console.log(err);
                return res.redirect('/index');
            }

            console.log('学苑通知：',notices[0]);
            return res.render('notice_content', {
                user: req.session.user,
                notices: notices,
                type: '学苑通知',
                moment: moment
            });
        });
    } else {
        req.models.notice.find({notice_type: 2, class_id:req.session.user.stu_class_id}).exec(function (err, notices) {
            if (err) {
                console.log(err);
                return res.redirect('/index');
            }

            console.log('支部通知：',notices[0]);
            return res.render('notice_content', {
                user: req.session.user,
                notices: notices,
                type: '支部通知',
                moment: moment
            });
        });
    }

});

/**
 * notice post
 */
app.get('/notice_post', function (req, res) {

    if (req.session.user == null) {
        return res.redirect('/login');
    }

    if(req.session.user != null) {
        res.render('notice_post',{
            user: req.session.user
        });
    } else {
        res.redirect('/login');
    }


});

app.post('/notice_post', function (req, res) {

    if (req.session.user == null) {
        return res.redirect('/login');
    }
    var notice_name = req.body.notice_name,
        notice_type = req.body.notice_type,
        notice_content = req.body.notice_content;

    var newNotice = {
        notice_name: notice_name,
        notice_type: notice_type,
        notice_content: notice_content,
        notice_from: req.session.user.stu_name,
        class_id: req.session.user.stu_class_id
    };
    req.models.notice.create(newNotice).exec(function (err, notice) {
        if (err) {
            console.log(err);
            return res.render('notice_post', {
                user: req.session.user
            });
        }

        console.log('通知发布成功');

        if (notice_type == 1) {
            res.redirect('/notice_content_yuan');
        } else {
            res.redirect('/notice_content_zhibu');
        }
        // 向微信用户发送通知
        var content = '你的班级发布了一个新通知: ' + '\n' + notice_name + '\n' + notice_content;
        req.models.user.find({stu_class_id: req.session.user.stu_class_id}).exec(function (err, users) {
            return wxNotify(config.corpId, config.corpsecret, content, users);
        });
    });
});

/**
 * notice delete
 */
app.get('/notice_delete', function (req, res) {
    if (req.session.user == null) {
        return res.redirect('/login');
    }
    var getQuery = url.parse(req.url).query;
    var id = querystring.parse(getQuery)['id'];
    var type = querystring.parse(getQuery)['type'];
    console.log('delete notice:',id);
    req.models.notice.destroy({id:id}).exec(function (err) {
        if (err) {
            console.log(err);
            return res.redirect('/notice_content');
        }
        if (type == 1) {
            return res.redirect('/notice_content_yuan');
        } else {
            return res.redirect('/notice_content_zhibu');
        }

    });
});

/**
 * notice update
 */

app.get('/notice_update', function (req, res) {
    if (req.session.user == null) {
        return res.redirect('/login');
    }

    var getQuery = url.parse(req.url).query;
    var id = querystring.parse(getQuery)['id'];
    console.log('update notice: ',id);
    req.models.notice.findOne({id: id}).exec(function (err, notice) {
        if (err) {
            console.log(err);
            return res.redirect('/notice_content');
        }

        return res.render('notice_update', {
            user: req.session.user,
            notice: notice
        });
    });

});

app.post('/notice_update', function (req, res) {
    if (req.session.user == null) {
        return res.redirect('/index');
    }

    var newNotice = {
        notice_name: req.body.notice_name,
        notice_type: req.body.notice_type,
        notice_content: req.body.notice_content,
        notice_from: req.session.user.stu_name
    };

    req.models.notice.update({id: req.body.id}, newNotice).exec(function (err, notice) {
        if (err) {
            console.log(err);
        }
        console.log('更新通知成功');
        if (req.session.user.stu_role == 1) {
            return res.redirect('/notice_content_yuan');
        } else {
            return res.redirect('/notice_content_zhibu');
        }


    });

});

/**
 * activity post
 */
app.post('/activity_post', function (req, res) {

    if(req.session.user == null){
        return res.redirect('/login');
    }

    var activity_name = req.body.activity_name,
        activity_type = req.body.activity_type,
        activity_time = req.body.activity_time,
        activity_location = req.body.activity_location,
        activity_pay = req.body.activity_pay,
        activity_dur = req.body.activity_dur,
        activity_description = req.body.activity_description,
        class_id = req.session.user.stu_class_id;

    var newActivity = {
        activity_name: activity_name,
        activity_type: activity_type,
        activity_time: activity_time,
        activity_location: activity_location,
        activity_pay: activity_pay,
        activity_dur: activity_dur,
        activity_description: activity_description,
        activity_from: req.session.user.stu_name,
        class_id: class_id
    };
    req.models.activity.create(newActivity).exec(function (err, activity) {
        if (err) {
            console.log(err);
            return res.render('activity_post', {
                user: req.session.user
            });
        }

        console.log('活动发布成功');
        if (activity_type == 1) {
            res.redirect('/activity_content_yuan');
        } else {
            res.redirect('/activity_content_zhibu');
        }
        // 向微信用户发送通知
        var content = '你的班级发布了一个新活动: ' + '\n' +
            activity_name + '\n' +
            '时间：'+activity_time +'\n' +
            '地点：'+activity_location + '\n' +
            '内容：'+activity_description;
        req.models.user.find({stu_class_id: req.session.user.stu_class_id}).exec(function (err, users) {
            return wxNotify(config.corpId, config.corpsecret, content, users);
        });
    });
});

app.get('/activity_post', function (req, res) {

    if (req.session.user == null) {
        return res.redirect('/login');
    } else {
        return res.render('activity_post', {
            user: req.session.user
        });
    }
});

/**
 * activity delete
 */
app.get('/activity_delete', function (req, res) {
    if (req.session.user == null) {
        return res.redirect('/login');
    }
    var getQuery = url.parse(req.url).query;
    var id = querystring.parse(getQuery)['id'];
    var type = querystring.parse(getQuery)['type'];
    console.log('delete activity:',id);
    req.models.activity.destroy({id:id}).exec(function (err) {
        if (err) {
            console.log(err);
            return res.redirect('/activity_content');
        }
        if (type == 1) {
            return res.redirect('/activity_content_yuan');
        } else {
            return res.redirect('/activity_content_zhibu');
        }

    });
});

/**
 * look through activity content
 */
app.get('/activity_content*', function (req, res) {
    if (req.session.user == null) {
        return res.redirect('/login');
    }
    var pathname = url.parse(req.url).pathname;
    console.log('pathname: ', pathname);
    if (pathname == '/activity_content_yuan') {
        req.models.activity.find({activity_type: 1, class_id:req.session.user.stu_class_id}).exec(function (err, activities) {
            if (err) {
                console.log(err);
                return res.redirect('/index');
            }

            console.log('学苑活动：',activities[0]);
            return res.render('activity_content', {
                user: req.session.user,
                activities: activities,
                type: '学苑活动',
                moment: moment
            });
        });
    } else {
        req.models.activity.find({activity_type: 2, class_id:req.session.user.stu_class_id}).exec(function (err, activities) {
            if (err) {
                console.log(err);
                return res.redirect('/index');
            }

            console.log('支部活动：',activities[0]);
            return res.render('activity_content', {
                user: req.session.user,
                activities: activities,
                type: '支部活动',
                moment: moment
            });
        });
    }
});

/**
 * activity update
 */
app.get('/activity_update', function (req, res) {
    if (req.session.user == null) {
        return res.redirect('/login');
    }

    var getQuery = url.parse(req.url).query;
    var id = querystring.parse(getQuery)['id'];

    req.models.activity.findOne({id: id}).exec(function (err, activity) {
        if (err) {
            console.log(err);
            if (req.session.user.stu_role == 1) {
                return res.redirect('/activity_content_yuan');
            } else {
                return res.redirect('/activity_content_zhibu');
            }
        }
        return res.render('activity_update', {
            user: req.session.user,
            activity: activity
        });
    });
});

app.post('/activity_update', function (req, res) {
    if (req.session.user == null) {
        return res.redirect('/login');
    }

    var newActivity = {
        activity_name: req.body.activity_name,
        activity_type: req.body.activity_type,
        activity_time: req.body.activity_time,
        activity_location: req.body.activity_location,
        activity_dur: req.body.activity_dur,
        activity_pay: req.body.activity_pay,
        activity_description: req.body.activity_description,
        activity_from: req.session.user.stu_name
    };

    req.models.activity.update({id: req.body.id}, newActivity).exec(function (err, activity) {
        if (err) {
            console.log(err);
        }
        console.log('更新通知成功');
        if (req.session.user.stu_role == 1) {
            return res.redirect('/activity_content_yuan');
        } else {
            return res.redirect('/activity_content_zhibu');
        }

    });
});

app.get('/contact', function (req, res) {

    if (req.session.user == null) {
        return res.redirect('/login');
    }

    req.models.user.find({stu_class_id:req.session.user.stu_class_id}).exec(function (err, users) {
        if (err) {
            console.log(err);
            return res.redirect('/index');
        }
        return res.render('contact', {
            user: req.session.user,
            users: users
        });
    });


});

/**
 * upload file
 */
app.get('/upload', function (req, res) {
    if (req.session.user == null) {
        return res.redirect('/login');
    }

    return res.render('upload',{
        user: req.session.user
    });
});

app.post('/upload', function (req, res) {

    if (req.session.user == null) {
        return res.redirect('/login');
    }

    var form = new formidable.IncomingForm();
    console.log('about to parse');
    form.parse(req, function (error, fields, files) {

        console.log('fields: ', fields);
        console.log('files: ',files);
        var readStream = fs.createReadStream(files.file.path);
        console.log('upload file: ',files.file.path);
        var savePath = path.join( __dirname, 'files', files.file.name);
        console.log('save path: ',savePath);
        var writeStream = fs.createWriteStream(savePath);

        util.pump(readStream, writeStream, function () {
            fs.unlinkSync(files.file.path);
        });

        //save file into database
        var newFile = {
            file_name: files.file.name,
            file_path: savePath,
            file_from: req.session.user.stu_name,
            class_id: req.session.user.stu_class_id
        };
        req.models.file.create(newFile).exec(function (err, file) {
            if (err) {
                console.log(err);
            }
            res.redirect('/file_list');
            // 向微信用户发送通知
            var content = '你的班级上传了一个新文件: ' + '\n' + files.file.name;
            req.models.user.find({stu_class_id: req.session.user.stu_class_id}).exec(function (err, users) {
                return wxNotify(config.corpId, config.corpsecret, content, users);
            });
        });
    });


});

/**
 * look through file list
 */
app.get('/file_list', function (req, res) {
    if (req.session.user == null) {
        return res.redirect('/login');
    }

    req.models.file.find({class_id:req.session.user.stu_class_id}).exec(function (err, files) {
        if (err) {
            console.log(err);
        }
        return res.render('file_list', {
            user: req.session.user,
            files: files
        });
    });

});

/**
 * download file
 */
app.get('/download', function (req, res) {
    if (req.session.user == null) {
        return res.redirect('/login');
    }
    var getQuery = url.parse(req.url).query;
    var id = querystring.parse(getQuery)['id'];
    req.models.file.findOne({id: id}).exec(function (err, file) {
        if (err) {
            console.log(err);
        }
        res.download(file.file_path, file.file_name);
    });
});

/**
 * delete file
 */
app.get('/file_delete', function (req, res) {
    if (req.session.user == null) {
        return res.redirect('/login');
    }
    req.models.file.destroy({id: req.query.id}).exec(function (err) {
        if (err) {
            console.log(err);
        }
        fs.unlink(req.query.path);
        return res.redirect('/file_list');
    });
});

/**
 * post advice
 */
app.get('/advice', function (req, res) {
    if (req.session.user == null) {
        return res.redirect('/login');
    }

    return res.render('advice', {
        user: req.session.user
    });
});

app.post('/advice', function (req, res) {
    if (req.session.user == null) {
        return res.redirect('/login');
    }

    var newAdvice = {
        advice_topic: req.body.advice_topic,
        advice_content: req.body.advice_content,
        advice_from: req.session.user.stu_name,
        class_id: req.session.user.stu_class_id
    };
    req.models.advice.create(newAdvice).exec(function (err, advice) {
        if (err) {
            console.log(err);
        }
        return res.redirect('/index');
    });
});

/**
 * look through advice
 */
app.get('/advice_list', function (req, res) {
    if (req.session.user == null) {
        return res.redirect('/login');
    }

    req.models.advice.find({class_id:req.session.user.stu_class_id}).exec(function (err, advices) {
        if (err) {
            console.log(err);
        }
        return res.render('advice_list', {
            user: req.session.user,
            advices: advices
        });
    });
});

waterline.orm.initialize(waterline.wlconfig, function (err, models) {
    if (err) {
        console.log('waterline initialize failed, err :', err);
        return;
    }
    app.set('models', models.collections);
    app.listen(1234, function (req, res) {
        console.log('classman is running at port 1234');
    });
});

