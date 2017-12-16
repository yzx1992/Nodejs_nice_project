var Waterline = require('waterline');

module.exports = Waterline.Collection.extend({
    identity : 'user',
    connection : 'mongo',
    schema : true,
    attributes : {
        usercode:'string',
        openid:'string',//用户唯一标识
        nickname: 'string',
        sex:'string',
        province:'string',
        city:'string',
        country:'string',
        headimgurl:'string',
        unionid: 'string',//只有在用户将公众号绑定到微信开放平台帐号后才会出现该字段
        privilege:'array'
    }
});