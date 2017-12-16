/**
 * Created by sunny on 16/5/1.
 */
'use strict'
var xml2js = require('xml2js');
var Promise = require('bluebird');
var tpl = require('./tpl');
var tr = require('./tpl_reply');
exports.parseXMLAsync = function(xml){
    return new Promise(function(resolve,reject){
        xml2js.parseString(xml,{trim:true},function(err,content){
            if(err) reject(err);
            else resolve(content);
        });
    });
}

function formatMessage(result){
    var message = {};
    if(typeof result === 'object'){
        //提取出result的key值们
        var keys = Object.keys(result);
        for(var i= 0;i<keys.length;i++){
            //键值对
            //key:item
            var item = result[keys[i]];
            var key = keys[i];
            if(!(item instanceof Array) || item.length ===0)
                continue;
             if(item.length ===1){
                var val = item[0];
                if(typeof val == 'object'){
                    message[key] = formatMessage(val);
                }
                else{
                    message[key] = (val || '').trim();
                }
            }
            else{
                message[key] =[];
                for(var j=0,k=item.length;j<k;j++){
                    message[key].push(formatMessage(item[j]));
                }
            }
        }
    }
    return message;
}

exports.formatMessage = formatMessage;
//根据content:回复给用户的内容和message:用户发过来的信息
exports.tpl = function(content,message){
    //存储回复的内容
    var info = {};
    var type = 'text'
    var fromUserName = message.FromUserName;
    var toUserName = message.ToUserName;
    if(Array.isArray(content)){
        type = 'news';
    }
    type = content.type||type;
    info.ToUserName = fromUserName;
    info.FromUserName = toUserName;
    info.CreateTime = new Date().getTime();
    info.MsgType = type;
    info.content = content;
    console.log('************content**********');
    console.log(content);
    return tpl.compiled(info);

}
exports.tpl_reply = function(tpl_reply){
    return tr.compiled(tpl_reply);

}
