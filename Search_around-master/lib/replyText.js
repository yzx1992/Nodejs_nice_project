var config=require("./config.js").config;
var WXBizMsgCrypt=require("wechat-crypto");
var tmpl=require("tmpl");

var tpl='<xml>'+
	'<ToUserName><![CDATA[{toUsername}]]></ToUserName>'+
	'<FromUserName><![CDATA[{fromUsername}]]></FromUserName>'+
	'<CreateTime>{createTime}</CreateTime>'+
	'<MsgType><![CDATA[{msgType}]]></MsgType>'+
	'<Content><![CDATA[{content}]]></Content>'+
	'</xml>';

var wrapTpl='<xml>'+
	'<Encrypt><![CDATA[{encrypt}]]></Encrypt>'+
 	'<MsgSignature><![CDATA[{signature}]]></MsgSignature>'+
	'<TimeStamp>{timestamp}</TimeStamp>'+
	'<Nonce><![CDATA[{nonce}]]></Nonce>'+
	'</xml>';

var reply=function(content,fromUsername,toUsername){
	var info = {};
	var type='text';
	info.content = content || '';
	info.msgType = type;
	info.createTime = new Date().getTime();
	info.toUsername = toUsername;
	info.fromUsername = fromUsername;
	return tmpl(tpl,{
		toUsername:info.toUsername,
		fromUsername:info.fromUsername,
		createTime:info.createTime,
		msgType:info.msgType,
		content:info.content
	});
};

var replyText=function(msg,content){
	var wrap={};
	var cryptor=new WXBizMsgCrypt(config.token,config.encodingAESKey,config.corpId);
	var msg=reply(content,msg.xml.ToUserName[0],msg.xml.FromUserName[0]);
	wrap.timestamp=new Date().getTime();
	wrap.nonce=parseInt((Math.random()*100000000000),10);
	wrap.encrypt=cryptor.encrypt(msg);
	wrap.signature=cryptor.getSignature(wrap.timestamp,wrap.nonce,wrap.encrypt);
	return tmpl(wrapTpl,{
		encrypt:wrap.encrypt,
		signature:wrap.signature,
		timestamp:wrap.timestamp,
		nonce:wrap.nonce
	});
}

module.exports={
	replyText:replyText
}
