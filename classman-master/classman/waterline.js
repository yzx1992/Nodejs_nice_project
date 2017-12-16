/**
 * Created by Nicholas_Wang on 2016/5/22.
 */
var Waterline = require('waterline');
var mysqlAdapter = require('sails-mysql');
var mongoAdapter = require('sails-mongo');
var models = require('./models/models');

var adapters = {
    mongo: mongoAdapter,
    mysql: mysqlAdapter,
    default: 'mysql'
};

var connections = {
    mongo: {
        adapter: 'mongo',
        url: 'mongodb://localhost/classman'
     },
    mysql: {
        adapter: 'mysql',
        url: 'mysql://classman:12345@localhost/classman'
    }
};

var wlconfig = {
    adapters: adapters,
    connections: connections
};

var orm = new Waterline();
orm.loadCollection(models.User);
orm.loadCollection(models.Notice);
orm.loadCollection(models.Activity);
orm.loadCollection(models.File);
orm.loadCollection(models.Advice);

exports.wlconfig = wlconfig;
exports.orm = orm;