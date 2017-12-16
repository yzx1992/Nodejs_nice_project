var express = require('express')
var path = require('path');
var OAuth = require('wechat-oauth');
var socketio = require('socket.io');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var moment = require('moment');

var pool = mysql.createPool({
    connectionLimit: 10,
    user: 'root',
    password: 'qqqwww',
    database: 'ebuy'
});

var userInfo;
var mallList;
var resultList;
var partList;
var partstate;

var client = new OAuth('wx19ab18836dae3e63', '7216d38264c9ed9f6c36f161923db1c6');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/tolaunch', function (req, res) {
    var url = client.getAuthorizeURL('http://www.youchong912.cn/index', 'launch', 'snsapi_userinfo');
    res.redirect(url)
})

app.get('/toparticipant', function (req, res) {
    var url = client.getAuthorizeURL('http://www.youchong912.cn/index', 'participant', 'snsapi_userinfo');
    res.redirect(url)
})

app.get('/toresult', function (req, res) {
    var url = client.getAuthorizeURL('http://www.youchong912.cn/index', 'result', 'snsapi_userinfo');
    res.redirect(url)
})


app.get('/index', function (req, res) {
    var code = req.query.code;
    var state = req.query.state;
    client.getAccessToken(code, function (err, result) {
        var accessToken = result.data.access_token;
        var openid = result.data.openid;
        /*console.log('accessToken=',accessToken);
         console.log('openid=',openid);*/
        client.getUser(openid, function (err, result) {
            console.log(result.headimgurl);
            userInfo = {
                openid: openid,
                nickname: result.nickname,
                headUrl: result.headimgurl
            }

            var query = 'select * from User where Openid="' + openid + '"';
            pool.getConnection(function (err, connection) {
                connection.query(query, function (err, rows) {
                    if (err)
                        console.log("queryerr=", err);
                    else {
                        if (rows.length) {
                            if (state == 'launch')
                                res.redirect("/launch");
                            else if (state == 'participant')
                                res.redirect("/participant");
                            else
                                res.redirect("/result");
                        }
                        else {
                            res.redirect("/register");
                        }
                    }
                    connection.release();
                })
            })
        });

    });
})

app.get('/register', function (req, res) {
    res.sendFile(__dirname + '/views/register.html');
})

app.post('/register', function (req, res) {
    console.log(req.body.sid);
    console.log(req.body.weixin);
    console.log(req.body.tel);
    var openid = userInfo.openid;
    var sid = req.body.sid;
    var weixin = req.body.weixin;
    var tel = req.body.tel;
    var insert = 'insert into User(Openid,StudentId,Weixin,Tel) values("' + openid + '","' + sid + '","' + weixin + '","' + tel + '")';
    pool.getConnection(function (err, connection) {
        if (err)
            console.log('connecterr=', err);
        else {
            connection.query(insert, function (err, row) {
                if (err)
                    console.log("inserterr=", err);
                else {
                    console.log("success=", row);
                    res.redirect("/launch");
                }
                connection.release();
            })
        }
    })
})

app.get('/launch', function (req, res) {
    var query = "select * from Mall";
    pool.getConnection(function (err, connection) {
        if (err)
            console.log('connecterr=', err);
        else {
            connection.query(query, function (err, row) {
                if (err)
                    console.log("inserterr=", err);
                else {
                    mallList = [];
                    for (var i = 0; i < row.length; i++) {
                        console.log(row[i]["Id"]);
                        var m = {
                            id: row[i]["Id"],
                            name: row[i]["Name"],
                            url: row[i]["Url"]
                        }
                        mallList.push(m);
                    }
                }
                connection.release();
            })
        }
    })
    res.sendFile(__dirname + '/views/launch.html');
})

app.post('/launch', function (req, res) {
    var openid = userInfo.openid;
    var time = moment().format("YYYY-MM-DD HH:mm:ss")
    var mallid = req.body.mall;
    var details = req.body.details;
    var minprice = req.body.minprice;
    var maxprice = req.body.maxprice;
    var currprice = req.body.price;
    console.log(time);
    var insertOrder = 'insert into `Order`(Openid,`Time`,MallId,Details,MinPrice,MaxPrice,CurrPrice) values("' + openid + '","' + time + '",' + mallid + ',"' + details + '",' + minprice + ',' + maxprice + ',' + currprice + ')';
    pool.getConnection(function (err, connection) {
        if (err)
            console.log('connecterr=', err);
        else {
            connection.query(insertOrder, function (err, row) {
                if (err)
                    console.log("inserterr=", err);
                else {
                    var orderid = row["insertId"];
                    var insertPart = 'insert into Participant(Openid,OrderId,`Time`,Price) values("' + openid + '",' + orderid + ',"' + time + '",' + currprice + ')';
                    connection.query(insertPart, function (err, row) {
                        if (err)
                            console.log("inserterr=", err);
                        else {
                            res.redirect("/result");
                        }
                        connection.release();
                    })
                }
            })
        }
    })
})

