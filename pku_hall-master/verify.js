/**
 * Created by lenovo on 2016/6/7.
 */
var express = require('express');
var WXBizMsgCrypt = require('wechat-crypto');

var config = require('./lib/config');

var app = express();

app.get('/',function (req,res) {//回调函数URL的三个参数
    var msg_signature = req.query.msg_signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;
    var cryptor = new WXBizMsgCrypt(config.token,config.encodingAESKey,config.corpid)
    var s = cryptor.decrypt(echostr);
    res.send(s.message);

});

app.listen(3008);
console.log('Server running at port : 3008');