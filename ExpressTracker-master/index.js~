//加载依赖库
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');

var getUserInfo = require('./user').getUserInfo;
var getUserID = require('./user').getUserID;
var reply = require('./reply').reply;

//连接数据库
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: '120.27.123.90',
  user: 'sunqing',
  password: 'sunqing',
  database: 'express'
});
connection.connect(function (err) {if (err) throw err;});

//创建express实例
var app = express();

//定义EJS模板引擎和模板文件位置
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
	name:'express',
	cookie:{maxAge:1000*60*20},//设置session保存时间为20分钟
	resave:false,
	saveUninitialized:true
}));

//响应页面请求
app.get('/post',function(req,res) {
	if (typeof(req.session.userid) == 'undefined' || !req.session.userid) {
		getUserID(req.query.code).then(function(data) {
		console.log(data);
			req.session.userid = data;
			if (typeof(req.session.userid) == 'undefined' || !req.session.userid) res.redirect('/err');
			console.log(req.session);
			res.render('post',{
				title:'发布请求'
			});
		});
	}else {

	//req.session.code = req.query.code;
	console.log(req.session);
		res.render('post',{
			title:'发布请求'
		});
	}	
});

app.post('/post',function(req,res) {
//	console.log(req.session.code);
//	getOpenID(req.session.code).then(function(openid) {
//	req.session.userid = openid;
	//获取表单每项数据
	var openid = req.session.userid;
	var username = req.body.username;
	      address = req.body.adress;
	      company = req.body.company;
	      telephone = parseInt(req.body.telephone);
	var state = 1;
	if (typeof(username) == 'undefined' || typeof(address) == 'undefined' ||
	typeof(company) == 'undefined' ||typeof(telephone) == 'undefined') res.redirect('/err');
	
	//获取用户个人信息
	getUserInfo(openid).then(function(userInfo){
		var nickname = userInfo.name;
		      img = userInfo.avatar;
		var msg = [openid,nickname,img,username,address,company,telephone,state];
		console.log(userInfo);
		console.log(msg);				
	
	//插入数据库
	connection.query('INSERT INTO `list`(`req_ID`,`nickname`,`img`,`usrname`, `address`,`company`,`telephone`,`state`,`time`) VALUES (?,?,?,?,?,?,?,?,NOW())',msg,function(err,doc) {
			if (err) {
				console.log(err);
				return res.redirect('/post');
			}
			console.log('Post sucessfully！');
			return res.redirect('/success');
		});
		});
//	});
});

app.get('/success',function(req,res) {
	res.render('success',{
		title:'操作成功'
	});	
});

app.get('/err',function(req,res) {
	res.render('success',{
		title:'操作失败'
	});
});

app.get('/list',function(req,res) {
//	req.session.code = req.query.code;
	if (typeof(req.session.userid) == 'undefined' || !req.session.userid) {
		getUserID(req.query.code).then(function(openid) {
			req.session.userid = openid;
		if (typeof(req.session.userid) == 'undefined' || !req.session.userid) res.redirect('/err');
		connection.query('SELECT * FROM  list WHERE state=1',function(err,list) {
		if (err) {
			console.log(err);
			return res.redirect('/post');
		}
		var result = [];
		var total = list.length;
		
		console.log(total);
		if (total > 0) {
			for(i = 0;i<6;i++) {
				if (i>=total) break;
				result.push(list[i]);
			}
		}	
		res.render('list',{
			title:'请求列表',
			result:result
		});
	});
	});
	}else {
	connection.query('SELECT * FROM  list WHERE state=1',function(err,list) {
		if (err) {
			console.log(err);
			return res.redirect('/post');
		}
		var result = [];
		var total = list.length;
		
		console.log(total);
		if (total > 0) {
			for(i = 0;i<6;i++) {
				if (i>=total) break;
				result.push(list[i]);
			}
		}	
		res.render('list',{
			title:'请求列表',
			result:result
		});
	});
	}	
});

app.get('/listall',function(req,res) {
	if (typeof(req.session.userid) == 'undefined' || !req.session.userid) res.redirect('/err');
	connection.query('SELECT * FROM  list WHERE state=1',function(err,result) {
		if (err) {
			console.log(err);
			return res.redirect('/post');
		}	
		
		console.log(result);
		res.render('listall',{
			title:'请求列表',
			result:result
		});
	});	
});

