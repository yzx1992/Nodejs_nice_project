var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var Filter = require('bad-words-chinese'),
    filter = new Filter();

mongoose.connect('mongodb://localhost/messagewall');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("connected.");
});

var UserSchema = new mongoose.Schema({
    name: String,
    id: String,
    lastsend: Date,
    liked: [],
    regTime: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        expires: 3600 * 24 * 30
    }
}, {
    collection: 'UserInfo'
});
var User = mongoose.model('User', UserSchema);

var MemorySchema = new mongoose.Schema({
    text: String,
    name: String,
    color: Number,
    likes: Number,
    rates: Number,
    pubTime: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'Memories'
});
var Memory = mongoose.model('Memory', MemorySchema);

/* Add Express Middlewares */

/* Serve Static Files */
app.use(express.static(__dirname + '/public'));

/* Parse Post Requests */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/* Cookie Handle */
app.use(cookieParser());
app.use(session({
    secret: 'message wall',
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: false,
        maxAge: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
}));

/* Start server */
app.listen(8080);

/* Create Session for User Info */
app.use('/leaf/*', function(req, res, next) {
    if (req.session && req.session.userid) {
        req.body.ifnew = false;
    } else {
        var newUser = new User({
            name: "",
            id: "",
            lastsend: 0,
            liked: []
        });
        newUser.save(function(error) {
            if (error) {

            } else {
                req.session.userid = newUser._id;
                req.ifnew = true;
            }
        });
    }
    next();
});

/* Check if New Visitor */
app.post('/ifnew', function(req, res) {
    var ifnew;
    if (req.session && req.session.userid) {
        ifnew = false;
    } else {
        ifnew = true;
    }
    var data = {
        "action": "ifnewuser",
        "success": true,
        "message": "",
        "params": {
            "ifnew": ifnew
        }
    };
    return res.json(data);
});

/* Get Messages */
app.post('/leaf/get', function(req, res) {
    var start = req.body.start;
    var count = req.body.count;
    Memory.find({}, null, {
            skip: start,
            limit: count,
            sort: {
                rates: -1
            }
        },
        function(error, memories) {
            var success = false;
            var message = "";
            var liked = [];
            if (error) {
                console.log(error);
                message = error;
                var data = {
                    "action": "addnew",
                    "success": success,
                    "message": message,
                    "params": {
                        "memories": memories,
                        "liked": liked
                    }
                };
                return res.json(data);
            } else {
                success = true;
                User.findOne({
                    _id: req.session.userid
                }, function(error, user) {
                    memories.forEach(function(value) {
                        if (user.liked.indexOf(value._id) !== -1) {
                            liked.push(1);
                        } else {
                            liked.push(0);
                        }
                    });
                    var data = {
                        "action": "addnew",
                        "success": success,
                        "message": message,
                        "params": {
                            "memories": memories,
                            "liked": liked
                        }
                    };
                    return res.json(data);
                });
            }
        });
});

/* Add New Message */
app.post('/leaf/add', function(req, res) {
    if (filter.isProfane(req.body.text) || filter.isProfane(req.body.name)) {
        var data = {
            "action": "addnew",
            "success": false,
            "message": "BAD WORDS",
            "params": {}
        };
        return res.json(data);
    } else {
        User.findOne({
            _id: req.session.userid
        }, function(error, user) {
            if (Date.now() - user.lastsend < 3600000) {
                var data = {
                    "action": "addnew",
                    "success": false,
                    "message": "SEND LIMIT",
                    "params": {}
                };
                return res.json(data);
            } else {
                user.lastsend = Date.now();
                user.save();
                Memory.count({}, function(error, count) {
                    var newMemory = new Memory({
                        text: req.body.text,
                        name: req.body.name,
                        color: req.body.color,
                        likes: 0,
                        rates: count
                    });
                    newMemory.save(function(error) {
                        var success = false;
                        var message = "";
                        if (error) {
                            console.log(error);
                            message = error;
                        } else {
                            success = true;
                        }
                        var data = {
                            "action": "addnew",
                            "success": success,
                            "message": message,
                            "params": {
                                "id": newMemory._id
                            }
                        };
                        return res.json(data);
                    });
                })
            }
        });
    }
});

/* Like a Message */
app.post('/leaf/like', function(req, res) {
    Memory.count({}, function(error, count) {
        var uid = req.body.uid;
        Memory.findOne({
            _id: uid
        }, function(error, memory) {
            console.log(memory);
            memory.rates += count / 5;
            memory.save();
            User.findOne({
                _id: req.session.userid
            }, function(error, user) {
                var success = false;
                var message = "";
                if (error) {
                    console.log(error);
                    message = error;
                } else {
                    success = true;
                    user.liked.push(uid);
                    user.save();
                }
                var data = {
                    "action": "leaflike",
                    "success": success,
                    "message": message,
                    "params": {
                        "id": uid
                    }
                };
                return res.json(data);
            });
        });
    })
});

/* Delete All Leaves and User Info */
app.get('/deleteall', function(req, res) {
    User.remove({}, function(error, doc) {
    });
    Memory.remove({}, function(error, doc) {
    });
});