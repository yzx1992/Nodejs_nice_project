var express = require('express');
var topic = require('../app/Controller/topic');
var user = require('../app/Controller/user');
var reply = require('../app/Controller/reply');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '软微活动' });
});
router.get('/topics',topic.topics);
router.get('/topic/:id',topic.get);
router.get('/topic1', function (req, res, next) {
  res.render('post',{title:"title"});
});
router.post('/topic',topic.post);
router.get('/user',user.user);
//router.get('/user',user.user);
router.get('/new', function (req, res, next) {
  console.log(JSON.stringify(req.session));
  res.render('post',{title:'发起活动',user_openid:JSON.stringify(req.session.user.openid)});
});
router.get('/listPage/:type', function (req, res, next) {
  res.render('listPage',{title:req.params.type});
});
router.get('/topicPage/:id', function (req, res, next) {
  res.render('topic',{title:req.params.id});
});

router.post('/join',topic.join);
router.post('/cancelJoin',topic.cancelJoin);
//router.post('/removejoin',topic.cancelJoin);
//话题回复
router.post('/reply',reply.reply);
module.exports = router;
