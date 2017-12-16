var tmpl = require('tmpl');

function unencrypt_reply(msg, my_text) {
	//  if (msg.xml.MsgType[0] !== 'text') {
	//      return '';
	//    }
	// console.log(msg);

	console.log('my_text:' + my_text);

	var replyTmpl = '<xml>' +
		'<ToUserName><![CDATA[{toUser}]]></ToUserName>' +
		'<FromUserName><![CDATA[{fromUser}]]></FromUserName>' +
		'<CreateTime><![CDATA[{time}]]></CreateTime>' +
		'<MsgType><![CDATA[{type}]]></MsgType>' +
		'<Content><![CDATA[{content}]]></Content>' +
		'<AgentID>47</AgentID>' +
		'</xml>';

	//将要返回的消息通过一个简单的tmpl模板（npm install tmpl）返回微信

	return tmpl(replyTmpl, {
		toUser : msg.xml.FromUserName[0],
		fromUser : msg.xml.ToUserName[0],
		type : 'text',
		time : Date.now(),
		content : my_text
	});

}

module.exports = {
	unencrypt_reply : unencrypt_reply
};
