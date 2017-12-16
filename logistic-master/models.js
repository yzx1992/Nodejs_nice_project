/**
 * Created by ZYJ on 2016/6/10.
 */
var mongoose=require('mongoose');

var Schema=mongoose.Schema;

//请求数据
var requestSchema = new Schema({
    reqType:String,
    uid:String,
    msg:String,
    time:String
});

//用户信息
var userSchema = new Schema({
  uid:String,
  position:String,
  domId:String
});

module.exports = {
  RequestModel : mongoose.model('RequestModel',requestSchema),
  UserModel : mongoose.model('UserModel',userSchema)
};
