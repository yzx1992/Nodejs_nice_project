var waterline = require('waterline');

module.exports = waterline.Collection.extend({
    identity : 'join',
    connection : 'mongo',
    schema : true,
    attributes : {
        topicID:'string',
        user_openid:'string',
        user:'json'
    }
});