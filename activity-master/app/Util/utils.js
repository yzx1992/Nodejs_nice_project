var request = require('request');
var config = require('../../config/config');
var http = require('http');
var https = require('https');
module.exports = {
    "userInfo": function (req,res,next) {
        if (req.query.code !== undefined){
            //url中code不为空
            var code = req.query.code;
            req.session.usercode = code;
            getAccess_token(req,res,code,next);
        }
        next();
    },
    //一个求帖子参与人数的方法
    "countJoin": function (req,topicID) {
        return new Promise(function (resolve, reject) {
            req.models.join.find({where:{topicID:topicID}}).exec(function (err, joins) {
                //console.log(topicID);
                //console.log(joins.length);
                resolve(joins.length);
            })
        })
    }
}
/**
 * 利用redirect_url中code获取用户信息的方法
 * 本来想写成promise方法,最后不知道为什么又写成了callback...
 *
 * */
var getAccess_token = function (req,res,code,next) {
    var oauth2Url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid="+config.appid+"&secret="+config.appSecret+"&code="+code+"&grant_type=authorization_code";
    request(oauth2Url, function (err, response, body) {
        if(!err && response.statusCode==200){
            var oauth2Obj = JSON.parse(body);
            var userinfoUrl = "https://api.weixin.qq.com/sns/userinfo?access_token="+oauth2Obj.access_token+"&openid="+oauth2Obj.openid;
            request(userinfoUrl, function (err, response, body) {
                if (!err&&response.statusCode == 200){
                    var userInfoObj = JSON.parse(body);
                    //转换头像url
                    if (userInfoObj.headimgurl != undefined){
                        userInfoObj.headimgurl = userInfoObj.headimgurl.slice(0,userInfoObj.headimgurl.length-1)+config.headImgSize;
                    }
                    userInfoObj.usercode = code;
                    req.models.user.findOne()
                        .where({openid:userInfoObj.openid}).exec(function (err, user) {
                        //用户在数据库中存在
                        if (!err){
                            //if (!req.session.user){
                                //把用户信息放入session中
                            req.session.user = userInfoObj;
                            console.log(code+"  放session========"+JSON.stringify(req.session));//JSON.stringify(userInfoObj));

                            //}
                            if (user){
                                //如果用户已经存在,更新用户信息
                                req.models.user.update({openid:userInfoObj.openid},userInfoObj, function (err,result) {
                                    if (!err){
                                        console.log("更新成功!"+userInfoObj.openid);
                                    }else{
                                        console.log("更新失败!"+userInfoObj.openid);
                                    }
                                });
                            }else{
                                //用户不存在,创建新用户
                                req.models.user.create(userInfoObj, function (err, user) {
                                    if (!err){
                                        console.log("用户:"+user.nickname+"保存成功!");
                                    }else{
                                        console.log("用户信息保存失败:"+err);
                                    }
                                });
                            }
                            //next();
                        }else{
                            console.log("query error! openid="+userInfoObj.openid);
                            //next();
                        }
                    });
                }else{
                    //第二个请求出错
                    console.log("第二个请求next");
                    //next();
                }
            });
        }else{
            console.log("第一个请求next");
            //第一个请求出错
            //next();
        }
    });
}