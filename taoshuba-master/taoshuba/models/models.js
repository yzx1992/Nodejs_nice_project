var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var userSchema=new Schema({
    username: String,
    password: String,
    email: String,
    createTime:{
        type: Date,
        default:Date.now
    }
});

var bookSchema=new Schema({
    title: String,
    author: String,
    username:String,
    owner:String,
    phone:String,
    content:String,
    //content:String,
    createTime:{
        type: Date,
        default:Date.now
    }
});
exports.User=mongoose.model('User',userSchema);
exports.Book=mongoose.model('Book',bookSchema);
