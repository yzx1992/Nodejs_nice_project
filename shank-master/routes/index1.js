var wechatcrypto = require('wechat-crypto');

var corpID = 'wx1d3765eb45497a18';
var corpsecret = '5sMm2O7RHsf1kafjDp9qMBfNYQOT8t4P7hCJtBhwaHgvlkvHiFr1BLq2avaHImJs';
var AESkey = 'sqm5QTfFYkfGlauuuEFf99mTpmK2yXSx72CI4PluiRW';
var token = 'weixin';
var asses_token = '';
var access_token = '';

var http = require('http');
var qs = require('qs');
var later = require('later');
var request = require('request');
var https = require('https');

var replyText = require('./reply').replyText;
var replyCrypto = require('./reply').replyCrypto;

var cryptor = new wechatcrypto(token, AESkey, corpID);
var numbers = 0;
var flag = 0;
var flag1 = 0;
var flag2 = 0;
var userid = new Array();
for(i=0;i<20;i++){
    userid[i]=0;
};
var storeDelNumber = new Array();
var delNumber = 0;
//var amount = numbers-1;
var severe = http.createServer(function (request, response) {
    var query = require('url').parse(request.url).query;
    var params = qs.parse(query);
    //console.log(params);

    //var cryptoMsg= cryptor.decrypt(params.echostr);
    //console.log(cryptoMsg);
    var postdata = '';
    request.addListener('data', function (postchunk) {
        postdata += postchunk;
    });
    request.addListener('end', function () {
        var parseString = require('xml2js').parseString;
        parseString(postdata, function (err, result) {

            var msg = cryptor.decrypt(result.xml.Encrypt[0]);
           // console.log('msg' + msg);

            parseString(msg.message, function (err, result) {
	if(result.xml.EventKey){
                if (result.xml.EventKey[0]== 'yuyue') {
                    console.log('result'+result.xml);           
                    for (var i = 0;i < userid.length;i++){
		    console.log('userid[' + i +'] = ' + userid[i]);
                    if (userid[i] != result.xml.FromUserName[0]){
		   // console.log('username = ' + result.xml.FromUserName[0]);
                   // var ress = replyText(result,'你已预约过，不能重复预约！');
                    continue;
                    }else{
                    
                    var ress = replyText(result,'你已预约，不能重复预约！');
		    flag = 1;
		    break;
                    }
		}
                    if(flag != 1){
			if( numbers>20 ) var ress = replyText(result,'预约人数已超过20人，不能预约');
			else if(storeDelNumber.length>0){
				numbers++;
				var toNumber = storeDelNumber.shift();
				console.log('toNumber:'+toNumber);
				userid[toNumber-1] = result.xml.FromUserName[0];
                                var ress = replyText(result,'******预约成功!*****\n'+
                                                            '******预约凭证******\n'+
                                                            '预约号：'+toNumber+'\n'+
                                                            '用户名：'+result.xml.FromUserName[0]+'\n'+
                                                            '***请于开车前上车***\n'+
                                                            '********************\n'
                                                    );
			}
	                else{
                    numbers++; 
                    var ress= replyText(result,'******预约成功!*****\n'+
                                                '******预约凭证******\n'+
                                                '预约号：'+numbers+'\n'+
                                                '用户名：'+result.xml.FromUserName[0]+'\n'+
                                                '***请于开车前上车***\n'+
                                                '********************\n'
                                                    );
                    userid[numbers-1]=result.xml.FromUserName[0];
		    console.log('userid'+userid[numbers-1]);
                    console.log('ress:' + ress);
		    
                    }
		}flag = 0;
                   // numbers++;
                   
                
                }
               else if (result.xml.EventKey[0]== 'pingzheng'){
                    
                    for (var i = 0;i < userid.length;i++){
                    if (userid[i] != result.xml.FromUserName[0])
                      continue;
                    else
                    {
                    var ress = replyText(result,'******预约成功!*****\n'+
                                             '******预约凭证******\n'+
                                             '预约号：'+(i+1)+'\n'+
                                             '用户名：'+userid[i]+'\n'+
                                             '***请于开车前上车***\n'+
                                             '********************\n'
                                             );
                    console.log('ress:' + ress);
                    flag2 = 1;
                    }
                  }
                  if (flag2 != 1)
                 var ress = replyText(result,'你还未预约，请先预约！');
                 flag2 = 0;         
              }
                else if (result.xml.EventKey[0]== 'cancel'){
              
                    for (var i = 0;i < userid.length;i++){
                    if (userid[i] != result.xml.FromUserName[0])
                      continue;
                    else
                    {
                    flag1 = 1;
                    numbers--;
                    userid[i] = 0;
                    delNumber = i;
                    storeDelNumber.push(i+1);
                    var ress = replyText(result,'取消预约成功！');
                    console.log('ress:' + ress);
                    break;
                    }
                    
                  } 
                 // console.log();
                  if (flag1 != 1)
                  {
                  var ress = replyText(result,'你未预约，不能取消！');
                  }
                  console.log('ress111111:'+ress);
                  flag1 = 0;
                  console.log('ress2:'+ress);
                }
                else if (result.xml.EventKey[0]== 'renshu'){
                    if ( numbers > 20 )
                    var ress = replyText(result,'你好！当前预约校车人数超过20人，预约已满！');
                    else{  
                    var ress = replyText(result,'你好！当前预约校车人数为'+numbers);
                    console.log('ress:' + ress);
                    }             
                }
                else if (result.xml.EventKey[0]== 'anpai'){
                    var ress = replyText(result,'行车安排如下：\n'+
                                                '北大（中关村）---学院（大兴）发车时间:\n'+
                                                '早上7:20、中午13:00\n'+
                                                '乘车地点：北京大学理教西侧学院\n'+
                                                '学院（大兴）---北大（中关村）发车时间:\n'+
                                                '中午11:40、下午17:10\n'+
                                                '乘车地点：软微学院研发楼北侧\n'+
                                                '提示：学生需排队，待老师上车后，学生依次上车。'
                                                 );
                    console.log('ress:' + ress);
                }
                else {
                   // var ress = replyText(result,'欢迎使用Shank约车应用！');
                    var ress = replyText(result,'******使用指南******\n'+
                                       '欢迎使用Shank约车应用~\n'+
                                       '有些话我们想告诉你~^_^\n'+
                                       '1、座位有20个，超过不能预约。\n'+
                                       '2、一个用户不能重复预约。\n'+
                                       '3、用户可以取消预约。\n'+
                                       '4、了解更多按钮里可以查看行车安排和北大新闻。');

                    console.log('欢迎使用Shank约车应用！');
                }
	}
        else {
            var ress = replyText(result,'******使用指南******\n'+
				       '欢迎使用Shank约车应用~\n'+
				       '有些话我们想告诉你~^_^\n'+
                                       '1、座位有20个，超过不能预约。\n'+
                                       '2、一个用户不能重复预约。\n'+
                                       '3、用户可以取消预约。\n'+
                                       '4、了解更多按钮里可以查看行车安排和北大新闻。');
        }
                    var encryptMsg = cryptor.encrypt(ress);
                   // console.log('encryptMsg:', encryptMsg);

                    var MsgSignature = cryptor.getSignature(params.timestamp, params.nonce, encryptMsg);
                   // console.log('MsgSignature:' + MsgSignature);
                   // console.log(params.timestamp);
                   // console.log(params.nonce);
                    var feedbackMsg = replyCrypto(encryptMsg, params, MsgSignature);
                   // console.log('feedbackMsg:' + feedbackMsg);

                    response.end(feedbackMsg);
              })

        });

    });
});


