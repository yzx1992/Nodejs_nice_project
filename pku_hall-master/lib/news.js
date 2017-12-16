/**
 * Created by qinhao on 16/6/14.
 */

var myToken = require('./token');
var urlencode = require('urlencode');
var request = require('request');
var fs = require('fs');


function newsUpload(){
    return myToken.getToken().then(function(res){
        var access_token = res.access_token;

        var url = "https://qyapi.weixin.qq.com/cgi-bin/material/add_mpnews?access_token="+access_token;

        var options = {
            headers: {'Content-Type': 'application/json','charset':'utf-8'},
            url: url,
            method: 'POST',
            json:true,
            body:{
                "agentid":59,
                "mpnews": {
                    "articles": [
                        {
                            "thumb_media_id": "2bp4NpfwF3_c6jYzAWt7epmtSi1quxkFLKmszzM8Q-6fLhudbiFqKkCZ80ai-Qetn",
                            "author": "小白",
                            "title": "百讲票务",
                            "content_source_url": "",
                            "content": "content",
                            "digest": "随时随地查询最新百讲票务信息",
                            "show_cover_pic": "1"
                        }
                    ]
                },
            }
        };

        return new Promise(function(resolve, reject){

            request(options,function(error,response,data){
                resolve(data['media_id']);

            });
        });
    }).catch(function(err){
        console.log(err);
    });
}

function imgUpload(){
    return myToken.getToken().then(function(res){
        var access_token = res.access_token;

        var url = "https://qyapi.weixin.qq.com/cgi-bin/media/uploadimg?access_token=ACCESS_TOKEN"+access_token;

        var r = request.post(url);

        var form = r.form()
        form.append('my_field', 'my_value')
        form.append('my_buffer', new Buffer([1, 2, 3]))
        form.append('my_file', fs.createReadStream('Kobe2.jpg'));
    }).catch(function(err){
        console.log(err);
    });
}

function newsOneGet(mediaId){
    return myToken.getToken().then(function(res) {
        var access_token = res.access_token;
        var agentId = 59;

        var url = 'https://qyapi.weixin.qq.com/cgi-bin/material/get?access_token=' + access_token + '&media_id=' + mediaId + '&agentid=' + agentId;

        var options = {
            headers: {'Content-Type': 'application/json'},
            url: url,
            method: 'POST',
            json: true,
        };

        return new Promise(function (resolve, reject) {
            request(options, function (error, response, data) {
                resolve(JSON.stringify(data['mpnews']));
            });
        });
    });
}

function newsOneUpdate(mediaId,content){
    return myToken.getToken().then(function(res) {
        var access_token = res.access_token;

        var url = "https://qyapi.weixin.qq.com/cgi-bin/material/update_mpnews?access_token="+access_token;
        var options = {
            headers: {'Content-Type': 'application/json','charset':'utf-8'},
            url: url,
            method: 'POST',
            json:true,
            body:{
                "agentid":59,
                "media_id":mediaId,
                "mpnews": {
                    "articles": [
                        {
                            "thumb_media_id": "2bp4NpfwF3_c6jYzAWt7epmtSi1quxkFLKmszzM8Q-6fLhudbiFqKkCZ80ai-Qetn",
                            "author": "小白",
                            "title": "百讲票务",
                            "content_source_url": "",
                            "content": content,
                            "digest": "随时随地查询最新百讲票务信息",
                            "show_cover_pic": "1"
                        }
                    ]
                },
            }
        };

        return new Promise(function(resolve, reject){

            request(options,function(error,response,data){
                resolve(data['errmsg']);

            });
        });
    }).catch(function(err){
        console.log(err);
    });
}

function newsListGet(){
    return myToken.getToken().then(function(res) {
        var access_token = res.access_token;

        var url = "https://qyapi.weixin.qq.com/cgi-bin/material/batchget?access_token="+access_token;
        var options = {
            headers: {'Content-Type': 'application/json','charset':'utf-8'},
            url: url,
            method: 'POST',
            json:true,
            body:{
                "type":"mpnews",
                "agentid":59,
                "offset": 0,
                "count": 50
            }
        };

        return new Promise(function(resolve, reject){

            request(options,function(error,response,data){
                resolve(data);

            });
        });
    });
}

function newsOneDelete(mediaId){
    return myToken.getToken().then(function(res) {
        var access_token = res.access_token;
        var agentId = 59;

        var url = "https://qyapi.weixin.qq.com/cgi-bin/material/del?access_token="+access_token+ '&media_id=' + mediaId + '&agentid=' + agentId;
        var options = {
            headers: {'Content-Type': 'application/json','charset':'utf-8'},
            url: url,
            method: 'GET',
            json:true,
        };

        return new Promise(function(resolve, reject){

            request(options,function(error,response,data){
                console.log(data);
                resolve(data['errmsg']);

            });
        });
    });
}

function newsOneSend(mediaId,toId){
    return myToken.getToken().then(function(res) {
        var access_token = res.access_token;

        var url = "https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token="+access_token;
        var options = {
            headers: {'Content-Type': 'application/json','charset':'utf-8'},
            url: url,
            method: 'POST',
            json:true,
            body:{
                "touser":toId,
                "toparty":"",
                "totag": "",
                "msgtype": "mpnews",
                "agentid":59,
                "mpnews": {
                    "media_id": mediaId
                },
                //"mpnews": {
                //    "articles":[
                //        {
                //            "title": "Title",
                //            "thumb_media_id": "2zALrAvptfIWwKFemoKOsvw89RkMWNeFnPcgsR_FqisHhcepWe0t9WIpteqCB8FPc",
                //            "author": "Author",
                //            "content_source_url": "URL",
                //            "content": "Content",
                //            "digest": "Digest description",
                //            "show_cover_pic": "1"
                //        },
                //    ]
                //},
                "safe": "0"
            }
        };

        return new Promise(function(resolve, reject){

            request(options,function(error,response,data){
                resolve(data);

            });
        });
    });
}

//newsOneSend('2XiDAh94OcNekf7VOhIgq2Y268wBC-kmt1_6-N2FdSupPaiEuSrNBWIVx8Tfjtfsh').then(function(data){
//    console.log(data);
//});






exports.newsUpload = newsUpload;
exports.newsOneGet = newsOneGet;
exports.newsOneUpdate = newsOneUpdate;
exports.newsListGet = newsListGet;
exports.newsOneDelete = newsOneDelete;
exports.newsOneSend = newsOneSend;