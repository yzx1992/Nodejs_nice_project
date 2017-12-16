var PORT = 80;
var http = require('http');
var qs = require('qs');

var tmpl = require('tmpl');
var WXBizMsgCrypt = require('wechat-crypto');

var config = require('./lib/config');
var encrypt_reply = require('./lib/encrypt_reply').encrypt_reply;
var unencrypt_reply = require('./lib/unencrypt_reply').unencrypt_reply;
var getToken = require('./lib/getToken').getToken;
var getUserInfo = require('./lib/getUserInfo').getUserInfo;
var verify_Url = require('./lib/verify_Url').verify_Url;
var OperationSql = require('./lib/mysql').OperationSql;
var manager_post = require('./lib/manager_post').manager_post;

var gps = require('gps-util');

//console.log("config.token", config.token);

//console.log("config.corpId", config.corpId);

//var PORT = 5003;
/*
var value001 = '1501210406';
var do_sql = 'SELECT * FROM user WHERE StudentID=' + value001;
var sql_name = 'yyp';
var sql_gender = '2';
var sql_StudentID = '1501210407';
var sql_departmentID = '18';
var sql_mobile = '12345678';
var sql_number = 3;
//var sql_createTime=now();
//var value002='values('sql_name','sql_gender','sql_StudentID','sql_departmentID','sql_mobile','sql_number','sql_createTime')';

//增
var do_sql1 = 'insert into user (name,gender,StudentID,departmentID,mobile,number) values(?,?,?,?,?,?)';
var sql_params01 = [sql_name, sql_gender, sql_StudentID, sql_departmentID, sql_mobile, sql_number];

//改
var do_sql2 = 'update user set gender=? where name=?';
var sql_params02 = ['2', 'yyp'];

//查
var do_sql3 = 'select * from user where StudentID=?';
var sql_params03 = ['1501210406'];
'叶振旭'
//删
var do_sql4 = 'delete from user where StudentID=?';
var sql_params04 = ['1501210407'];

try {
OperationSql(do_sql3, sql_params03).then(function (sql_result) {
console.log("sql_result :", sql_result);
});
} catch (err) {
console.log("数据库操作失败 err: ", err);
}

 */
var cryptor = new WXBizMsgCrypt(config.token, config.encodingAESKey, config.corpId);
var isAcessNum = false; //判断用户是否处于软微2公里的距离
var isManager = false; //判断是否为管理员
var isBroadcast = false; //判断管理员是否可以群发功能
var isBegin = false; //判断是否可以开始抢号了
var isRead = false; //管理员查看用户的当前号码

var managerSayNum = ["0", "0", "0"]; //用来存储管理员说的数字

