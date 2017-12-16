/**
 * Created by Nicholas_Wang on 2016/5/22.
 */
var Waterline = require('waterline');
var moment = require('moment');

var database = 'mysql';

// 学生信息
var User = Waterline.Collection.extend({
    identity: 'user',
    connection: database,
    scheme: true,
    attributes: {
        stu_id: { // 学号
            type: 'integer',
            required: true
        },
        stu_class_id: {
            type: 'string'
        },
        stu_name: {
            type: 'string',
            required: true
        },
        stu_password: {
            type: 'string',
            required: true
        },
        stu_sex: {
            type: 'string'
        },
        stu_age: {
            type: 'integer'
        },
        stu_major: {type: 'string'}, //专业及方向
        stu_phone: {type: 'string'},
        stu_email: {type: 'string'},
        stu_wx: {type: 'string'}, //weixin
        stu_qq: {type: 'string'},
        stu_room: {type: 'string'},
        stu_status: {type: 'integer'}, //1党员，2预备，3积极分子，4群众
        stu_birthday: {
            type: 'string'
        },
        stu_role: {type: 'integer'} //1苑长，2支书，3苑委，4支委，5同学
    },
    migrate: 'safe',
    autoCreatedAt: false,
    autoUpdatedAt: false
});

// 通知信息
var Notice = Waterline.Collection.extend({
    identity: 'notice',
    connection: database,
    scheme: true,
    attributes: {
        notice_name: {type: 'string'},
        notice_type: {type: 'integer'}, //1苑2支部
        notice_content: {type: 'text'},
        notice_visual: {type: 'text'},
        notice_time: {
            type: 'string',
            defaultsTo: moment(Date.now()).locale('zh-cn').format('LL HH:mm:ss')
        },
        notice_from: { // 发布者
            type: 'string'
        },
        class_id: {type:'string'}
    },
    migrate: 'safe',
    autoCreatedAt: false,
    autoUpdatedAt: false
});

var Activity = Waterline.Collection.extend({
    identity: 'activity',
    connection: database,
    scheme: true,
    attributes: {
        activity_name:{type:'string', required: true},
        activity_type:{type:'integer', required: true},
        activity_time:{
            type: 'string'
        },
        activity_location:{type:'string'},
        activity_description:{type:'text'},
        activity_pay:{type:'float'},
        activity_dur:{type:'string'},
        activity_from:{type:'string'},
        activity_post_time:{
            type:'string',
            defaultsTo: moment(Date.now()).locale('zh-cn').format('LL HH:mm:ss')
        },
        class_id: {type:'string'}
    },
    migrate: 'safe',
    autoCreatedAt: false,
    autoUpdatedAt: false
});

var File = Waterline.Collection.extend({
    identity: 'file',
    connection: database,
    scheme: true,
    attributes: {
        file_name: {type:'string', required: true},
        file_path: {type:'string', required: true},
        file_from: {type:'string', required: true},
        file_time: {
            type:'string',
            required: true,
            defaultsTo: moment(Date.now()).locale('zh-cn').format('LL HH:mm:ss')
        },
        class_id: {type:'string'}
        //file_parent_id:
    },
    migrate: 'safe',
    autoCreatedAt: false,
    autoUpdatedAt: false
});

var Advice = Waterline.Collection.extend({
    identity: 'advice',
    connection: database,
    scheme: true,
    attributes: {
        advice_topic: {type:'string'},
        advice_content: {type: 'text'},
        advice_time: {
            type: 'string',
            defaultsTo: moment(Date.now()).locale('zh-cn').format('LL HH:mm:ss')
        },
        advice_from: {type: 'string'},
        class_id: {type:'string'}
    },
    migrate: 'safe',
    autoCreatedAt: false,
    autoUpdatedAt: false
});


exports.User = User;
exports.Notice = Notice;
exports.Activity = Activity;
exports.File = File;
exports.Advice = Advice;