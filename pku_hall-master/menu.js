/**
 * Created by lenovo on 2016/6/9.
 */

/*创建自定义菜单*/


var menu = {

    "button": [
        {
            "type": "view",
            "name": "百讲",
            "url": "http://www.pku-hall.com/"
        },
        {
            "type": "click",
            "name": "早知道",
            "key": "V1001_EARLY_KNOWN"
        }
    ]
};

/*更新自定义菜单接口*/
/*json.parse是从一个字符串中解析出json对象，stringify用于从一个对象中解析出字符串*/
var express = require('express');
var app = express();
var needle = require('needle');
var params = JSON.stringify(menu);
console.log(params);
var options = {};
var getToken = require('./lib/token').getToken;
//var fs = require('fs');
getToken().then(function (res) {
    var token = res.access_token;
//var ACCESS_TOKEN =JSON.parse(fs.readFileSync('token.dat')).access_token;//将所获得token.json文件中的access_token成功提取了
//console.log(ACCESS_TOKEN);
    var AGENTID = '59';
    var url = 'https://qyapi.weixin.qq.com/cgi-bin/menu/create?access_token=' + token + '&agentid=' + AGENTID;
    console.log(url);
    needle.post(url, params, options, function (err, res) {
        console.log("setmenu");
        console.log(res.body);
    });
});

/*监听菜单的点击事件*/


app.listen(3009);
console.log('Server running at port :3009');
//app.listen(3008);
//console.log('Server running at port : 3008');
