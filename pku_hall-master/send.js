/**
 * Created by qinhao on 16/6/14.
 */

var news = require('./lib/news');
var cronJob = require('cron').CronJob;

var job = new cronJob('00 09 * * * ',function () {
    
    console.log("每天09:00定时向用户推送今日百讲票务信息");
    news.newsOneSend('2XiDAh94OcNekf7VOhIgq2Y268wBC-kmt1_6-N2FdSupPaiEuSrNBWIVx8Tfjtfsh', '@all').then(function (data) {
        console.log(data);
    });
});

job.start();