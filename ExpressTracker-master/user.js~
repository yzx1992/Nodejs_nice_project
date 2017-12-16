var CorpID = require('./config').CorpID;
var Secret = require('./config').Secret;
var getToken = require('./token').getToken;
var request = require('request');

function getUserID(code) {
	return getToken(CorpID, Secret).then(function(res){
    var token = res.access_token;

    return new Promise(function(resolve, reject){
    		request('https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token='+token+'&code='+code+'&grant_type=authorization_code', function(err, res, data){
    		console.log(JSON.parse(data));
          		resolve(JSON.parse(data).UserId);
            		});
   		});
  	}).catch(function(err){
    		console.log(err);
  	});  
}

function getUserInfo(userID){
  	return getToken(CorpID, Secret).then(function(res){
    var token = res.access_token;

    return new Promise(function(resolve, reject){

      		request('https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token='+token+'&userid='+userID, function(err, res, data){
          		resolve(JSON.parse(data));
        		});
   	});
  	}).catch(function(err){
    		console.log(err);
  	});  
}

module.exports = {
  	getUserInfo: getUserInfo,
  	getOpenID:getUserID
};
