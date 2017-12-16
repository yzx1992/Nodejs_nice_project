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

console.log("config.token", config.token);

console.log("config.corpId", config.corpId);

var PORT = 5003;

var cryptor = new WXBizMsgCrypt(config.token, config.encodingAESKey, config.corpId);

var server = http.createServer(function (request, response) {
		var query = require('url').parse(request.url).query;
		console.log("query=", query);
		var params = qs.parse(query);
		//解析URL中的query部分，用qs模块(npm install qs)将query解析成json
		console.log("params=", params);

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
				console.log("postdata= ", postdata);
				var parseString = require('xml2js').parseString;
				//我们将XML数据通过xml2js模块(npm install xml2js)解析成json格式
				parseString(postdata, function (err, result) {

					console.log("result= ", result);
					var encrypt_data = result;
					console.log("encrypt_data", encrypt_data);
					var decrypt_xml_data = cryptor.decrypt(encrypt_data.xml.Encrypt[0]);
					console.log("decrypt_xml_data: ", decrypt_xml_data);

					parseString(decrypt_xml_data.message, function (err, json_data1) {

						json_data = json_data1;
						console.log("json_data: ", json_data);

					});

				});

				var myServer_reply = '';
				var encryptReply = '';
				var encryptReply_data = '';
				if (json_data.xml.MsgType[0] === 'text') {

					myServer_reply = unencrypt_reply(json_data, "消息推送，成功！！"); //myServer_reply为加密的数据
					console.log("myServer_reply:", myServer_reply);

					encryptReply = cryptor.encrypt(myServer_reply);
					console.log("encryptReply: ", encryptReply); //encryptReply为加密后的数据

					encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
					console.log("encrypt_reply_data: ", encryptReply_data);
					response.end(encryptReply_data);
				}

				if (json_data.xml.MsgType[0] === 'event' && json_data.xml.EventKey[0] === 'my_student_id') {

					myServer_reply = unencrypt_reply(json_data, json_data.xml.FromUserName[0]); //学号1501210406,即userid
					console.log("myServer_reply:", myServer_reply);

					encryptReply = cryptor.encrypt(myServer_reply);
					console.log("encrypt_reply: ", encryptReply);

					encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
					console.log("encrypt_reply_data: ", encryptReply_data);
					response.end(encryptReply_data);
				}

				if (json_data.xml.MsgType[0] === 'event' && json_data.xml.EventKey[0] === 'department_ID') {

					getUserInfo(json_data.xml.FromUserName[0]).then(function (user_info_data) {

						var user_data = user_info_data;
						console.log("user_data", user_data);
						var user_name = user_data.name;
						console.log("用户的名字：user_name：", user_data.name);
						var user_mobile = user_data.mobile;
						console.log("用户的手机：user_mobile：", user_data.mobile);
						var user_departmentId = user_data.department;
						console.log("用户所属部门ID：user_departmentId：", user_departmentId[0]);

						myServer_reply = unencrypt_reply(json_data, '该用户为：' + user_name + ' ; ' + '所属部门ID=' + user_departmentId[0]); //用户所属的部门ID
						console.log("myServer_reply:", myServer_reply);

						encryptReply = cryptor.encrypt(myServer_reply);
						console.log("encrypt_reply: ", encryptReply);

						encryptReply_data = encrypt_reply(encryptReply, params, cryptor);
						console.log("encrypt_reply_data: ", encryptReply_data);
						response.end(encryptReply_data);
					});
				}

			});

		}
	});

server.listen(PORT, function () {
	console.log('Server running at port:' + PORT);
});
