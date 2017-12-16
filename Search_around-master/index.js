var express = require('express');
var WXBizMsgCrypt = require('wechat-crypto');
var replyText=require("./lib/replyText.js").replyText;
var receiveLocation=require("./lib/receiveLocation.js").receiveLocation;
var catchEntities=require("./lib/setLocation.js").catchEntities;
var config=require("./lib/config.js").config;

var i=0;
var flag=new Array();

var app=express();

app.use(function(request, response){
	if(request.method=="GET"){	//verify url
		var msg_signature=request.query.msg_signature;
		var timestamps=request.query.timestamp;
		var nonce=request.query.nonce;
		var echostr = request.query.echostr;
		var cryptor = new WXBizMsgCrypt(config.token, config.encodingAESKey, config.corpId);
		var s = cryptor.decrypt(echostr);
		response.send(s.message);
 	}else{	//get & handle postdata
		var postdata="";

		request.addListener("data",function(postchunk){
			postdata+=postchunk;
		});

		request.addListener("end",function(){
			var parseString=require("xml2js").parseString;
			parseString(postdata,function(err,result){
				if(!err){
					var cryptor=new WXBizMsgCrypt(config.token,config.encodingAESKey,config.corpId);
					var test=cryptor.decrypt(result.xml.Encrypt[0]);
					parseString(test.message,function(err,result1){
						switch(result1.xml.MsgType[0])
                				{
							case 'text':
                                                                for(var j=0;j<flag.length;j++){
                                                                        if(flag[j][0]==result1.xml.FromUserName[0]){
                                                                                break;
                                                                        }
                                                                }

								if(result1.xml.Content[0]=='医院')
									flag[j]=new Array(result1.xml.FromUserName[0],0);
								else if(result1.xml.Content[0]=='银行')
									flag[j]=new Array(result1.xml.FromUserName[0],1);
								else if(result1.xml.Content[0]=='酒店')
									flag[j]=new Array(result1.xml.FromUserName[0],2);
								else
									flag[j]=new Array(result1.xml.FromUserName[0],3);
								
								i++;

								if(flag[j][1]!=3)
									var reply=replyText(result1,"请发送你的位置"+'/::)');
								else
									var reply=replyText(result1,"默认搜索医院，请发送你的位置"+'/::)');
								
								response.end(reply);
								break;
							case 'event':
								var content='欢迎使用周边咻一咻'+'/::)';
								if(result1.xml.Event[0]==='enter_agent'){
                                                                	content="欢迎进入周边咻一咻！"+'/::)'+"\n你可以回复“医院”、“银行”或“酒店”来获取周边服务！";
								}
								var reply=replyText(result1,content);
								response.end(reply);
								break;
                        				case 'location':
								for(var j=0;j<flag.length;j++){
									if(flag[j][0]==result1.xml.FromUserName[0]){
										break;
									}
								}
								if(j<flag.length){
									catchEntities(flag[j][1],result1.xml.Location_X[0],result1.xml.Location_Y[0],2000).then(function(result2){
										if(result2!="没有找到附近服务！"){
											var reply=receiveLocation(result1,result2);
										}else{
											var reply=replyText(result1,'/::<'+"没有找到附近服务！");
										}
										response.end(reply);
									});
								}else{
									var reply=replyText(result1,"请先输入关键词：医院、酒店或银行！");	
									response.end(reply);
								}
								break;
							default:
								var reply=replyText(result1,"请发送关键词和位置以获取周边服务！");
								response.end(reply);
						}
					});
			      }
			});
		});
	}	
});
 
app.listen(3333,function(){
	console.log("App is running at port 3333!");
});
