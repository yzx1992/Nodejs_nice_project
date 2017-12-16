var http=require('http');
var request=require('request');

function catchEntities(a,x,y,radius)
{
	var entity;
	var entity1="医院";
	var entity2="银行";
	var entity3="酒店";
	var entity_1=encodeURIComponent(entity1);
	var entity_2=encodeURIComponent(entity2);
	var entity_3=encodeURIComponent(entity3);
	if(a==1)
		entity=entity_2;
	else if(a==2)
		entity=entity_3;
	else 
		entity=entity_1;

	return new Promise(function(resolve,reject){
		http.get('http://api.map.baidu.com/place/v2/search?ak=exCgrehN1fxUz1vc5f5PzmUZkACFZwE9&output=json&query='+entity+'&page_size=7&page_num=0&scope=2&location='+x+','+y+'&radius='+radius+'&filter=sort_name:distance',function(res){
			var html='';
			res.setEncoding('utf-8');
			res.on('data',function(chunk){
				html+=chunk;
			});
			res.on('end',function(){
				result=JSON.parse(html);
				var count=(result.results).length;
               	        	if(!count){
					resolve("没有找到附近服务！");
				}else{
                			resolve(result);
				}
			});
		}).on('error',function(err){
			console.log(err);
		});
	});
}

module.exports={
	catchEntities: catchEntities
}
