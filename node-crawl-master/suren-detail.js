/**
 * Created by John on 2014/8/11.
 */
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var _  = require('underscore');

// Import Underscore.string to separate object, because there are conflict functions (include, reverse, contains)
_.str = require('underscore.string');


var url = 'http://www.22mm.cc/mm/suren/PiaCPJdHHHHaHPCda-2.html';
if (0) {
    request(url).pipe((fs.createWriteStream('suren-details5.html')));
}
if (1) {
    request(url, function (error, res, body) {
        if (!error && res.statusCode == 200) {
//        console.log("body:", body);
            var $ = cheerio.load(body);
            var div = $('#box-inner');
            var strong = $('.diblcok').text();
            var c = strong.indexOf('/');
            strong = strong.substr(c+1);
            console.log("strong:", strong);
            var script = div.children()[2];
            var src = $(script).text();
//        console.log("src", src);
            console.log("src.indexOf(';')", src.indexOf(';'));//24
            var a = src.lastIndexOf('=');
            var b = src.lastIndexOf('\"');

            var s = src.substring(a+2, b);
            var s = s.replace('big', 'pic');
            var total = strong;
            console.log("s:", s);
        }
    })
}