later.date.localTime();
var sched = later.parse.recur().every(2).hour();
later.setInterval(getToken(corpID, corpsecret), sched);
function getToken(corpID, corpsecret) {
    request('https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=' + corpID + '&corpsecret=' + corpsecret, function (err, res, data) {
        asses_token = JSON.parse(data);
        access_token = asses_token.access_token;
        console.log(asses_token);
    });
    console.log('1');
}
//setTimeout(getToken(corpID, corpsecret));

var menu = {
    "button": [
        {
            "name": "校车预约",
            "sub_button": [
                {
                    "type": "click",
                    "name": "预约校车",
                    "key": "yuyue"
                },
                {
                    "type": "click",
                    "name": "取消预约",
                    "key": "cancel"
                } ,
                {
                    "type": "click",
                    "name": "预约凭证",
                    "key": "pingzheng"
                }
            ]
        },
        {
            "type": "click",
            "name": "当前人数",
            "key": "renshu"
        },
        {
            "name": "了解更多",
            "sub_button": [
                {
                    "type": "click",
                    "name": "行车安排",
                    "key": "anpai"
                },
                {
                    "type": "view",
                    "name": "关于北大",
                    "key" : "aboutPKU",
                    "url": "http://www.pku.edu.cn"
                }
            ]
        }
    ]
};
var post_str = new Buffer(JSON.stringify(menu));
var post_options = {
    host: 'qyapi.weixin.qq.com',
    port: '443',
    path: '/cgi-bin/menu/create?access_token=iuXP9ZwzSjPXJOKriTOpoLC5GwjfTs-6ImuF4cKg7GU9logpogzOVBFGMzo7KU-i&agentid=55',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': post_str.length
    }
};
var post_req = https.request(post_options, function (response) {
    var responseText = [];
    var size = 0;
    response.setEncoding('utf8');
    console.log(access_token);
    response.on('data', function (data) {
        responseText.push(data);
        size += data.length;
    });
    response.on('end', function () {
        console.log(responseText);
    });
});
post_req.write(post_str);
post_req.end();

severe.listen(4000, function () {
    console.log("listen 4000");
});
