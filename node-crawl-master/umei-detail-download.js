/**
 * Created by John on 2014/8/11.
 */
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var url = '';
var options = {
    url: 'http://ix.umei.cc//img2012/XR_VIP04/XR20140809N00201/0059.jpg',
    headers: {
       'Referer':'http://www.umei.cc/'  // 必须添加Referer，否则会被拒绝下载
    }
};
var options2 = {
    url: 'http://file.qianqian.com/data2/music/122880738/122880738.mp3?xcode=4cc5d783e4be9379a300ad69a9193119e9dbf079b14ac48c&src=\%22http%3A%2F%2Fpan.baidu.com%2Fshare%2Flink%3Fshareid%3D839367518%26uk%3D3393989443\%22',
/*    headers: {
       'Referer':''  // 必须添加Referer，否则会被拒绝下载
    }*/
};
request(options2).pipe((fs.createWriteStream('3.mp3')));