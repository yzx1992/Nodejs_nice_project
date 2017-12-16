var mongoose = require('mongoose')
var Schema = mongoose.Schema

var itemSchema = new Schema({
  title: String,
  nickname: String,
  headimgurl: String,
  descripthon: String,
  contact: String,
  createTime: String
})

exports.Item = mongoose.model('Item', itemSchema)
