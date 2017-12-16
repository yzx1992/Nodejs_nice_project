var WXBizMsgCrypt = require('wechat-crypto');
var config = require('./config');

function verify_Url(params, response) {

	var msg_signature = params.msg_signature;
	var timestamp = params.timestamp;
	var nonce = params.nonce;
	var echostr = params.echostr;
	var cryptor = new WXBizMsgCrypt(config.token, config.encodingAESKey, config.corpId);
	console.log("解密前：echostr: ", echostr);
	var s = cryptor.decrypt(echostr);
	console.log("解密后：echostr: ", s);
	response.end(s.message);
}

module.exprots = {
	verify_Url : verify_Url
};
