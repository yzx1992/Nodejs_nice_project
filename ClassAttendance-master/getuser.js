/**
 * Created by Mackenzie on 2016/5/17.
 */
//�˴���Ҫ��config.js�����appID��appSecret,
    // �޸�ÿ2Сʱһ�ĵ�token���ݣ����־û���token.dat�ļ���
var appID = require('./config').appID;
var appSecret = require('./config').appSecret;
var getToken = require('./token').getToken;
var request = require('request');
var Promise = require("es6-promise").Promise;
//guess������΢�Žӿڣ�������ȡһ���û��ľ�����Ϣ������ʹ��accessToken!


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
