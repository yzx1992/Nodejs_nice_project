/**
 * Created by sunny on 16/4/30.
 */
'use strict'
var sha1 = require('sha1');
var Promise = require('bluebird');
var getRawBody = require('raw-body');
//request的then方法,是request promise化之后得到的
var request = Promise.promisify(require('request'));
var Wechat = require('./wechat');
var util = require('./util');
var WXBizMsgCrypt = require('wechat-crypto');
var config = require('../config.js')
module.exports = function(opts,handler){
    //wechat存储的数据是和微信交互的接口,里面存储信息:票据,还有票据有效性检查的方法
    var wechat = new Wechat(opts);
    return function *(next){//生成期函数
        var that = this;
        console.log(this.query);
        //本地的
        var token = opts.token;
        //请求query里的
        var timestamp = this.query.timestamp;
        var nonce = this.query.nonce;
        var signature = this.query.msg_signature;
        var echostr = this.query.echostr;
        var str = [token,timestamp,nonce].sort().join('');
        var sha = sha1(str);

        console.log('***************this**************');
        console.log(this);
        if(this.method === 'GET'){
            //企业应用对echostr参数解密并原样返回echostr明文，则接入验证生效，回调模式才能开启。
            if(sha == signature){
                var cryptor = new WXBizMsgCrypt(config.wechat.token, config.wechat.EncodingAESKey, config.wechat.corpid);
                var echostr = cryptor.decrypt(echostr);
                this.body = echostr+'';
            }
            else{
                this.body = 'wrong';

            }
        }
        else if(this.method === 'POST'){
            var data = yield getRawBody(this.req, {
                length:this.length,
                limit:'1mb',
                encoding:this.charset
            });

            var content = yield util.parseXMLAsync(data);
            //获得json格式的content
            var message = util.formatMessage(content.xml);
            //企业需要对msg_signature进行校验
            var Encrypt = message.Encrypt;
            var str = [token,timestamp,nonce,Encrypt].sort().join('');
            var sha = sha1(str);
            if(sha !== signature){
                this.body = 'wrong';
                return false;
            }
            //解密msg_encrypt，得出msg的原文,message的内容是xml格式
            var cryptor = new WXBizMsgCrypt(config.wechat.token, config.wechat.EncodingAESKey, config.wechat.corpid);
            var de_message = cryptor.decrypt(Encrypt);
            var result = de_message.message;
            var message_xml = yield util.parseXMLAsync(result);
            var message = util.formatMessage(message_xml.xml);
            this.weixin = message;
            console.log('*************message********************');
            console.log(message);
            //走向外层逻辑,改变上下文
            //reply里面根据用户信息返回相应的数据 handler:reply
            //this.body 是json格式的
            yield handler.call(this,next);
            wechat.reply.call(this);
        }
    }
}
