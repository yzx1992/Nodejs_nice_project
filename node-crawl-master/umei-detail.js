/**
 * Created by John on 2014/8/11.
 */
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var _  = require('underscore');

// Import Underscore.string to separate object, because there are conflict functions (include, reverse, contains)
_.str = require('underscore.string');

var url = 'http://www.umei.cc/p/gaoqing/xiuren_VIP/20140811144151.htm';
//var download = 'http://ix.umei.cc//img2012/XR_VIP04/XR20140809N00201/0015.jpg';
//request(download).pipe((fs.createWriteStream('1.jpg')));
request(url, function (error, res, body) {
    if (!error && res.statusCode == 200) {
//        console.log("body:", body);
        var $ = cheerio.load(body);
        var img = $('.IMG_show').attr('src');
       console.log("img:", img);
    }
})