var Waterline = require('waterline');

module.exports = Waterline.Collection.extend({
    identity : 'topic',
    connection : 'mongo',
    schema : true,
    attributes : {
        title : {
            type : 'string',
            required : true
        },
        content : {
            type : 'string',
            required : true
        },
        author:{
            type:'json'
        },
        //author : {
        //    openid:'string',//用户唯一标识
        //    nickname: 'string',
        //    headimgurl:'string'
        //},
        joined:'string',
        author_openid:'string',
        tag : {
            type : 'string',
        },
        joined:'array',
        last_reply_at : 'string',
        reply_count :'number',
        hot:'boolean',
        top:'boolean',
        //createTime : 'date',
        join:'array'
    },
    //beforeCreate : function(v,cb){
    //    v.createTime = new Date();
    //    return cb();
    //}
});