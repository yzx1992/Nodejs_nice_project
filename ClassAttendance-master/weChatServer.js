/**
 * Created by Mackenzie on 2016/6/11.
 */
var express = require('express'),
    app = express();
var url = require('url');
var qs = require('qs');
var http = require('http');
//引入微信后台与我的服务器建立连接的签名机制
var checkSignature=require('./checkSign');
//获取一个用户的信息
var getUserInfo = require('./getuser').getUserInfo;
//引入返回结果的代码
//var insideRouter = require('./newRouter').insideRouter;
var replyText = require('./reply').replyText;
var realTeacher = require('./dbRouter').realTeacher;

var addJsonFile= require('./writeFile').addJsonFile;
//var checkMethod = require('./beginCallBack').checkMethod;
//var reply = require('./beginCallBack').reply;
//此端口用户微信后台连接我的服务器
//服务器端对于微信端传来各种类型消息的处理
var mysql = require('mysql');
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'finaltest',
    port: 3306
});

var server = http.createServer(function (request, response) {

    //解析URL中的query部分，用qs模块(npm install qs)将query解析成json
    var query = require('url').parse(request.url).query;
    var params = qs.parse(query);
    if(!checkSignature(params, 'lyMackenzie')){
        //如果签名不对，结束请求并返回
        response.end('signature fail');
        return;
    }

    if(request.method == "GET"){
        //如果请求是GET，返回echostr用于通过服务器有效校验
        response.end(params.echostr);
    }else if(request.method == "POST"){
        //否则是微信给开发者服务器的POST请求
        var postdata = "";

        request.addListener("data",function(postchunk){
            // console.log("addListener_________DATA");
            postdata += postchunk;
        });

        //获取到了POST数据
        request.addListener("end",function(){
            //console.log("addListener_________END");
            //将xml字符串转化为成json
            var parseString = require('xml2js').parseString;

            parseString(postdata, function (err, result) {
                if(!err){
                    //  console.log("messageType Success");
                    messageType(result,response);
                }else{
                    console.log("messageType Fail");
                }
            });
        });
    }
});
//此端口用户微信后台连接我的服务器
server.listen(9999);

