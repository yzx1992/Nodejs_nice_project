/**
 * Created by John on 2014/8/11.
 */
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var url = 'http://www.umei.cc/';
//request(url).pipe((fs.createWriteStream('umei.html')));

request(url, function (error, res, body) {
    if (!error && res.statusCode == 200) {
        //        console.log("body:", body);
        var $ = cheerio.load(body);
        var li = $('DIV[class=t]');
// var a = $(li).children()[1];
// console.log("li.length:", a);
        var arr = [];
        li.each(function (index, ele) {
            var a = $(this).children()[1];
            var href = $(a).attr('href');
            var title = $(a).attr('title');
            var src = $('img', a).attr('src');

            var obj = {
                src: src,
                href: 'http://www.umei.cc' + href,
                title: title
            };
            arr.push(obj);
//            console.log("src:", src);
//            console.log("text:", text);
        });
        console.log("arr:", arr);

    }
})
