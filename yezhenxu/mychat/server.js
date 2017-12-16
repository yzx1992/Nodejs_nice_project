var express =require('express');
var app=express();

//设置静态文件路径
app.use(express.static(__dirname+'/client'));

app.use(function (req,res){
    res.sendFile(__dirname+'/client/index.html');
});

var server=app.listen(8000, function () {
    console.log('app is running at port 8000!');
});
