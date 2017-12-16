var tmpl = require('tmpl');
function replyText(msg, replyText){
  /*if(msg.xml.MsgType[0] !== 'text'){
    return '';
  }*/
  //console.log(msg);

  //将要返回的消息通过一个简单的tmpl模板（npm install tmpl）返回微信
  //var tmpl = require('tmpl');

    var replyTmpl ='<xml>'+
        '<ToUserName><![CDATA[{toUser}]]></ToUserName>'+
        '<FromUserName><![CDATA[{fromUser}]]></FromUserName>'+
        '<CreateTime>{createtime}</CreateTime>'+
        '<MsgType><![CDATA[{type}]]></MsgType>'+
        '<Content><![CDATA[{content}]]></Content>'+
        '</xml>';

  return tmpl(replyTmpl, {
      toUser: msg.xml.FromUserName[0],
      fromUser: msg.xml.ToUserName[0],
      type: 'text',
      createtime: Date.now(),
      content: replyText
  });
}
function replyCrypto(encryptoMsg,params,Signature){
    /*if(msg.xml.MsgType[0] !== 'text'){
     return '';
     }*/
    //console.log(msg);

    //将要返回的消息通过一个简单的tmpl模板（npm install tmpl）返回微信
//    var tmp = require('tmpl');
    var replyTmpl = '<xml>'+
        '<Encrypt><![CDATA[{msg_encrypt}]]></Encrypt>'+
        '<MsgSignature><![CDATA[{msg_signature}]]></MsgSignature>'+
        '<TimeStamp>{timestamp}</TimeStamp>'+
        '<Nonce><![CDATA[{nonce}]]></Nonce>'+
        '</xml>';

    return tmpl(replyTmpl, {
        msg_encrypt: encryptoMsg,
        msg_signature:Signature,
        timestamp: params.timestamp,
        nonce:params.nonce
    });
}

module.exports = {
  replyText: replyText,
  replyCrypto: replyCrypto
};
