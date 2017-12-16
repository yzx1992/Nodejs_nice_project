var Waterline = require('waterline');

module.exports = Waterline.Collection.extend({
    identity : 'tag',
    connection : 'mongo',
    schema : true,
    attributes : {
        tag : 'string'
    }
});