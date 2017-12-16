var Waterline = require('waterline');
var mongoAdapt = require('sails-mongo');
var config = require('./config');
var topic = require('../app/Model/topic');
var tag = require('../app/Model/tag');
var reply = require('../app/Model/reply');
var user = require('../app/Model/user');
var join = require('../app/Model/join');
var orm = new Waterline();
var wlconfig = {
    adapters:{
        default:mongoAdapt,
        mongo:mongoAdapt
    },
    connections:{
        'mongo':{
            adapter:'mongo',
            url:config.mongoURI
        }
    }
}

orm.loadCollection(tag);
orm.loadCollection(topic);
orm.loadCollection(reply);
orm.loadCollection(user);
orm.loadCollection(join);
exports.orm = orm;
exports.config = wlconfig;