var server = http.createServer(function (request, response) {

		var user_data;
		var user_name;
		var user_gender;
		var user_studentID;
		var user_mobile;
		var user_departmentId;
		var first_sql_result;

		var query = require('url').parse(request.url).query;
		//console.log("query=", query);
		var params = qs.parse(query);
		//解析URL中的query部分，用qs模块(npm install qs)将query解析成json
		//console.log("params=", params);

		if (request.method == 'GET') {
			verify_Url(params, response);
		} else {
			//否则是微信给开发者服务器的POST请求
			var postdata = '';
			request.addListener("data", function (postchunk) {
				postdata += postchunk;
			});

			//获取到了POST数据
			request.addListener("end", function () {
				var json_data;
				//	console.log("postdata= ", postdata);
				var parseString = require('xml2js').parseString;
				//我们将XML数据通过xml2js模块(npm install xml2js)解析成json格式
				parseString(postdata, function (err, result) {

					//	console.log("result= ", result);
					var encrypt_data = result;
					//	console.log("encrypt_data", encrypt_data);
					var decrypt_xml_data = cryptor.decrypt(encrypt_data.xml.Encrypt[0]);
					//	console.log("decrypt_xml_data: ", decrypt_xml_data);

					parseString(decrypt_xml_data.message, function (err, json_data1) {

						json_data = json_data1;
						console.log("json_data: ", json_data);

						getUserInfo(json_data.xml.FromUserName[0]).then(function (user_info_data) {

							user_data = user_info_data;
							console.log("user_data", user_data);

							user_name = user_data.name;
							console.log("用户的名字：user_name：", user_name);
							var user_genderNum = user_data.gender;
							//console.log("user_genderNum :",user_genderNum);

							if (user_genderNum == '1') {
								user_gender = "男";
							} else {
								user_gender = "女";
							}
							//	console.log("用户的姓别：user_gender：", user_gender);
							user_studentID = user_data.userid;
							//	console.log("用户的学号：user_studentId：", user_data.userid);
							user_mobile = user_data.mobile;
							//	console.log("用户的手机：user_mobile：", user_data.mobile);
							user_departmentId = user_data.department;
							//console.log("用户所属部门ID：user_departmentId：", user_departmentId[0]);

							//var do_sql = 'insert into user (name,gender,StudentID,departmentID,mobile) values(?,?,?,?,?)';
							//var sql_params = [user_name, user_gender, user_studentID, user_departmentId, user_mobile];

							//try {
							//	OperationSql(do_sql, sql_params).then(function (sql_result) {
							//		console.log("数据插入成功！sql_result :", sql_result);

							/*
							try {
							var do_sql3 = 'select * from user where StudentID=?';
							var sql_params03 = [user_studentID];
							OperationSql(do_sql3, sql_params03).then(function (sql_result) {
							first_sql_result = sql_result;
							console.log("查询 sql_result :", first_sql_result);
							//myServer_reply = unencrypt_reply(json_data, '取号成功！ 您当前的号码为：' + sql_result[0].id + '号');
							//console.log("myServer_reply:", myServer_reply);

							//	encryptReply = cryptor.encrypt(myServer_reply);
							//console.log("encrypt_reply: ", encryptReply);

							//encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
							//console.log("encrypt_reply_data: ", encryptReply_data);
							//	response.end(encryptReply_data);

							});
							} catch (err) {
							console.log("数据库操作失败 err: ", err);
							}

							 */
						});
						//} catch (err) {
						//		console.log("数据库操作失败 err: ", err);
						//}

					});
				});

				var myServer_reply = '';
				var encryptReply = '';
				var encryptReply_data = '';

				if (json_data.xml.MsgType[0] === 'text') {

					if (isManager && json_data.xml.FromUserName[0] == '1501210406' && isBroadcast) { //管理员群发操作（通知目前为xxx号---xxx号）
						//管理员说话格式： 请 xxx号---xxx号同学前来排队注册！
						
						var corpId = config.corpId;
						var corpsecret = config.corpsecret;

						manager_post_text = json_data.xml.Content[0];
						console.log("(管理员群发操作)管理员说： manager_post_text： ", manager_post_text);
						managerSayNum = manager_post_text.split(/[^0-9]+/ig, "3"); //存储管理员说的数字
						console.log("管理员说111111111", managerSayNum[1]); //管理员说的第一个数字
						console.log("管理员说222222222", managerSayNum[2]); //管理员说的第二个数字
						getToken(corpId, corpsecret).then(function (access_token) {
							manager_post(manager_post_text, access_token);
						});
					} else if (isManager && json_data.xml.FromUserName[0] == '1501210406' && isBegin) { //用户可以开始抢号了

						var corpId = config.corpId;
						var corpsecret = config.corpsecret;

						manager_post_text = json_data.xml.Content[0];
						console.log("(用户可以开始抢号)管理员说： manager_post_text： ", manager_post_text);

						getToken(corpId, corpsecret).then(function (access_token) {
							manager_post(manager_post_text, access_token);
						});
					} else if (isManager && json_data.xml.FromUserName[0] == '1501210406' && isRead) { //管理员可以查询学生的号码

						var do_sql = 'select * from user where StudentID=?';
						var manager_read_student_id = json_data.xml.Content[0];

						var sql_params = manager_read_student_id;
						console.log("管理员可以查询学生的号码 manager_read_student_id", manager_read_student_id);
						try {
							OperationSql(do_sql, sql_params).then(function (sql_result) {
								console.log("管理员可以查询学生的号码 sql_result :", sql_result);
								myServer_reply = unencrypt_reply(json_data, "学号：" + manager_read_student_id + "；对应的学生是:" + sql_result[0].name + "；当前的号码为:" + sql_result[0].id); //myServer_reply为加密的数据
								//	console.log("myServer_reply:", myServer_reply);

								encryptReply = cryptor.encrypt(myServer_reply);
								//	console.log("encryptReply: ", encryptReply); //encryptReply为加密后的数据

								encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
								//	console.log("encrypt_reply_data: ", encryptReply_data);
								response.end(encryptReply_data);
							});
						} catch (err) {
							console.log("管理员可以查询学生的号码 数据库操作失败 err: ", err);
						}

					} else {
						myServer_reply = unencrypt_reply(json_data, "消息推送，成功！（友情提示：乱发信息，我一定能找到你！）"); //myServer_reply为加密的数据
						//	console.log("myServer_reply:", myServer_reply);

						encryptReply = cryptor.encrypt(myServer_reply);
						//	console.log("encryptReply: ", encryptReply); //encryptReply为加密后的数据

						encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
						//	console.log("encrypt_reply_data: ", encryptReply_data);
						response.end(encryptReply_data);
					}
				}
				if (json_data.xml.MsgType[0] === 'event') {
					var my_EventKey = ''
						try {
							my_EventKey = json_data.xml.EventKey[0];
						} catch (err) {
							console.log("没有EventKey[0]");
						}

						try {
							my_Event = json_data.xml.Event[0];
						} catch (err) {
							console.log("没有Event[0]");
						}

						if (my_EventKey === 'my_student_id_key') {
							myServer_reply = unencrypt_reply(json_data, "您的学号是："+json_data.xml.FromUserName[0]); //学号1501210406,即userid
							//	console.log("myServer_reply:", myServer_reply);

							encryptReply = cryptor.encrypt(myServer_reply);
							//	console.log("encrypt_reply: ", encryptReply);

							encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
							//	console.log("encrypt_reply_data: ", encryptReply_data);
							response.end(encryptReply_data);
						}

						if (my_EventKey === 'department_ID') {

							getUserInfo(json_data.xml.FromUserName[0]).then(function (user_info_data) {

								var user_data1 = user_info_data;
								console.log("user_data", user_data);

								var user_name1 = user_data.name;
								console.log("用户的名字：user_name：", user_data.name);
								var user_genderNum1 = user_data.gender;
								//console.log("user_genderNum :",user_genderNum);
								var user_gender1;
								if (user_genderNum1 == '1') {
									user_gender1 = "男";
								} else {
									user_gender1 = "女";
								}
								console.log("用户的姓别：user_gender：", user_gender1);
								var user_studentID1 = user_data.userid;
								console.log("用户的学号：user_studentId：", user_data.userid);
								var user_mobile1 = user_data.mobile;
								console.log("用户的手机：user_mobile：", user_data.mobile);
								var user_departmentId1 = user_data.department;
								console.log("用户所属部门ID：user_departmentId：", user_departmentId[0]);

								myServer_reply = unencrypt_reply(json_data, '该用户为：' + user_name + ' ; ' + '所属部门ID=' + user_departmentId[0]+';该部门为：互联网软件开发技术与实践课程。'); //用户所属的部门ID
								//console.log("myServer_reply:", myServer_reply);

								encryptReply = cryptor.encrypt(myServer_reply);
								//console.log("encrypt_reply: ", encryptReply);

								encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
								//console.log("encrypt_reply_data: ", encryptReply_data);
								response.end(encryptReply_data);
							});

						}

						if (my_EventKey === 'read_currentNum_key') {

							var do_sql3 = 'select * from user where StudentID=?';
							var sql_params03 = json_data.xml.FromUserName[0];
							try {
								OperationSql(do_sql3, sql_params03).then(function (sql_result) {
									console.log("sql_result :", sql_result);
									myServer_reply = unencrypt_reply(json_data, sql_result[0].name+ '当前取到号码是：'+sql_result[0].id+'号'); 
								//console.log("myServer_reply:", myServer_reply);

								encryptReply = cryptor.encrypt(myServer_reply);
								//console.log("encrypt_reply: ", encryptReply);

								encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
								//console.log("encrypt_reply_data: ", encryptReply_data);
								response.end(encryptReply_data);
								});
							} catch (err) {
								console.log("数据库操作失败 err: ", err);
							}
						}

						if (my_Event === 'LOCATION') { //距离小于2公里时可以取号

							var latitude1 = json_data.xml.Latitude[0];
							var longtitude1 = json_data.xml.Longitude[0];
							var latitude2 = 39.756702; //第一个点的纬度
							var longtitude2 = 116.350914; //第一个点的经度
							var d = 0;
							d = gps.getDistance(longtitude1, latitude1, longtitude2, latitude2); //以米为单位
							console.log("距离长度为(单位/米)：" + d); //经过地图实测，这个函数是准确的
							if (d <= 2000.0)
								isAcessNum = true;
							console.log("可以取号吗？" + isAcessNum);

						}

						
						
						if (my_EventKey === 'quhao') { //用户点击了取号的按键  (首先判断，该成员是否已经取过号码了)
							console.log("用户点击了取号的按键！");
							console.log("isAcessNum :", isAcessNum);
							console.log("取号：managerSayNum[2]", managerSayNum[2]);
							var isEmpty = false;
							var user_studentID = json_data.xml.FromUserName[0];
							try {
								var do_sql3 = 'select * from user where StudentID=?';
								var sql_params03 = [user_studentID];
								OperationSql(do_sql3, sql_params03).then(function (sql_result) {
									var sqlResult = sql_result;
									if (sqlResult[0] == null) {
										isEmpty = true;
										console.log("111111 isEmpty", isEmpty);
									} else {

										if (sql_result[0].id <= managerSayNum[2]) //如果该成员的号码小于管理员发布的数字，那么该成员有权限重新取号。（目的，有些同学取到号了，有事来不了，只能往后继续排）
										{
											//删除数据库原先的信息
											var do_sql4 = 'delete from user where StudentID=?';
											var sql_params04 = [user_studentID];

											try {
												OperationSql(do_sql4, sql_params04).then(function (sql_result) {
													console.log("77777777成功删除!");
													console.log("666666sql_result :", sql_result);
													isEmpty = true; //可以，重新取号了。
													console.log("可以重新取号了。isEmpty: ", isEmpty);
												});
											} catch (err) {
												console.log("数据库操作失败 err: ", err);
											}

										} else {
											isEmpty = false;
											myServer_reply = unencrypt_reply(json_data, '不要调皮！您当前的号码为：' + sql_result[0].id + '号' + ' ,不能重复取号!!!');
											//	console.log("myServer_reply:", myServer_reply);

											encryptReply = cryptor.encrypt(myServer_reply);
											//	console.log("encrypt_reply: ", encryptReply);

											encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
											//console.log("encrypt_reply_data: ", encryptReply_data);
											response.end(encryptReply_data);
										}

									}
									console.log("查询 sql_result[0].StudentID :", sql_result);

									console.log("55555555isEmpty :", isEmpty);
									
									if(!isAcessNum){
										
										myServer_reply = unencrypt_reply(json_data, '很是抱歉！，您无法取号，因为您当前的位置离软微学院超过2公里，请移步至学校附近再点击取号！');
											//	console.log("myServer_reply:", myServer_reply);

											encryptReply = cryptor.encrypt(myServer_reply);
											//	console.log("encrypt_reply: ", encryptReply);

											encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
											//console.log("encrypt_reply_data: ", encryptReply_data);
											response.end(encryptReply_data);
									}
									if (isAcessNum && isEmpty) {

										getUserInfo(json_data.xml.FromUserName[0]).then(function (user_info_data) {

											var user_data = user_info_data;
											console.log("user_data", user_data);

											var user_name = user_data.name;
											console.log("用户的名字：user_name：", user_data.name);
											var user_genderNum = user_data.gender;
											//console.log("user_genderNum :",user_genderNum);
											var user_gender;
											if (user_genderNum == '1') {
												user_gender = "男";
											} else {
												user_gender = "女";
											}
											console.log("用户的姓别：user_gender：", user_gender);
											var user_studentID = user_data.userid;
											console.log("用户的学号：user_studentId：", user_data.userid);
											var user_mobile = user_data.mobile;
											console.log("用户的手机：user_mobile：", user_data.mobile);
											var user_departmentId = user_data.department;
											console.log("用户所属部门ID：user_departmentId：", user_departmentId[0]);

											var do_sql = 'insert into user (name,gender,StudentID,departmentID,mobile) values(?,?,?,?,?)';
											var sql_params = [user_name, user_gender, user_studentID, user_departmentId, user_mobile];

											try {
												OperationSql(do_sql, sql_params).then(function (sql_result) {
													console.log("数据插入成功！sql_result :", sql_result);

													try {
														var do_sql3 = 'select * from user where StudentID=?';
														var sql_params03 = [user_studentID];
														OperationSql(do_sql3, sql_params03).then(function (sql_result) {
															console.log("查询 sql_result :", sql_result);
															myServer_reply = unencrypt_reply(json_data, '取号成功！ 您当前的号码为：' + sql_result[0].id + '号');
															//console.log("myServer_reply:", myServer_reply);

															encryptReply = cryptor.encrypt(myServer_reply);
															//console.log("encrypt_reply: ", encryptReply);

															encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
															//console.log("encrypt_reply_data: ", encryptReply_data);
															response.end(encryptReply_data);

														});
													} catch (err) {
														console.log("数据库操作失败 err: ", err);
													}

												});
											} catch (err) {
												console.log("数据库操作失败 err: ", err);
											}

										});

									}

								});
							} catch (err) {
								console.log("数据库操作失败 err: ", err);
							}

						}

						if (my_EventKey === 'manager_brocast_key') {

							if (json_data.xml.FromUserName[0] === '1501210406') {
								isManager = true;
								isBroadcast = true;
								isBegin = false;
								isRead = false;
								myServer_reply = unencrypt_reply(json_data, '管理员，欢迎您，您可以群发通知了！（友情提醒：管理员说话格式： 请 xxx号---xxx号同学前来排队注册！）');
								//console.log("myServer_reply:", myServer_reply);

								encryptReply = cryptor.encrypt(myServer_reply);
								//console.log("encrypt_reply: ", encryptReply);

								encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
								//console.log("encrypt_reply_data: ", encryptReply_data);
								response.end(encryptReply_data);

							} else {
								isManager = false;
								isBroadcast = false;
								isBegin = false;
								isRead = false;
								myServer_reply = unencrypt_reply(json_data, '很抱歉，您不是管理员，没有权限操作！');
								//console.log("myServer_reply:", myServer_reply);

								encryptReply = cryptor.encrypt(myServer_reply);
								//console.log("encrypt_reply: ", encryptReply);

								encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
								//console.log("encrypt_reply_data: ", encryptReply_data);
								response.end(encryptReply_data);
							}

						}

						if (my_EventKey === 'manager_say_start_key') {
							if (json_data.xml.FromUserName[0] === '1501210406') {
								isManager = true;
								isBegin = true;
								isRead = false;
								isBroadcast = false;
								myServer_reply = unencrypt_reply(json_data, '管理员，赶紧群发通知大家可以抢票了！！！');
								//console.log("myServer_reply:", myServer_reply);

								encryptReply = cryptor.encrypt(myServer_reply);
								//console.log("encrypt_reply: ", encryptReply);

								encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
								//console.log("encrypt_reply_data: ", encryptReply_data);
								response.end(encryptReply_data);

							} else {
								isManager = false;
								isBegin = false;
								myServer_reply = unencrypt_reply(json_data, '很抱歉，您不是管理员，没有权限操作！');
								//console.log("myServer_reply:", myServer_reply);

								encryptReply = cryptor.encrypt(myServer_reply);
								//console.log("encrypt_reply: ", encryptReply);

								encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
								//console.log("encrypt_reply_data: ", encryptReply_data);
								response.end(encryptReply_data);
							}
						}
						if (my_EventKey === 'manager_read_student_num') {
							if (json_data.xml.FromUserName[0] === '1501210406') {
								isManager = true;
								isRead = true;
								isBroadcast = false; //判断管理员是否可以群发功能
								isBegin = false; //判断是否可以开始抢号了
								myServer_reply = unencrypt_reply(json_data, '管理员，请输入学生的学号！！！');
								//console.log("myServer_reply:", myServer_reply);

								encryptReply = cryptor.encrypt(myServer_reply);
								//console.log("encrypt_reply: ", encryptReply);

								encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
								//console.log("encrypt_reply_data: ", encryptReply_data);
								response.end(encryptReply_data);

							} else {
								isManager = false;
								isRead = false;
								myServer_reply = unencrypt_reply(json_data, '很抱歉，您不是管理员，没有权限操作！');
								//console.log("myServer_reply:", myServer_reply);

								encryptReply = cryptor.encrypt(myServer_reply);
								//console.log("encrypt_reply: ", encryptReply);

								encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
								//console.log("encrypt_reply_data: ", encryptReply_data);
								response.end(encryptReply_data);
							}
						}

				}
			});
		}

	});

server.listen(PORT, function () {
	console.log('Server running at port:' + PORT);
});
