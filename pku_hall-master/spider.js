/**
 * Created by lenovo on 2016/5/31.
 */

// 引入模块
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var news = require('./lib/news');

/*每天实现08:30定时爬虫*/

var cronJob = require('cron').CronJob;
var job = new cronJob('30 08 * * *',function () {
  console.log("每天08:30定时执行爬虫");


// 创建http get请求
    http.get("http://www.pku-hall.com/PWXX.aspx", function (res) {
        var html = ''; // 保存抓取到的HTML源码
        var tickets = [];  // 保存解析HTML后的数据
        res.setEncoding('utf-8');

        // 抓取页面内容
        res.on('data', function (chunk) {
            html += chunk;

        });

        //网页内容抓取完毕
        res.on('end', function () {
            var articleCotents = '<p>注：票务信息【 】内价位的票已售罄</p><br><table style="font-size: 12px;"><tr style="font-weight: bold;font-size: 16px;"><td style="width:85px;">时间</td><td>地点</td><td>节目</td><td>票价</td></tr>';;
            //console.log(html);
            var $ = cheerio.load(html);


            //如果你拿不准选择器的话，可以多用console.log来输出，看看取到的地址是否正确
            $('#gv_tick tr').each(function (index, item) {


                var tickets_item = {

                    // 伪类选择器

                    date: $('tr  td:first-child ' , this).text() + $('tr td:nth-child(2)', this).text(),// 获取日期
                   // time: $('tr td:nth-child(2)', this).text(),//获取时间
                    place: $('tr td:nth-child(3)', this).text(),//获取地点
                    title: $('a', this).text(), // 获取活动名称
                    link: 'http://www.pku-hall.com/' + $('a', this).attr('href'), // 获取活动详情页链接
                    price: $('td span', this).text(),//获取票价及详情
                    //detail:$('tr td span:nth-child(2)', this)




                };

                articleCotents += '<a href="'+tickets_item['link']+'">'
                articleCotents += '<tr>';
                articleCotents += '<td>';
                articleCotents += tickets_item['date'];
                articleCotents += '</td>';
                articleCotents += '<td>';
                articleCotents += tickets_item['place'];
                articleCotents += '</td>';
                articleCotents += '<td>';
                articleCotents += tickets_item['title'];
                articleCotents += '</td>';
                articleCotents += '<td>';
                articleCotents += tickets_item['price'];
                articleCotents += '</td>';
                articleCotents += '</tr>';
                articleCotents += '</a>';


                if (tickets_item.date != "") {

                    // 把所有新闻放在一个数组里面
                    tickets.push(tickets_item);
                }

            });

            articleCotents += '</table>';

            saveData('data/data.json', tickets);
            //readData('data/data.json');

            news.newsOneUpdate('2XiDAh94OcNekf7VOhIgq2Y268wBC-kmt1_6-N2FdSupPaiEuSrNBWIVx8Tfjtfsh',articleCotents).then(function(data){
                console.log(articleCotents);
            });

        });

    }).on('error', function (err) {
        console.log(err);
    });
});
console.log('即将开始爬虫');
job.start();



    /**
     * 保存数据到本地
     *
     * @param {string} path 保存数据的文件
     * @param {array} news 新闻信息数组
     */
    function saveData(path, tickets) {
        fs.writeFile(path, JSON.stringify(tickets, null, 4), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log('Data saved');
            //console.log('注：票务信息【 】内价位的票已售罄');
        });
    }

    /**
     * 保存数据到本地
     *
     * @param {string} path 保存数据的文件
     *
     *
     *
    function readData(path) {
        fs.readFile(path, {encoding: 'utf-8'}, function (err, bytesRead) {
            if (err)
                console.log(err);
            else {
                var data = JSON.parse(bytesRead);
                console.log(data);
                console.log("readData success");
            }
        });
    }
*/


