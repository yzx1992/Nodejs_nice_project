'use strict'
var config = require('./../config');
var Wechat = require('./../gwechat/wechat');
var menu = require('./menu');
var path = require('path');
var Promise = require('bluebird');
var faceapi = require('../faceapi');
var mysql_api = require('../mysql/express_sql');
//数据库有关
var con = require('../config/config.js');
var mysql= require('mysql');
//var models = require('../models/model');
//var User = models.User;

//config.wechat是票据
var wechatApi = new Wechat(config.wechat);

//生成期函数
exports.reply = function* (next){
	var that = this;
	console.log('this'+this);
	var message = this.weixin;
	//关注,取关,点击,发送位置等事件
	if (message.MsgType ==='event') {
		if (message.Event ==='subscribe') {
			if (message.EventKey) {
				console.log('扫二维码进来');
			}
			this.body = '欢迎关注快递帮帮取\r\n'+
			'回复 天天 顺丰 等快递名称,查询请求\n'+
			'也可以点击<a href="www.baidu.com">所有请求</a>查看所有列表';
		}
		else if (message.Event==='unsubscribe') {
			//this.body='hello';
			//console.log('无情取关');
		}
		else if(message.Event === 'enter_agent'){
			this.body =' ஐﻬ hello软微的小伙伴,大家都在求/帮取快递哦,回复1查看行情~\n ஐﻬ 输入框内，输入快递名称,比如顺丰,圆通,韵达等,就可以查询此类快递的求取信息啦~\n ஐﻬ 点击菜单,试试哦';
		}
		else if (message.Event==='CLICK') {
			this.body='您点击了菜单 '+ message.EventKey;
		}
		else if (message.Event==='SCAN') {
			console.log('关注后扫二维码'+message.EventKey +''+message.Ticket);
			this.body='你扫了二维码哦 ';
		}
		else if (message.Event==='view') {
			console.log('你点击了菜单中的链接 '+ message.EventKey);
			this.body='你点击了菜单中的链接 '+ message.EventKey;
		}
		else if (message.Event==='pic_sysphoto') {
			console.log(message.SendPicsInfo.PicList);
			this.body='你点击了菜单中 '+ message.EventKey;
		}
		else if (message.Event==='pic_photo_or_album') {
			console.log(message.SendPicsInfo.PicList);
			this.body='你点击了菜单中 '+ message.EventKey;
		}
		else if (message.Event==='pic_weixin') {
			console.log(message.SendPicsInfo.PicList);
			this.body='你点击了菜单中 '+ message.EventKey;
		}

	}
	//用户发的text
	else if (message.MsgType==='text') {
		var content = message.Content;
		if(content === '1'){
			var data =yield wechatApi.uploadMaterial('image',path.join(__dirname,'../1.jpg'));
			reply = {
				type:'image',
				mediaId:data.media_id
			}
		//	var user = yield wechatApi.fetchUsers(message.FromUserName,'zh-CN');
		//	//console.log('******user**********');
		//	//console.log(user);
		//	var openIds = [
		//		{
		//			openid:message.FromUserName,
		//			lang:'en'
		//		}
		//	]
		//	var users = yield wechatApi.fetchUsers(openIds);
		//	console.log('******users**********');
		//	console.log(users);
		//	reply = JSON.stringify(user);
		}
		else if (content==='2') {
			reply = '第二项';
		}
		else if (content==='3') {
			reply = '第三项';
		}
		else if (content==='顺丰'||content==='天天'||content==='韵达'||content==='中通'||content==='圆通') {
			var pic='';
			if(content==='顺丰'){
				pic = 'http://d7.yihaodianimg.com/N05/M02/B8/B1/ChEbulTTAuGAPNhwAAC2knk3Fcg83300_360x360.jpg'
			}else if(content==='天天'){
				pic='http://pic3.58cdn.com.cn/p2/big/n_s12240046097467236076.jpg'
			}
			else if(content==='韵达'){
				pic='http://pic.qiantucdn.com/58pic/18/20/38/02G58PICWSs_1024.jpg'
			}
			else if(content==='中通'){
				pic='http://www.downhot.com/guanli/UploadFile/2016-1/20161259521182282.jpg'
			}
			else if(content==='圆通'){
				pic='http://a1423.phobos.apple.com/us/r1000/115/Purple/v4/fa/30/21/fa3021c4-b469-e369-37c5-8c5e031c618c/mzl.bsfxypfp.png'
			}
			var searchresult = yield mysql_api(content);
			console.log('searchresult[0]**********');
			console.log(searchresult[0]);
			//reply= 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx1d3765eb45497a18&redirect_uri=http://www.sunnyqingrixiaozi.cn:3001/listdetail?id='+ searchresult[i].id+'&response_type=code&scope=snsapi_base#wechat_redirect';
			if(searchresult && searchresult.length >0){
				var count = searchresult.length>5?5:searchresult.length;
				reply=[];

				for(var i = 0;i<searchresult.length;i++){
					var url = 'http://www.sunnyqingrixiaozi.cn:3001/listdetail?id='+ searchresult[i].id
					reply.push({
						//先看看住位置要不要取
						title:searchresult[i].address,
						description:searchresult[i].req_ID,
						picUrl:pic,
						url:'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx1d3765eb45497a18&redirect_uri='+url+'&response_type=code&scope=snsapi_base#wechat_redirect'
					});
				}
			}
			else if(searchresult.length===0){
				reply = '还木有'+content+'的信息';
			}
		}
		//else if (content==='5') {
		//	var data =yield wechatApi.uploadMaterial('image',path.join(__dirname,'../2.jpg'));
		//	reply = {
		//		type:'image',
		//		mediaId:data.media_id
		//	}
		//}
		//else if (content==='6') {
		//	var data =yield wechatApi.uploadMaterial('video',path.join(__dirname,'../2.mp4'));
		//	//这个怎么跑不出来
		//	reply = {
		//		type: 'video',
		//		title: '回复视频内容',
		//		description: '发送6,返回视频',
		//		mediaId: data.media_id
		//	}
		//}
		else{
			reply ='发发别的试试'
		}


		this.body = reply;

	}
	else if (message.MsgType==='image') {
		//var reply = yield faceapi(message.PicUrl,message.FromUserName);
		var reply =' 当前图片'+message.PicUrl;
		this.body = reply;

	}
	else if (message.MsgType==='voice'){
		var voiceText = message.Recognition;

		var voiceText = voiceText.match(/[^，。？!！]+(?=[，。？!！])/g);
		voiceText=voiceText+'';
		var vpic='';
		if(voiceText==='顺丰'){
			vpic = 'http://d7.yihaodianimg.com/N05/M02/B8/B1/ChEbulTTAuGAPNhwAAC2knk3Fcg83300_360x360.jpg'
		}else if(voiceText==='天天'){
			vpic='http://pic3.58cdn.com.cn/p2/big/n_s12240046097467236076.jpg'
		}
		else if(voiceText==='韵达'){
			vpic='http://pic.qiantucdn.com/58pic/18/20/38/02G58PICWSs_1024.jpg'
		}
		else if(voiceText==='中通'){
			vpic='http://www.downhot.com/guanli/UploadFile/2016-1/20161259521182282.jpg'
		}
		else if(voiceText==='圆通'){
			vpic='http://a1423.phobos.apple.com/us/r1000/115/Purple/v4/fa/30/21/fa3021c4-b469-e369-37c5-8c5e031c618c/mzl.bsfxypfp.png'
		}
		console.log('vpic****************'+vpic);
		var searchresult = yield mysql_api(voiceText);
		if(searchresult && searchresult.length >0){
			reply=[];
			for(var i = 0;i<searchresult.length;i++){
				var url = 'http://www.sunnyqingrixiaozi.cn:3001/listdetail?id='+ searchresult[i].id

				reply.push({
					//先看看住位置要不要取
					title:searchresult[i].address,
					description:searchresult[i].req_ID,
					picUrl:vpic,
					url:'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx1d3765eb45497a18&redirect_uri='+url+'&response_type=code&scope=snsapi_base#wechat_redirect'
				});
			}
		}
		else if(searchresult.length===0){
			reply = '还木有'+voiceText+'的信息';
		}
		this.body = reply;
	}
	else if (message.MsgType==='location') {
		this.body='我知道你在 '+ message.Label;
	}
	yield next;
}