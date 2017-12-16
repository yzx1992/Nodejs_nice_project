/**
    这个模块用来获得有效token
    使用：

    var appID = require('./config').appID,
      appSecret = require('./config').appSecret;

    getToken(appID, appSecret).then(function(token){
      console.log(token);
    });

    http://mp.weixin.qq.com/wiki/14/9f9c82c1af308e3b14ba9b973f99a8ba.html
 */

var request = require('request');
var fs = require('fs');
var Promise = require('promise');

/*
function getToken(appID, appSecret){
  return new Promise(function(resolve, reject){
    var token;

    //先看是否有token缓存，这里选择用文件缓存，可以用其他的持久存储作为缓存
    if(fs.existsSync('token.dat')){
      token = JSON.parse(fs.readFileSync('token.dat'));
        //parse用于从一个字符串中解析出json对象
    }

    //如果没有缓存或者过期
    if(!token || token.timeout < Date.now()){
      request('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appID+'&secret=' + appSecret, function(err, res, data){
        var result = JSON.parse(data);
       console.log("https://api.weixin.qq.com/…… 返回的信息，转成JSON格式 result=",result);
        result.timeout = Date.now() + 7000000;
        //更新token并缓存
        //因为access_token的有效期是7200秒，每天可以取2000次
        //所以差不多缓存7000秒左右肯定是够了
        fs.writeFileSync('token.dat', JSON.stringify(result));
        //stringify()用于从一个对象解析出字符串
        resolve(result);
      });      
    }else{
      resolve(token);
    }

  });
}
*/


var later = require('later');
var https = require('https');

function getToken(appID, appSecret){
  return new Promise(function(resolve, reject){
    var token;
	var access_token;
	
	later.date.localTime();
console.log("Now:" + new Date());

var sched = later.parse.recur().every(1).hour();
next = later.schedule(sched).next(10);
console.log(next);

var timer = later.setInterval(test, sched);
setTimeout(test, 1000);

function test() {
   console.log(new Date());
   var options = {
      hostname: 'api.weixin.qq.com',
      path: '/cgi-bin/token?grant_type=client_credential&appid=' + appID + '&secret=' + appSecret
   };
   var req = https.get(options, function (res) {
      console.log("statusCode: ", res.statusCode);
      console.log("headers: ", res.headers);
      var bodyChunks = '';
      res.on('data', function (chunk) {
         bodyChunks += chunk;
      });
      res.on('end', function () {
         var body = JSON.parse(bodyChunks);
         console.log("body:",body);
         if (body.access_token) {
            access_token = body.access_token;
			resolve(access_token);
            //saveAccessToken(access_token);
            console.log("access_token=",access_token);
         } else {
            console.dir(body); //在有调试工具的浏览器上支持较好，各大浏览器均支持此功能
         }
      });
   });
   req.on('error', function (e) {
      console.log('ERROR: ' + e.message);
   });
}


  });
  }
module.exports = {getToken: getToken};