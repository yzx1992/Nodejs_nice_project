
var getToken = require('./getToken').getToken;
var config = require('./config');
var request = require('request');
var Promise = require('promise');
var corpId = config.corpId;
var corpsecret = config.corpsecret;


function getUserInfo(userid) {
	return getToken(corpId, corpsecret).then(function (access_token) {

		return new Promise(function (resolve, reject) {

			var url = 'https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token=' + access_token + '&userid=' + userid;
			request({
				uri : url
			}, function (err, res, data) {
				var result = JSON.parse(data);
				console.log("111result111= ", result);

				resolve(result);
			});

		});
	});
}

module.exports = {
	getUserInfo : getUserInfo
};
