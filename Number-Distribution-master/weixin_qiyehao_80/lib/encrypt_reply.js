var tmpl = require('tmpl');



function encrypt_reply(encrypt_data, params,cryptor) {

	var new_msg_signature = cryptor.getSignature(params.timestamp, params.nonce, encrypt_data); //msg_signature需要重新生成。

	var replyTmpl = '<xml>' +
		'<Encrypt><![CDATA[{msg_encrypt}]]></Encrypt>' +
		'<MsgSignature><![CDATA[{msg_signature}]]></MsgSignature>' +
		'<TimeStamp>{timestamp}</TimeStamp>' +
		'<Nonce><![CDATA[{nonce}]]></Nonce>' +
		'</xml>';

	//将要返回的消息通过一个简单的tmpl模板（npm install tmpl）返回微信

	return tmpl(replyTmpl, {
		msg_encrypt : encrypt_data,
		msg_signature : new_msg_signature,
		timestamp : params.timestamp,
		nonce : params.nonce

	});

}

module.exports = {
	encrypt_reply : encrypt_reply
};
