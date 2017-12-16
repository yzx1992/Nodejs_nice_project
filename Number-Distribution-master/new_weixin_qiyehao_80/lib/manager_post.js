var https = require('https');

function manager_post(post_information, access_token) {

	var post_body = {

		"toparty" : " 18 ",

		"msgtype" : "text",
		"agentid" : 47,
		"text" : {
			"content" : post_information
		},
		"safe" : "0"
	}

	var post_str = new Buffer(JSON.stringify(post_body));

	var post_options = {
		host : 'qyapi.weixin.qq.com',
		port : '443',
		path : '/cgi-bin/message/send?access_token=' + access_token,
		method : 'POST',
		headers : {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Content-Length' : post_str.length
		}
	};

	var post_req = https.request(post_options, function (response) {
			var responseText = [];
			var size = 0;
			response.setEncoding('utf8');
			response.on('data', function (data) {
				responseText.push(data);
				size += data.length;
			});
			response.on('end', function () {
				console.log("responseText=", responseText);
			});
		});

	// post the data
	post_req.write(post_str);
	post_req.end();
}

module.exports = {
	manager_post : manager_post
};
