/**
 * Created by sunny on 16/4/30.
 */
'use strict'
var Promise = require('bluebird');
var tpl = require('./tpl');
var util = require('./util');
//判断是否为数组
var util1 = require('util');
var fs = require('fs');
var WXBizMsgCrypt = require('wechat-crypto');
var config = require('../config.js')
var sha1 = require('sha1');

//request的then方法,是request promise化之后得到的
var request = Promise.promisify(require('request'));
var prefix = 'https://qyapi.weixin.qq.com/cgi-bin/';
var api ={
    accessToken:prefix+'gettoken?',
    upload:prefix+'media/upload?',
    ticket:{
        get:prefix+'ticket/getticket?'
    },
    menu:{
        create:prefix+'menu/create?',
        get:prefix+'menu/get?',
        del:prefix+'menu/delete?',
        current:prefix+'get_current_selfmenu_info?'

    },
    user:{
        remark:prefix+'user/info/updateremark?',
        fetch:prefix+'user/info?',
        batchFetch:prefix+'user/info/batchget?'

    }

}
//构造函数,传入参数是票据opts:config.wechat
function Wechat(opts){
    var that = this;
    this.corpid = opts.corpid;
    this.corpsecret = opts.corpsecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    this.getTicket = opts.getTicket;
    this.saveTicket = opts.saveTicket;
    this.fetchAccessToken();

}
//company
Wechat.prototype.updateAccessToken = function(){
    var corpid = this.corpid;
    var corpsecret = this.corpsecret;
    var url =api.accessToken+'corpid='+corpid+'&corpsecret='+corpsecret;
    console.log('*****************url*********************');
    console.log(url);
    //发出请求
    return new Promise(function(resolve,reject){
        request({url :url, json: true}).then(function(response) {
            var data = response.body;
            var now = (new Date().getTime());
            // 提前20秒刷新,考虑网络延迟
            var expires_in = now + (data.expires_in - 20) * 1000;
            data.expires_in = expires_in;
            console.log('*****************data*********************');
            console.log(data);
            resolve(data);
        });
    });

}
//company
Wechat.prototype.fetchAccessToken = function(data){
    var that = this;
    //read wechat.txt
    return this.getAccessToken()
        .then(function(data){
            try{
                data = JSON.parse(data);
            }
                //获取不到,更新票据信息
            catch(e){
                return that.updateAccessToken();
            }
            if(that.isValidAccessToken(data)){
                //把data传下去
                return Promise.resolve(data);
            }
            else{
                //如果票据过期
                return that.updateAccessToken();
            }
        })
        //拿到票据结果
        .then(function(data){
            //write wechat.txt
            that.saveAccessToken(data);
            return Promise.resolve(data);
        })
}

Wechat.prototype.isValidAccessToken = function(data){
    if(!data || !data.access_token || !data.expires_in){
        return false;
    }
    var access_token = data.access_token;
    var expires_in = data.expires_in;
    var now = (new Date().getTime());

    if(now<expires_in){
        //没过期
        return true;
    }
    else{
        return false;
    }
}
Wechat.prototype.fetchTicket = function(access_token){
    var that = this;

    return this.getTicket()
        .then(function(data){
            try{
                data = JSON.parse(data);
            }
                //获取不到,更新票据信息
            catch(e){
                return that.updateTicket(access_token);
            }
            if(that.isValidTicket(data)){
                //把data传下去
                return Promise.resolve(data);
            }
            else{
                //如果票据过期
                return that.updateTicket(access_token);
            }
        })
        //拿到票据结果
        .then(function(data){
            that.saveTicket(data);
            return Promise.resolve(data);
        })
}


Wechat.prototype.uploadMaterial = function(type,filepath){
    var that = this;
    var form ={
        media:fs.createReadStream(filepath)
    }
    var appID = that.appID;

    //发出请求
    return new Promise(function(resolve,reject){
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.upload + 'access_token=' +data.access_token + '&type='+ type;

                //request发起请求,请求方法post
                request({method:'POST',url:url, formData:form,json: true}).then(function(response) {
                    var _data = response.body;
                    if(_data){
                        resolve(_data);
                    }
                    else{
                        throw new Error('upload error')
                    }
                }).catch(function(err){
                    reject(err);
                })
            });
    });

}
//从Wechat的原型链上增加一个方法:判断票据是否有效


Wechat.prototype.isValidTicket = function(data){
    if(!data || !data.ticket || !data.expires_in){
        return false;
    }
    var ticket = data.ticket;
    var expires_in = data.expires_in;
    var now = (new Date().getTime());

    if(ticket && now<expires_in){
        //没过期
        return true;
    }
    else{
        return false;
    }
}


