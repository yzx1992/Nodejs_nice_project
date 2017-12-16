module.exports = {
    user : function (req, res, next) {
        var ret = {};
        console.log(JSON.stringify(req.session)+"==========");
        req.models.user.findOne({where:{usercode:req.session.usercode}}).exec(function (err,user) {
            if (!err) {
                if (user != undefined){
                    console.log("controller/user.js取值成功");
                }
                req.session.user = user;
                ret.retvalue = true;
                ret.user = user;
            }else{
                console.log("controller/user.js出错");
                ret.retvalue = false;
            }
            res.end(JSON.stringify(ret));
        });
    //    console.log("取值session :"+JSON.stringify(req.session));
    //    ret.user = {
    //        "_id": {
    //            "$oid": "57578825254b6cc54a154492"
    //        },
    //        "openid": "oLRLgvlz8TBFGD6FvzKBxn9mNn_I",
    //        "nickname": "kev",
    //        "sex": "1",
    //        "city": "",
    //        "province": "Shanghai",
    //        "country": "CN",
    //        "headimgurl": "http://wx.qlogo.cn/mmopen/7JYu0VpqZgD1OrcKcw2aD8uNGiaNNzQYOrFlxsUoEt3yYEnvgj6h3qT239dnwT8517hs4es0LI4ytAGFpUQNwdLf96vKNRv8v/132",
    //        "createdAt": {
    //            "$date": "2016-06-08T02:51:17.515Z"
    //        },
    //        "updatedAt": {
    //            "$date": "2016-06-08T02:51:17.515Z"
    //        }
    //    };
    //
    //    res.end(JSON.stringify(ret));
    }
}