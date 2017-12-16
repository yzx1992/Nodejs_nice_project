'use strict'
var path = require('path');
var util = require('./libs/util');
var wechat_file=path.join(__dirname,'config/wechat.txt')
var wechat_ticket_file=path.join(__dirname,'config/wechat_ticket.txt')
var config ={
    wechat:{
        corpid:'wx1d3765eb45497a18',
        corpsecret:'y5Z4DRFBfvWjcyI3n6RKz8QnzrRjqhg2xgqemYcmawjpLyEM-ScZ-Y-1UjhReDMm',
        token:'pkusunny',
        EncodingAESKey:'1IehtnJA7yjuskhsf75jlN4qSBn6BP0cQ720nldFihu',
        //获取票据
        getAccessToken:function(){
            return util.readFileAsync(wechat_file)
        },
        //更新票据
        saveAccessToken:function(data){
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file,data);
        },
        getTicket:function(){
            return util.readFileAsync(wechat_ticket_file)
        },
        //更新票据
        saveTicket:function(data){
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_ticket_file,data);
        }
    }
};
module.exports = config;