Wechat.prototype.updateTicket = function(access_token){
    var url =api.ticket.get+'&access_token='+access_token+'&type=jsapi';
    //发出请求

    return new Promise(function(resolve,reject){
        request({url :url, json: true}).then(function(response) {
            var data = response.body;
            var now = (new Date().getTime());
            // 提前20秒刷新,考虑网络延迟
            var expires_in = now + (data.expires_in - 20) * 1000;

            data.expires_in = expires_in;
            resolve(data);
        });
    });

}

//上下文已经改变,
Wechat.prototype.reply = function(){
    //拿到回复的内容
    var content = this.body;
    //拿到weixin
    var message = this.weixin;
    //根据content:回复给用户的内容和message:用户发过来的信息
    var xml = util.tpl(content,message);
    console.log('*************xml********************');
    console.log(xml);

    var tpl_reply={};
    var cryptor = new WXBizMsgCrypt(config.wechat.token, config.wechat.EncodingAESKey, config.wechat.corpid);
    var msg_encypt = cryptor.encrypt(xml);
    var timestamp = this.query.timestamp;
    var nonce = this.query.nonce;
    var str = [config.wechat.token,timestamp,nonce,msg_encypt].sort().join('');
    var msgSignature = sha1(str);
    tpl_reply.msg_encypt = msg_encypt;
    tpl_reply.msg_signature = msgSignature;
    tpl_reply.timestamp = timestamp;
    tpl_reply.nonce = nonce;
    var reply = util.tpl_reply(tpl_reply);
    console.log('*************reply********************');
    console.log(reply);
    this.status = 200;
    this.type = 'application/xml';
    this.body = reply;
}

Wechat.prototype.createMenu = function(menu){
    var that = this;
    return new Promise(function(resolve,reject){
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.menu.create +'access_token='+data.access_token;
                request({method:'POST',url :url,body:menu, json: true}).then(function(response) {
                    var _data = response.body;
                    if(_data){
                        resolve(_data);
                    }
                    else{
                        throw new Error('create menu fails');
                    }

                }).catch(function(err){
                    reject(err);
                })
            })
    });

}


Wechat.prototype.getMenu = function(menu){
    var that = this;
    return new Promise(function(resolve,reject){
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.menu.get +'access_token='+data.access_token;
                request({url :url, json: true}).then(function(response) {
                    var _data = response.body;
                    if(_data){
                        resolve(_data);
                    }
                    else{
                        throw new Error('get menu fails');
                    }

                }).catch(function(err){
                    reject(err);
                })
            })
    });

}

Wechat.prototype.deleteMenu = function(){
    var that = this;
    return new Promise(function(resolve,reject){
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.menu.del +'access_token='+data.access_token;
                request({url :url, json: true}).then(function(response) {
                    var _data = response.body;
                    if(_data){
                        resolve(_data);
                    }
                    else{
                        throw new Error('delete menu fails');
                    }

                }).catch(function(err){
                    reject(err);
                })
            })
    });

}
Wechat.prototype.getCurrentMenu = function(){
    var that = this;
    return new Promise(function(resolve,reject){
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.menu.current +'access_token='+data.access_token;
                request({url :url, json: true}).then(function(response) {
                    var _data = response.body;
                    if(_data){
                        resolve(_data);
                    }
                    else{
                        throw new Error('getCurrent Menu fails');
                    }

                }).catch(function(err){
                    reject(err);
                })
            })
    });

}

Wechat.prototype.remarkUser = function(openId,remark){
    var that = this;
    return new Promise(function(resolve,reject){
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.user.remark +'access_token='+data.access_token;
                var form = {
                    openid:openId,
                    remark:remark
                }

                request({method:'POST',url :url,body:form, json: true}).then(function(response) {
                    var _data = response.body;
                    if(_data){
                        resolve(_data);
                    }
                    else{
                        throw new Error('Remark user fails');
                    }

                }).catch(function(err){
                    reject(err);
                })
            })
    });

}
Wechat.prototype.fetchUsers = function(openIds,lang){
    var that = this;
    lang = lang || 'zh_CN'
    return new Promise(function(resolve,reject){
        that
            .fetchAccessToken()
            .then(function(data){
                var options = {
                    json :true
                }
                //批量获取用户信息
                if(util1.isArray(openIds)==true){
                    options.url = api.user.batchFetch +'access_token='+data.access_token;
                    options.body = {
                        user_list:openIds
                    }
                    options.method = 'POST'
                }
                //获取单个用户信息
                else{
                    options.url = api.user.fetch +'access_token='+data.access_token+'&openid='+ openIds+'&lang='+lang;
                }
                request(options).then(function(response) {
                    var _data = response.body;
                    if(_data){
                        resolve(_data);
                    }
                    else{
                        throw new Error('Batch Fetch users fails');
                    }

                }).catch(function(err){
                    reject(err);
                })
            })
    });

}
module.exports = Wechat;