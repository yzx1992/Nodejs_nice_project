
var request = require('request');
var Promise = require('promise');
function getToken(corpId, corpsecret) {

	return new Promise(function (resolve, reject) {

		var url = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=' + corpId + '&corpsecret=' + corpsecret;
		request({
			uri : url
		}, function (err, res, data) {
			var result = JSON.parse(data);
			console.log("result.access_token=", result.access_token);

			resolve(result.access_token);
		});

	});

}

module.exports = {
	getToken : getToken
};
