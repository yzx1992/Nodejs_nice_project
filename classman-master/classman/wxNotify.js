/**
 * Created by Nicholas_Wang on 2016/6/11.
 */
var getToken = require('./token').getToken;
var request = require('request');
function wxNotify(corpId, corpsecret, content, users) {
    return getToken(corpId, corpsecret).then(function (res) {
        var token = res.access_token;
        var tousers = '';
        for(var i in users){
            tousers = tousers + users[i].stu_id + '|';
        }
        tousers.substring(0, tousers.length-1);
        console.log('toUsers: ',tousers);
        var text = {
            "touser": tousers,
            "msgtype": "text",
            "agentid": 60,
            "text": {
                "content": content
            },
            "safe":"0"
        };
        var post_str = new Buffer(JSON.stringify(text));

        var options = {
            url: 'https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=' + token,
            method: 'POST',
            headers: {
                'Content-Type':'application/x-www-form-urlencoded',
                'Content-Length':post_str.length
            },
            body: post_str
        };
        request(options, function (err, response, body) {
            var info = JSON.parse(body);
            console.log('info: ',info);
        });

    });
}

module.exports = {wxNotify: wxNotify};