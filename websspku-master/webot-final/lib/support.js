var debug = require('debug');
var log = debug('webot-example:log');

var _ = require('underscore')._;
var request = require('request');


/**
 * 搜索百度
 *
 * @param  {String}   keyword 关键词
 * @param  {Function} cb            回调函数
 * @param  {Error}    cb.err        错误信息
 * @param  {String}   cb.result     查询结果
 */
exports.search = function(keyword, cb){
  log('searching: %s', keyword);
  var options = {
    url: 'http://www.baidu.com/s',
    qs: {
      wd: keyword
    }
  };
  request.get(options, function(err, res, body){
    if (err || !body){
      return cb(null, '现在暂时无法搜索，待会儿再来好吗？');
    }
    var regex = /<h3 class="t">\s*(<a[\s\S]*?>.*?<\/a>)[\s\S]*?<\/h3>/gi;
    var links = [];
    var i = 1;

    while (true) {
      var m = regex.exec(body);
      if (!m || i > 5) break;
      links.push(i + '. ' + m[1]);
      i++;
    }

    var result;
    if (links.length) {
      result = '在百度搜索:' + keyword +',得到以下结果：\n' + links.join('\n');
      result = result.replace(/\s*data-click="[\s\S]*?"/gi,  '');
      result = result.replace(/\s*onclick="[\s\S]*?"/gi,  '');
      result = result.replace(/\s*target="[\s\S]*?"/gi,  '');
      result = result.replace(/\s{2,}/gi, ' ');
      result = result.replace(/<em>([\s\S]*?)<\/em>/gi,  '$1');
      result = result.replace(/<font[\s\S]*?>([\s\S]*?)<\/font>/gi,  '$1');
      result = result.replace(/<span[\s\S]*?>([\s\S]*?)<\/span>/gi,  '$1');
    } else {
      result = '搜不到任何结果呢';
    }

    // result 会直接作为
    // robot.reply() 的返回值
    //
    // 如果返回的是一个数组：
    // result = [{
    //   pic: 'http://img.xxx....',
    //   url: 'http://....',
    //   title: '这个搜索结果是这样的',
    //   description: '哈哈哈哈哈....'
    // }];
    //
    // 则会生成图文列表
    return cb(null, result);
  });
};

exports.talk = function(info, cb) {
    var keyword = info.param[0];
    request.post(
        {
            url:'http://www.tuling123.com/openapi/api',
            form:
            {
                'key': '332f5088816e49436f0cf76b0b49669f',
                'info': keyword,
                'userid': '123'
            }
        }, function(err, res, body) {
            var result = JSON.parse(body);
            return cb(null, result.text);
        })
};

/**
 * 下载图片
 *
 * 注意:只是简陋的实现,不负责检测下载是否正确,实际应用还需要检查statusCode.
 * @param  {String} url  目标网址
 * @param  {String} path 保存路径
 */
exports.download = function(url, stream){
  log('downloading %s a stream', url);
  return request(url).pipe(stream);
};