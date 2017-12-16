var util = require('../Util/utils');
module.exports = {
    get : function (req, res, next) {
        var topicID = req.params.id;
        //var userID = req.session.user.openid;
        var userID = "oLRLgvlz8TBFGD6FvzKBxn9mNn_I";
        var ret = {};
        req.models.topic.findOne({where:{id:topicID}}).exec(function (err, topic) {
            if (!err){
                req.models.join.find({where:{topicID:topicID}}).exec(function (err, join) {
                    if (!err){
                        req.models.reply.find({where:{topicID:topicID}}).exec(function (err, replys) {
                            if (!err){//,user_openid:userID
                                req.models.join.find({where:{topicID:topicID}}).exec(function (err,joins) {
                                    if (!err){
                                        req.models.join.findOne({where:{topicID:topicID,user_openid:userID}}).exec(function (err, me) {
                                            if (!err){
                                                if (me){
                                                    ret.isJoin = true;
                                                }else{
                                                    ret.isJoin = false;
                                                }
                                                //console.log(""+JSON.stringify(join)+"23423423423");
                                                //console.log("----------"+JSON.stringify(joins));
                                                ret.join = join;
                                                ret.retvalue = true;
                                                ret.topic = topic;
                                                ret.replys = replys;
                                                //console.log("1-1-1-1-1-1-"+JSON.stringify(ret));
                                                res.end(JSON.stringify(ret));
                                            }
                                        });
                                    }else{
                                        ret.retvalue = false;
                                        res.end(JSON.stringify(ret));
                                    }
                                });
                            }else{
                                ret.retvalue = false;
                                res.end(JSON.stringify(ret));
                            }
                        });
                    }
                });
            }
        });
    },
    put : function (req, res, next) {

    },
    delete : function (req, res, next) {

    },
    post : function (req, res, next) {
        var openid = req.body.openid.replace(/\\/g,"")+"";
        var ret = {}
        var topicObj = {
            title:req.body.title,
            content:req.body.content,
            author_openid :req.body.openid
        }
        req.models.user.findOne({openid:req.body.openid}).exec(function (err, user) {
            if (!err){
                console.log(JSON.stringify(user)+"================find user");
                //var saveUser = {
                //    openid:user.openid,//用户唯一标识
                //    nickname: user.nickname,
                //    headimgurl:user.headimgurl
                //}
                topicObj.author = JSON.stringify(user);
                console.log(JSON.stringify(topicObj)+"=======topicobj")
                req.models.topic.create(topicObj).exec(function (err, topic) {
                    if (!err){
                        ret.retvalue = true;
                        ret.topic = topic;
                    }else{
                        ret.retvalue = false;
                        ret.topic = err;
                    }
                    res.end(JSON.stringify(ret));
                });
            }
        });
    },
    topics: function (req, res, next) {
        var type = req.query.type;
        switch(type)
        {
            case 'all':
                req.models.topic.find().exec(function (err, topics) {
                    var ret = {};
                    if (!err){
                        ret.retvalue = true;
                        ret.topics = JSON.stringify(topics);
                        console.log(JSON.stringify(ret)+"===========");
                        res.end(JSON.stringify(ret));
                    }else{
                        ret.retvalue = false;
                        res.end(JSON.stringify(ret));
                    }
                });
                break;
            case 'hot':
                req.models.topic.find().where({hot:true}).exec(function (err, topics) {
                    var ret = {};
                    if (!err){
                        ret.retvalue = true;
                        ret.topics = JSON.stringify(topics);
                    }else{
                        ret.retvalue = false;
                    }
                    res.end(JSON.stringify(ret));
                });
                break;
            case 'my':
                req.models.topic.find().where({author_openid:req.session.user.openid}).exec(function (err, topics) {
                    console.log(JSON.stringify(topics));
                    var ret ={};
                    if (!err){
                        ret.retvalue = true;
                        ret.topics = JSON.stringify(topics);
                    }else {
                        ret.retvalue = false;
                    }
                    res.end(JSON.stringify(ret));
                });
                break;
            case 'join':
                //req.models.
                break;
        }
    },
    join : function (req, res, next) {
        var ret = {};
        var user = req.session.user;
        var joinObj = {
            topicID:req.body.topicID,
            user_openid:user.openid,
            user:req.session.user
        };
        req.models.join.create(joinObj).exec(function (err, join) {
            if (!err){
                req.models.join.find({where:{topicID:req.body.topicID}}).exec(function(err,joins){
                    ret.retvalue = true;
                    ret.join = joins;
                    ret.isJoin = true;
                    //console.log("join---=-=-=-=-="+JSON.stringify(ret.join));
                    res.end(JSON.stringify(ret));
                });
            }else{
                ret.retvalue = false;
                res.end(JSON.stringify(ret));
            }
        });
    },
    cancelJoin : function (req, res, next) {
        var ret = {};
        var user_openid = req.session.user.openid;
        var topicID =  req.body.topicID;
            //topicID:'string',
            //user_openid:'string',
        req.models.join.destroy({where:{topicID:topicID,user_openid:user_openid}}).exec(function (err, result) {
            if (!err){
                req.models.join.find({where:{topicID:topicID}}).exec(function (err, joins) {
                    if (!err){
                        ret.retvalue = true;
                        ret.join = joins;
                        ret.isJoin = false;
                        //console.log("canceljoin---=-=-=-=-="+JSON.stringify(ret.join));
                        res.end(JSON.stringify(ret));
                    }else{
                        ret.retvalue = false;
                        res.end(JSON.stringify(ret));
                    }
                })
            }else{
                ret.retvalue = false;
                res.end(JSON.stringify(ret));
            }
        })
    }
}