/**
 * Created by lenovo on 2016/6/1.
 */

var PORT = 3008;
var http = require('http');
var qs = require('qs');
var WXBizMsgCrypt=require("wechat-crypto");
var token ='jiangye';
var encodingAESKey='tzpqBsIhXKkpsC9xepywct5laYScgUHGPuudLcUwlDQ';
var corpid = 'wx1d3765eb45497a18';
var cryptor=new WXBizMsgCrypt(token,encodingAESKey,corpid);
var reply = require('./lib/reply');
var config = require("./lib/config");
var news = require('./lib/news');


var server = http.createServer(function (request , response) {
    var query = require('url').parse(request.url).query;
    var params = qs.parse(query);

        var postdata = "";

        request.addListener("data", function (postchunk) {
            postdata += postchunk;
        });

        /* 获取到了POST数据
         * 将XML数据通过xml2js模板(npm install xml2js)解析成json格式
         */
        request.addListener("end", function () {
            var parseString = require('xml2js').parseString;
                    parseString(postdata, function (err, result) {
                        if (!err) {
                            //console.log(result);
                            var postdata1 = cryptor.decrypt(result.xml.Encrypt[0]); //对对象解密，因此必须将其解析成json格式
                            //console.log(postdata1);

                            parseString(postdata1.message, function (err, result) {
                                if (!err) {
                                    if (result.xml.EventKey) {

                                        if (result.xml.EventKey[0] == 'V1001_EARLY_KNOWN') {

                                                //var res = Menutmp(result, '已收到您的信息');//明文

                                            news.newsOneSend('2XiDAh94OcNekf7VOhIgq2Y268wBC-kmt1_6-N2FdSupPaiEuSrNBWIVx8Tfjtfsh',result.xml.FromUserName[0]).then(function(data){
                                                console.log(data);
                                            });
                                                //var res = reply.replyNews(result);

                                                //console.log(res);

                                            // 进行加密,int EncryptMsg(const string &sReplyMsg, const string &sTimeStamp, const string &sNonce, string &sEncryptMsg);
                                            //console.log('encryptMsg:',encryptMsg);
                                             //var encryptMsg = cryptor.encrypt(res);

                                             //此处主要为了得到MsgSignature
                                             //var MsgSignature = cryptor.getSignature(params.timestamp,params.nonce,encryptMsg);
                                             //var res1 = reply.Replytmp(encryptMsg,params,MsgSignature);
                                             //console.log(res1);

                                            //response.end(res1);
                                            response.end();
                                        }
                                    }
                                }
                            })
                        }
                    });

           });
        });

server.listen(PORT);
console.log("Server runing at port: " + PORT + ".");