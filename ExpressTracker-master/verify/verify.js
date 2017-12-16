var config = require('./config')

var qs = require('qs');
var http = require('http');
var WXBizMsgCrypt = require('wechat-crypto');

function checkSignature(params, token) {
	//1. 将token、timestamp、nonce三个参数进行字典序排序
  	//2. 将三个参数字符串拼接成一个字符串进行sha1加密
  	//3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
	var key = [token, params.timestamp, params.nonce].sort().join('');
	var sha1 = require('crypto').createHash('sha1');
	sha1.update(key);
	
	return sha1.digest('hex') == params.signature;
}

var server = http.createServer(function(req,res) {
	//解析URL中的query部分，用qs模块(npm install qs)将query解析成json
	var query = require('url').parse(req.url).query;
	var params = qs.parse(query);
	
	console.log(params);
	console.log("token->",config.Token);
	
	var cryptor = new WXBizMsgCrypt(config.Token, config.EncodingAESKey, config.CorpID);
	var str = cryptor.decrypt(params.echostr);
	console.log(str);
	
//	if (checkSignature(params,config.Token)) {
		res.end(str.msg);
//	}else {
//		res.end('Signature fail');
//	}
});

server.listen(config.Port);
console.log('Sever running at port : '+config.Port);

