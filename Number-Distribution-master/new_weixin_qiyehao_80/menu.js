
var https = require('https');
var request = require('request');
var Promise = require('promise');
var corpId = 'wx1d3765eb45497a18';
var corpsecret = 'FR3bZDXiOW7pFPKcZicXTvs80EBJkM7i530KYm9ZKCNG57JN5d5ZKtb9X7fjZCIV';
var agentid = '47'; //企业号-->应用中心-->应用ID=47

var url = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=' + corpId + '&corpsecret=' + corpsecret;
console.log('url', url);

function getToKen(appId, appSecret) {

	return new Promise(function (resolve, reject) {

		request({
			uri : url
		}, function (err, res, data) {
			var result = JSON.parse(data);
			console.log("result.access_token=", result);

			resolve(result.access_token);
		});

	});

}

//var access_token='54leytBpeVm-Un0o200YmOK0iZhCzezQuVwuhSsB_JN3zGt8aKjLzrVtqz1mR8Mn';
var menu = {
	"button" : [{
			"name" : "我的账号",
			"sub_button" : [{
					"type" : "view",
					"name" : "我的博客",
					"url" : "http://blog.csdn.net/yezhenxu1992/"
				}, {
					"type" : "click",
					"name" : "yzx002",
					"key" : "V1002_BID_PROJECTS"
				}, {
					"type" : "click",
					"name" : "yzx003",
					"key" : "V1003_RETURN_PLAN"
				}, {
					"type" : "click",
					"name" : "yzx004",
					"key" : "V1004_TRANS_DETAIL"
				}, {
					"type" : "click",
					"name" : "yzx005",
					"key" : "V1005_REGISTER_BIND"
				}
			]
		}, {

			"name" : "部门ID",
			"sub_button" : [{
					"type" : "click",
					"name" : "获取id",
					"key" : "department_ID"
				}
			]
		}, {
			"name" : "获取学号",
			"sub_button" : [{
					"type" : "click",
					"name" : "我的学号",
					"key" : "my_student_id"
				}
			]
		}
	]
};

var post_str = new Buffer(JSON.stringify(menu));
//var post_str = JSON.stringify(menu);
console.log("JSON.stringify(menu)=", JSON.stringify(menu));
console.log("post_str.toString()=", post_str.toString());
console.log("post_str.length", post_str.length);

//var access_token1= getToKen(corpId,corpsecret);
//console.log("access_token=",access_token1);


getToKen(corpId, corpsecret).then(function (access_token) {

	var post_options = {
		host : 'qyapi.weixin.qq.com',
		port : '443',
		path : '/cgi-bin/menu/create?access_token=' + access_token + '&agentid=' + agentid,
		method : 'POST',
		headers : {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Content-Length' : post_str.length
		}
	};

	var post_req = https.request(post_options, function (response) {
			var responseText = [];
			var size = 0;
			response.setEncoding('utf8');
			response.on('data', function (data) {
				responseText.push(data);
				size += data.length;
			});
			response.on('end', function () {
				console.log("responseText=", responseText);
			});
		});

	// post the data
	post_req.write(post_str);
	post_req.end();

});
