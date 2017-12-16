module.exports = {
    reply : function (req, res, next) {
        var replyObj = {
            topicID:   req.body.topicID ,
            content: req.body.replyContent ,
            replyUser:req.session.user
        }
        req.models.reply.create(replyObj).exec(function (err, replyObj) {
            var ret = {};
            if (!err){
                ret.retvalue = true;
                ret.reply = replyObj;
            }else{
                ret.retvalue = false;
            }
            res.end(JSON.stringify(ret));
        });
    }
}