//逻辑跳转处理微信后台传来的各种数据类型
function messageType(result,response){
    // console.log("result.xml.MsgType[0]---"+result.xml.MsgType[0]);
    switch(result.xml.MsgType[0]){
        case 'text':textMessage(result,response); break;
        case 'location':locationMessage(result,response); break;
        // default :OtherMessage(result,response);break;
    }
}
function textMessage(result,response){
    getUserInfo(result.xml.FromUserName[0])
        .then(function(userInfo){
            result.user = userInfo;
            var reg =/^\d{6}$/;
             var courseReg =/^[A-Za-z0-9]{5}$/;
            if(courseReg.test(result.xml.Content[0])){
                //resultSolveAdd(replyText);
                getRandom(resultSolveAdd);
                //添加一条记录
                function getRandom(callback){
                    var resultMessage="";
                    for(var i=0;i<6;i++)
                    {resultMessage+=Math.floor(Math.random()*10);
                    }
                    callback(addRandTable,resultMessage);
                }

                function addRandTable(resultMessage,callback){
                    console.log("addRandTable--addRandTable--"+result.xml.FromUserName[0]);
                    var moment = require("moment");
                    var insertSQL='insert rand_table(teacherName,courseNumber,resultMessage,dateNow,tag) VALUES(?,?,?,?,?)';
                    var  randTableAddSql_Params = [result.xml.FromUserName[0],result.xml.Content[0],resultMessage, moment().format("YYYY-MM-DD HH:mm:ss"),'0'];
                    pool.getConnection(function(err,conn){
                        if (err) console.log("ADD ERROR  ERROR ");
                        conn.query(insertSQL,randTableAddSql_Params,
                            function(err,data){
                                if(err){
                                    console.log('[INSERT ERROR] - ',err.message);
                                    return;
                                }

                                conn.release();
                            });
                    });
                    response.end(callback(result,'您的签到码为'+resultMessage+'!'));
        
                }
                //添加一条记录

                function resultSolveAdd(callback,resultMessage){
                    //console.log("result--result--"+result.xml.FromUserName[0]+"     "+result.xml.Content[0]);
                    pool.getConnection(function (err, conn) {
                        if (err) console.log("ERROR  ERROR ");
                        conn.query('select * from base_table where teacherName ="'+result.xml.FromUserName[0]+'" and courseNumber = "'+result.xml.Content[0]+'"', function (err, rows) {
                            if (err) console.log("ERROR  ERROR DB");
                            if(typeof rows=="null"||rows=="null"||rows==''){
                                response.end(replyText(result,'您身份下无课程号为'+result.xml.Content[0]+'的课程！'));
                                return;
                            }else{
                                callback(resultMessage,replyText);
                            }
                            conn.release();
                        });
                    });
                }
            }else if(reg.test(result.xml.Content[0])){
                //console.log("this is test for REGGGGGGGGGGGG");
                //查询
                searchRand(replyText);
                function searchRand(callback){
                    pool.getConnection(function (err, conn) {
                        if (err) console.log("ERROR  ERROR ");
                        conn.query('select * from rand_table where tag ="0" and resultMessage = "'+result.xml.Content[0]+'"', function (err, rows) {
                            if (err) console.log("ERROR  ERROR DB");
                            
                            if(typeof rows=="null"||rows=="null"||rows==''){
                                response.end(callback(result,'签到码错误或签到超时！'));
                            }else{
                                //发送定位信息
                                insertMidTable(rows,result);
                                response.end(callback(result,'请发送您的定位信息！'));
                            }
                            conn.release();
                        });
                    });
                }

                function insertMidTable(rows,msg){
                 console.log("rows[0].courseNumber----------"+rows[0].courseNumber);
                    var insertSQL='insert mid_save_table(courseNumber,resultMessage,studentTag,studentOpenID) VALUES(?,?,?,?)';
                    var  randTableAddSql_Params = [rows[0].courseNumber,msg.xml.Content[0],'150121',msg.xml.FromUserName[0],'0'];
                    pool.getConnection(function(err,conn){
                        if (err) console.log("ADD ERROR  ERROR ");
                        conn.query(insertSQL,randTableAddSql_Params,
                            function(err,data){
                                if(err){
                                    console.log('[INSERT ERROR] - ',err.message);
                                    return;
                                }

                                conn.release();
                            });
                    });

                }
            }else if(result.xml.Content[0]=="stop"){
                //如果老师身份就修改数据库
                pool.getConnection(function (err, conn) {
                    if (err) console.log("ERROR  ERROR ");
                    conn.query('select * from rand_table where teacherName ="'+result.xml.FromUserName[0]+'"', function (err, rows) {
                        if (err) console.log("ERROR  ERROR DB");
                        if(typeof rows=="null"||rows=="null"||rows==''){
                            response.end(replyText(result,'您不是教师身份！'));
                        }else{
                            //写一个函数在硬盘上建立文件，IO_JSON__append
                            pool.getConnection(function (err, conn) {
                                if (err) console.log("ERROR  ERROR ");
                                conn.query('update rand_table set tag = "1" where teacherName ="'+result.xml.FromUserName[0]+'"', function (err, rows) {
                                    if (err) console.log("ERROR  ERROR DB");

                                    conn.release();
                                });
                            });
                            response.end(replyText(result,'签到已停止！'));
                        }
                        conn.release();
                    });
                });
            }else{
                response.end(replyText(result,'您的输入有误！'));
            }
        });
}


function locationMessage(result,response){
   getUserInfo(result.xml.FromUserName[0])
       .then(function(userInfo){
           searchDBHas(replyText);
           function searchDBHas(callback){
            //是否有某个学生id
            pool.getConnection(function (err, conn) {
                        if (err) console.log("ERROR  ERROR ");         
                        conn.query('select * from mid_save_table where studentOpenId ="'+result.xml.FromUserName[0]+'"', function (err, rows) {
                            if (err) console.log("ERROR  ERROR DBOPI");
                            if(typeof rows=="null"||rows=="null"||rows==''){
                                console.log("please input your sing num");
                                response.end(replyText(result,'请先输入您的签到码！'));
                            }else{
                                //删除中间表的数据
                                // console.log("rows[0].courseNumber----------"+rows[0].id);
                                deleteMidTable(rows);
                                response.end(callback(result,'签到成功！'));
                            }
                            conn.release();
                        });
                    });

           }
           function deleteMidTable(rows){
             pool.getConnection(function (err, conn) {
                 console.log("rows[0].courseNumber----------"+rows[0].courseNumber);
                        if (err) console.log("ERROR  ERROR ");
                        conn.query('delete from mid_save_table where studentOpenId ="'+result.xml.FromUserName[0]+'"', function (err, res) {
                            if (err) console.log("delete ERROR  ERROR DB");
                            addJsonFile(result,rows);
                            conn.release();
                        });
                    });

           }
            
          
       });
}

//function OtherMessage(result,response){
//    getUserInfo(result.xml.FromUserName[0])
//        .then(function(userInfo){
//            //获得用户信息，合并到消息中
//            //result.user = userInfo;
//            var res = insideRouter(result);
//            response.end(res);
//        });
//}