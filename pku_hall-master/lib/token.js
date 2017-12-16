/**
 * Created by lenovo on 2016/6/6.
 */
/**
 这个模块用来获得有效token
 使用：
 var appID = require('./config').appID,
 appSecret = require('./config').appSecret;
 getToken(appID, appSecret).then(function(token){
      console.log(token);
    });
 */

var request = require('request');
var fs = require('fs');



function getToken( ){

    return new Promise(function(resolve, reject){
        var token;

        //先看是否有token缓存，这里选择用文件缓存，可以用其他的持久存储作为缓存
        if(fs.existsSync('token.dat')){
            token = JSON.parse(fs.readFileSync('token.dat'));
            console.log(token);
        }

        //如果没有缓存或者过期
        if(!token || token.timeout < Date.now()){
            var   corpid = 'wx1d3765eb45497a18';
                var corpsecret='mB-0gvh-5Nj08AWBt5rGSTlzd1aQZCYs78k7ak2Nba0f6LOdpK8eT2wv6XZHDH2s';
           
            request('https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid='+corpid+'&corpsecret='+corpsecret,function(err, res, data){
	        var result = JSON.parse(data);
                result.timeout = Date.now() + 7000000;
                //更新token并缓存

                //所以差不多缓存7000秒左右肯定是够了
                fs.writeFileSync('token.dat', JSON.stringify(result));
                resolve(result);
                console.log(result);
            });
        }else{
            resolve(token);
            console.log("haha");
            console.log(token);
        }
    }
    )
}


module.exports = {getToken: getToken};
