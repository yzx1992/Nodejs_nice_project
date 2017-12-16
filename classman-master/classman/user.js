/**
 * Created by Nicholas_Wang on 2016/6/12.
 */
var config = require('./config');
var getToken = require('./token').getToken;
var request = require('request');

function getUserId(code) {
    return getToken(config.corpId, config.corpsecret).then(function (res) {
        var token = res.access_token;
        return new Promise(function (resolve, reject) {
            request('https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token='+token+'&code='+code, function (err, res, data) {
                console.log('userId data: ',data);
                resolve(JSON.parse(data));
            });

        });

    }).catch(function (err) {
        console.log(err);
    });
}

function getUserInfo(userId) {
    return getToken(config.corpId, config.corpsecret).then(function (res) {
        var token = res.access_token;
        return new Promise(function (resolve, reject) {
            request('https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token='+token+'&userid='+userId, function (err, res, data) {
                resolve(JSON.parse(data));
            });

        });

    }).catch(function (err) {
        console.log(err);
    });
}

module.exports = {
    getUserId: getUserId,
    getUserInfo: getUserInfo
};