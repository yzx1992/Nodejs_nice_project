/**
 * Created by lenovo on 2016/6/11.
 */
/*接收点击事件和回复模板*/
var WXBizMsgCrypt=require("wechat-crypto");
var config = require("./config");
var tmpl=require('tmpl');
var cryptor=new WXBizMsgCrypt(config.token,config.encodingAESKey,config.corpid);

function Menutmp(msg,reply){
    
    var replyTmpl = '<xml>' +
        '<ToUserName><![CDATA[{toUser}]]></ToUserName>' +
        '<FromUserName><![CDATA[{fromUser}]]></FromUserName>' +
        '<CreateTime><![CDATA[{time}]]></CreateTime>' +
        '<MsgType><![CDATA[{type}]]></MsgType>' +
        '<Content><![CDATA[{content}]]></Content>' +
        '</xml>';

    return tmpl(replyTmpl,{
        toUser:msg.xml.FromUserName[0],
        fromUser:msg.xml.ToUserName[0],
        time:Date.now(),
        type:'text',
        content:reply
    });
}

/*微信标准回包*/
function Replytmp(msg1){
    var wrapTpl = '<xml>' +
        '<Encrypt><![CDATA[{encrypt}]]></Encrypt>' +
        '<MsgSignature><![CDATA[{signature}]]></MsgSignature>'+
        '<TimeStamp>{timestamp}</TimeStamp>'+
        '<Nonce><![CDATA[{nonce}]]></Nonce>'+
        '</xml>';

    var encrypt=msg1;
    var timestamp=new Date().getTime();
    var nonce=parseInt((Math.random()*100000000000),10);
    var signature=cryptor.getSignature(timestamp,nonce,encrypt);
    
    return tmpl(wrapTpl,{//调用方自动生成的
        encrypt:encrypt,
        signature:signature,
        timestamp:timestamp,
        nonce:nonce

    });
}

//function receiveLocation(msg3){

function ReceiveMenu(msg3,reply){
    var menutmp=Menutmp(msg3,reply);
    console.log('menutmp');
    /*收到XML文件，先解析成Json，再解密，再解析成Json*/
    var msg2=cryptor.encrypt(menutmp); //加密
    var msg4=Replytmp(msg2);
    return msg4;

}

function replyNews(msg){

    //console.log(msg);

    var tmpl = require('tmpl');
    var replyTmpl = '<xml>' +
        '<ToUserName><![CDATA[{toUser}]]></ToUserName>' +
        '<FromUserName><![CDATA[{fromUser}]]></FromUserName>' +
        '<CreateTime><![CDATA[{time}]]></CreateTime>' +
        '<MsgType><![CDATA[{type}]]></MsgType>' +
        '<ArticleCount>1</ArticleCount>'+
        '<Articles>'+
        '<item>'+
        '<Title><![CDATA[{title1}]]></Title>'+
        '<Description><![CDATA[{description1}]]></Description>'+
        '<PicUrl><![CDATA[{picurl}]]></PicUrl>'+
        '<Url><![CDATA[{url}]]></Url>'+
        '</item>'+
        '</Articles>'+
        '</xml> ';

    return tmpl(replyTmpl,{
        toUser: msg.xml.FromUserName[0],
        fromUser: msg.xml.ToUserName[0],
        type: 'news',
        time: Date.now(),
        title1:'和跑步谈恋爱',
        description1:'哈哈哈',
        picurl:'http://mmbiz.qpic.cn/mmbiz/jI6PvD4ypJviapUOicFbvvqNcPKFkhscTIwXyiaicd5GCeDXP3uvf4syOCoTHGhoCMJpI4tqZjxLFBmchpWIgRMtaw/640',
        url:'https://mp.weixin.qq.com/s?__biz=MzIyNzIxOTE3Nw==&mid=409332461&idx=1&sn=f9e972f73a403875dc12e340c284b4c1&scene=1&srcid=0613tOplGeNC9OyJAFnDwAxK&key=f5c31ae61525f82eddecc6a53d172885f35b19536b4ba3d53bd9464b76d158bb983bdb1c4a04d3bfcfc3f66c99522b2b&ascene=0&uin=NzE1MTMyMzIw&devicetype=iMac+MacBookPro8%2C3+OSX+OSX+10.10.5+build(14F1808)&version=11020201&pass_ticket=TKWNd%2FcEu0%2BnMqj%2FyktzidnoRFo69IKxk6L9ZFFNQZFvKhogfKEEzUDWxJ9VsAe1',
    });

}

exports.replyNews = replyNews;
exports.Menutmp = Menutmp;
exports.Replytmp = Replytmp;
exports.ReceiveMenu = ReceiveMenu;

