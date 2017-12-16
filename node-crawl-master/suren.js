/**
 * Created by John on 2014/8/11.
 */
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var url = 'http://www.22mm.cc/mm/suren/';
//request(url).pipe((fs.createWriteStream('suren.html')));
request(url, function (error, res, body) {
    if (!error && res.statusCode == 200) {
//        console.log("body:", body);
        var $ = cheerio.load(body);
        var li = $('li');
        console.log("li.length:", li.length);
        var arr = [];
        li.each(function (index, ele) {
            var text = $(this).text();
            var src = $('img', this).attr('src');
            var href = $('a', this).attr('href');
            console.log("href:", href);
            var obj = {
                src: src,
                href: 'http://www.22mm.cc' + href,
                text: text
            };
            arr.push(obj);
//            console.log("src:", src);
//            console.log("text:", text);
        });
        console.log("arr:", arr);

    }
})