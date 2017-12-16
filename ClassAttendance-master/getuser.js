/**
 * Created by Mackenzie on 2016/5/17.
 */
//此处需要在config.js内添的appID和appSecret,
    // 修改每2小时一改的token内容，并持久化在token.dat文件中
var appID = require('./config').appID;
var appSecret = require('./config').appSecret;
var getToken = require('./token').getToken;
var request = require('request');
var Promise = require("es6-promise").Promise;
//guess：根据微信接口，如果想获取一个用户的具体信息，必须使用accessToken!


function getUserInfo(openID){
    console.log("test get User"+openID);
    return getToken(appID, appSecret).then(function(res){
        var token = res.access_token;
        return new Promise(function(resolve, reject){
            request('https://api.weixin.qq.com/cgi-bin/user/info?access_token='+token+'&openid='+openID+'&lang=zh_CN', function(err, res, data){
                resolve(JSON.parse(data));
            });
        });
    }).catch(function(err){
        console.log(err);
    });
}

module.exports = {
    getUserInfo: getUserInfo
};
