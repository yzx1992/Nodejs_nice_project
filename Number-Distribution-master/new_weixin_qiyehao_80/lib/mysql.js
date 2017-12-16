var mysql = require('mysql');
var Promise = require('promise');

var pool = mysql.createPool({
		connectionLimit : 10,
		host : 'localhost',
		user : 'yzx_db',
		password : '123456',
		database : 'yzx_db'
	});

function OperationSql(do_sql,sql_params) {
	
	return new Promise(function(resolve,reject){
		
	pool.getConnection(function (err, connection) {
		if (err)
			throw err;

		var value = 'yzx';
		var query = connection.query(do_sql,sql_params, function (err, result) {
				if (err)
					throw err;

				console.log("mysql.js  sql_result:",result);
				resolve(result);
				connection.release();
			});
		console.log(query.sql);
	});
	
	});
}

module.exports = {
	OperationSql : OperationSql
};