app.get('/listdetail',function(req,res) {
	var id = req.query.id;
	console.log(id);
	if (typeof(req.session.userid) == 'undefined' || !req.session.userid) {
		getUserID(req.query.code).then(function(openid) {
			req.session.userid = openid;
			if (typeof(req.session.userid) == 'undefined' || !req.session.userid) res.redirect('/err');
		connection.query('SELECT * FROM  list WHERE id=?',id,function(err,result) {
			if (err) {
				console.log(err);
				return res.redirect('/post');
			}	
		
			console.log(result);
			res.render('listdetail',{
				title:'请求列表',
				result:result[0]
			});
		});	
	});
	}else {
		connection.query('SELECT * FROM  list WHERE id=?',id,function(err,result) {
			if (err) {
				console.log(err);
				return res.redirect('/post');
			}	
		
			console.log(result);
			res.render('listdetail',{
				title:'请求列表',
				result:result[0]
			});
		});
	}	
});

app.get('/receive',function(req,res) {
//	console.log(req.session.code);
//	getOpenID(req.session.code).then(function(openid) {
//	req.session.userid = openid;
	var msgid = req.query.msgid;
	var openid = req.session.userid;
	console.log(openid);
	connection.query('UPDATE  `list` SET  `res_ID` =?,`state` =? WHERE  `id` =?',[openid,0,msgid],function(err,result) {
		if (err) {
			console.log(err);
			return res.redirect('/list');
		}
		console.log('update sucessfully!');
		connection.query('SELECT * FROM `list` WHERE  `id` =?',msgid,function(err,result) {
			if (err) {
				console.log(err);
				return res.redirect('/list');
			}
			console.log(result);
			reply(result[0]);
		});	
	});
	res.redirect('/list');
//	});
});

app.get('/my',function(req,res) {
	if (typeof(req.session.userid) == 'undefined' || !req.session.userid) {
		getUserID(req.query.code).then(function(data) {
			req.session.userid = data;
			if (typeof(req.session.userid) == 'undefined' || !req.session.userid) res.redirect('/err');
	connection.query('SELECT * FROM `list` WHERE  `req_ID` =? && `state`=1',req.session.userid,function(err,result) {
		if (err) {
			console.log(err);
			return res.redirect('/list');
		}
		console.log(result);
		res.render('my',{
			title:'请求列表',
			result:result
		});
	});
	});
	}else {
		connection.query('SELECT * FROM `list` WHERE  `req_ID` =? && `state`=1',req.session.userid,function(err,result) {
		if (err) {
			console.log(err);
			return res.redirect('/list');
		}
		console.log(result);
		res.render('my',{
			title:'请求列表',
			result:result
		});
	});
	}
});

app.get('/edit',function(req,res) {
	var msgid = req.query.msgid;
	connection.query('SELECT * FROM `list` WHERE  `id` =?',msgid,function(err,result) {
		if (err) {
			console.log(err);
			return res.redirect('/list');
		}
		res.render('edit',{
			title:'编辑请求',
			msg:result[0]
		});
	});
});

app.post('/edit',function(req,res) {
	var msgid = req.query.msgid;
	var username = req.body.username;
	      address = req.body.adress;
	      company = req.body.company;
	      telephone = parseInt(req.body.telephone);
	var data = [username,address,company,telephone,msgid];
	console.log(data);
	connection.query('UPDATE  `list` SET  `usrname` =?,`address` =?,`company` =?,`telephone` =? WHERE  `id` =?',data,function(err,result) {
		if (err) {
			console.log(err);
			return res.redirect('/my');
		}
	});
	res.redirect('/my');
});

app.get('/delete',function(req,res) {
	var msgid = req.query.msgid;
	connection.query('DELETE  FROM `list` WHERE  `id` =?',msgid,function(err,result) {
		if (err) {
			console.log(err);
			return res.redirect('/my');
		}
	});
	res.redirect('/my');
});


//监听3001端口
app.listen(3001,function(req,res) {
	console.log('app is running at port 3001');
});