app.get('/participant', function (req, res) {
    var queryorder = 'select * from `Order`';
    pool.getConnection(function (err, connection) {
        if (err)
            console.log('connecterr=', err);
        else {
            connection.query(queryorder, function (err, orow) {
                if (err)
                    console.log('connecterr=', err);
                else {
                    partList = [];
                    orow.forEach(function (eachrow) {
                        var openid = eachrow['Openid'];
                        if (userInfo.openid != openid) {
                            var minPrice = eachrow["MinPrice"];
                            var currPrice = eachrow["CurrPrice"];
                            if (currPrice < minPrice) {
                                var orderid = eachrow["Id"];
                                var createTime = eachrow["Time"];
                                var details = eachrow["Details"];
                                var maxPrice = eachrow["MaxPrice"];
                                var mallId=eachrow["MallId"];
                                var queryexit = 'select * from Participant where OrderId=' + orderid + ' and Openid="' + userInfo.openid + '"';
                                connection.query(queryexit, function (err, erow) {
                                    if (err)
                                        console.log('connecterr=', err);
                                    else {
                                        if (!erow.length) {
                                            var querymall = 'select * from Mall where Id="' + mallId + '"';
                                            connection.query(querymall, function (err, mrow) {
                                                if (err)
                                                    console.log("inserterr=", err);
                                                else {
                                                    var mall = mrow[0]["Name"];
                                                    var mallurl = mrow[0]["Url"];
                                                    var m = {
                                                        mall: mall,
                                                        mallurl: mallurl,
                                                        createtime: createTime,
                                                        minprice: minPrice,
                                                        maxprice: maxPrice,
                                                        currprice: currPrice,
                                                        details: details,
                                                        orderid: orderid
                                                    }
                                                    partList.push(m);
                                                }
                                            })
                                        }
                                    }
                                })
                            }

                        }
                    })
                    connection.release();
                }
            })
        }
    })
    res.sendFile(__dirname + '/views/participant.html');
})

app.post('/participant', function (req, res) {
    partstate=1;
    var orderid=req.body.orderid;
    var myprice=req.body.myprice;
    var time = moment().format("YYYY-MM-DD HH:mm:ss")
    var insertpart='insert into Participant(Openid,OrderId,`Time`,Price) values("'+userInfo.openid+'",'+orderid+',"'+time+'",'+myprice+')';
    pool.getConnection(function (err, connection) {
        if (err)
            console.log('connecterr=', err);
        else {
            connection.query(insertpart, function (err, prow) {
                if (err)
                    console.log("inserterr=", err);
                else {
                    var queryorder='select * from `Order` where Id="'+orderid+'"';
                    connection.query(queryorder,function (err, qrow) {
                        var currprice=qrow[0]["CurrPrice"];
                        var maxprice=qrow[0]["MaxPrice"];

                        if(currprice+myprice<=maxprice){
                            currprice=currprice+myprice;
                            var updatorder='update `Order` set CurrPrice='+currprice+' where Id="'+orderid+'"';
                            connection.query(updatorder,function (err, orow) {
                                if (err)
                                    console.log("inserterr=", err);
                                else {
                                    connection.release();
                                    res.redirect("/result");
                                }
                            })
                        }
                        else
                        {
                            partstate=0;
                            res.redirect("/result");
                        }
                    })
                }
            })
        }
    })
})

app.get('/result', function (req, res) {
    var queryPart = 'select * from Participant where Openid="' + userInfo.openid + '" order by `Time` desc';
    pool.getConnection(function (err, connection) {
        if (err)
            console.log('connecterr=', err);
        else {
            connection.query(queryPart, function (err, prow) {
                if (err)
                    console.log("inserterr=", err);
                else {
                    resultList = [];
                    prow.forEach(function (eachrow) {
                        var partTime = eachrow["Time"];
                        var myPrice = eachrow["Price"];
                        var popenid = eachrow["Openid"];
                        var queryorder = 'select * from `Order` where Id=' + eachrow["OrderId"];
                        connection.query(queryorder, function (err, orow) {
                            if (err)
                                console.log("inserterr=", err);
                            else {
                                var oopenid = orow[0]["Openid"];
                                var createTime = orow[0]["Time"];
                                var details = orow[0]["Details"];
                                var minPrice = orow[0]["MinPrice"];
                                var maxPrice = orow[0]["MaxPrice"];
                                var currPrice = orow[0]["CurrPrice"];
                                var orderid;
                                if (popenid == oopenid)
                                    orderid = orow[0]["Id"];
                                var state = '进行中';
                                if (currPrice > minPrice)
                                    state = '已完成';
                                var querymall = 'select * from Mall where Id="' + orow[0]["MallId"] + '"';
                                connection.query(querymall, function (err, mrow) {
                                    if (err)
                                        console.log("inserterr=", err);
                                    else {
                                        var mall = mrow[0]["Name"];
                                        var mallurl = mrow[0]["Url"];
                                        var m = {
                                            mall: mall,
                                            mallurl: mallurl,
                                            createtime: createTime,
                                            parttime: partTime,
                                            minprice: minPrice,
                                            maxprice: maxPrice,
                                            currprice: currPrice,
                                            myprice: myPrice,
                                            details: details,
                                            state: state,
                                            orderid: orderid
                                        }
                                        resultList.push(m);
                                    }
                                })
                            }
                        })
                    })
                    connection.release();

                }
            })
        }
    })
    res.sendFile(__dirname + '/views/result.html');
})

var server = app.listen(80, function () {
    console.log('web is running at port: 80...')
})


var io = socketio.listen(server);

io.sockets.on('connection', function (socket) {
    console.log('connected');
    socket.broadcast.emit('newClient', new Date());

    socket.on('getAllMessages', function () {
        socket.emit('allMessages', messages);
    });

    socket.on('addMessage', function (message) {
        messages.push(message);
        io.sockets.emit('newMessage', message);
    });

    socket.on('getUserInfo', function () {
        io.sockets.emit('userInfo', userInfo);
    })

    socket.on('getMallList', function () {
        io.sockets.emit('mallList', mallList);
    })

    socket.on('getResultList', function () {
        io.sockets.emit('resultList', resultList);
    })

    socket.on('getPartList', function () {
        io.sockets.emit('partList', partList);
    })

    socket.on('getPartstate', function () {
        io.sockets.emit('partstate', partstate);
    })
});