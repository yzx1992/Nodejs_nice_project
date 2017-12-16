var waterline = require('waterline');

module.exports = waterline.Collection.extend({
    identity : 'reply',
    connection : 'mongo',
    schema : true,
    attributes : {
        topicID:   'string' ,
        content: 'string' ,
        replyUser:'json',
        ups:'integer'
    }
});