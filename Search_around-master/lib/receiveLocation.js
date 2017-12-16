var WXBizMsgCrypt=require("wechat-crypto");
var tmpl=require('tmpl');
var config=require("./config.js").config;

function Locationtmp(msg,result){
	var part='<item>'+
		'<Title><![CDATA[{name}]]></Title>'+
		'<Description><![CDATA[]]></Description>'+
		'<PicUrl><![CDATA[]]></PicUrl>'+
		'<Url><![CDATA[{url}]]></Url>'+
		'</item>';
	var whole='';
	var name='';
	var url='';
	var temp;
	for(var i=0;i<=(result.results).length;i++)
	{
		if(i==0){
			name="周边检索信息：";
			url='';
		}else{
			if(result.results[i-1].telephone){
				name='【'+result.results[i-1].name+'】'+'<'+result.results[i-1].detail_info.distance+'米>\n'+result.results[i-1].address+'\n'+result.results[i-1].telephone;
			}else{
				name='【'+result.results[i-1].name+'】'+'<'+result.results[i-1].detail_info.distance+'米>\n'+result.results[i-1].address;
			}

			if(result.results[i-1].detail_info.detail_url){
				url=result.results[i-1].detail_info.detail_url;
			}else{
				url='';
			}
		}
		temp=tmpl(part,{
			name:name,
			url:url
		});
		whole+=temp;	
	}
	var replyTmpl='<xml>' +
		'<ToUserName><![CDATA[{toUser}]]></ToUserName>' +
		'<FromUserName><![CDATA[{fromUser}]]></FromUserName>' +
		'<CreateTime><![CDATA[{time}]]></CreateTime>' +
		'<MsgType><![CDATA[{type}]]></MsgType>' +
		'<ArticleCount>{count}</ArticleCount>' +
		'<Articles>'+
		whole+
		'</Articles>'+
		'</xml>';
	return tmpl(replyTmpl,{
		toUser:msg.xml.FromUserName[0],
		fromUser:msg.xml.ToUserName[0],
		type:'news',
		count:(result.results).length,
		time:Date.now(),
	});
}

function replytmp(msg){
	var wrapTpl='<xml>' +
		'<Encrypt><![CDATA[{encrypt}]]></Encrypt>' +
		'<MsgSignature><![CDATA[{signature}]]></MsgSignature>'+
		'<TimeStamp>{timestamp}</TimeStamp>'+
		'<Nonce><![CDATA[{nonce}]]></Nonce>'+
		'</xml>';
	var cryptor=new WXBizMsgCrypt(config.token,config.encodingAESKey,config.corpId);
	var timestamp=new Date().getTime();
	var nonce=parseInt((Math.random()*100000000000),10);
	var encrypt=msg;
	var signature=cryptor.getSignature(timestamp,nonce,encrypt);
	return tmpl(wrapTpl,{
		encrypt:encrypt,
		signature:signature,
		timestamp:timestamp,
		nonce:nonce
	});
}

function receiveLocation(msg,result){
	var location=Locationtmp(msg,result);
	var cryptor=new WXBizMsgCrypt(config.token,config.encodingAESKey,config.corpId);
	var reply=replytmp(cryptor.encrypt(location));
	return reply;
}

module.exports={
	receiveLocation:receiveLocation	
}
