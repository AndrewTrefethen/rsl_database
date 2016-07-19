var mysql = require('mysql');

var meta = {
	status: "lost",
	max_attempts: 2
}

var connectionOptions = {
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'test',
	supportBigNumbers:true
}

var connection = undefined;

function errorHandler(err){
	//watch for PROTOCOL_CONNECTION_LOST error
	if(err.code == "PROTOCOL_CONNECTION_LOST")
	{
		//set the status to lost
		meta.status = "lost";
	}
}

function queryConnection(query,fillins,callback,count){
	if(typeof count === 'undefined') count = 0;
	connection.query(query,fillins,function(err,rows){
		if(err && count < meta.max_attempts) queryConnection(query,fillins,callback,count+1);
		else if(err){
			var q = query;
			var c = 0;
			while(c < fillins.length){
				q = q.replace(/[?]/,JSON.stringify(fillins[c++]));
			}
			callback(err);
		}
		else{
			callback(undefined,rows);
		}
	});
}

function Query(query,fillins,callback){
	if(typeof query === 'undefined'){
		callback(new Error("Query not Specified"));
	}
	if(typeof fillins === 'undefined')
	{
		fillins = [];
	}
	if(meta.status == "open")
	{
		queryConnection(query,fillins,callback);
	}
	else
	{
		if(meta.status == "lost")
		{
			connection = mysql.createConnection(connectionOptions);
			connection.connect(function(err){
				if(err)
				{
					callback(err);
				}
				else
				{
					meta.status = "open";
					connection.on("error",errorHandler);
					connection.query(query,fillins,callback);
				}
			});
		}
	}
}

function QueryQueue(queue,callback,index){
	index = index || 0;
	if((!Array.isArray(queue))){
		callback(new Error("Queue is not an array"))
	}
	else if(queue.length === 0){
		callback(undefined,[]);
	}
	else if(queue.length === index + 1)
	{
		if(typeof queue[index].query !== 'undefined'){
			Query(queue[index].query,queue[index].fillins,function(err,rows){
				if(err) callback(err);
				else callback(undefined,[rows]);
			});
		}
		else{
			callback(new Error("No query specified in queue at index "+index));
		}
	}
	else
	{
		if(typeof queue[index].query !== 'undefined'){
			Query(queue[index].query,queue[index].fillins,function(err,rows){
				if(err) callback(err);
				else
				{
					QueryQueue(queue,function(err,qRows){
						if(err) callback(err);
						else
						{
							callback(undefined,[rows].concat(qRows));
						}
					},index+1);
				}
			});
		}
		else{
			callback(new Error("No query specified in queue at index "+index));
		}
	}
}

function EnqueueQuery(query,fillins){
	if(typeof fillins === 'undefined'){
		fillins = [];
	}
	if(typeof query === 'undefined'){
		throw new Error("No query supplied to queueQuery");
	}
	return {query:query,fillins:fillins};
}

function TableExists(table, callback){
	var query = "SELECT COUNT(*) as Count FROM information_schema.tables WHERE table_schema = '"+connectionOptions.database+"' AND table_name = '"+table+"'";
	function tempCallback(err,rows){
		if(err)
		{
			callback(err);
		}
		else
		{
			if(rows[0].Count > 0)
			{
				callback(undefined,true);
			}
			else
			{
				callback(undefined,false);
			}
		}
	}
	if(meta.status == "open")
	{
		connection.query(query,tempCallback);
	}
	else
	{
		if(meta.status == "lost")
		{
			connection = mysql.createConnection(connectionOptions);
			connection.connect(function(err){
				if(err)
				{
					callback(err);
				}
				else
				{
					meta.status = "open";
					connection.on("error",errorHandler);
					connection.query(query,tempCallback);
				}
			});
		}
	}
}

function SetConnection(cnnObj){
	if(typeof cnnObj.host === 'string' || cnnObj.host instanceof String){
		connectionOptions.host = cnnObj.host;
	}
	if(typeof cnnObj.user === 'string' || cnnObj.user instanceof String){
		connectionOptions.user = cnnObj.user;
	}
	if(typeof cnnObj.password === 'string' || cnnObj.password instanceof String){
		connectionOptions.password = cnnObj.password;
	}
	if(typeof cnnObj.database === 'string' || cnnObj.database instanceof String){
		connectionOptions.database = cnnObj.database;
	}
	if(typeof cnnObj.supportBigNumbers === 'boolean'){
		connectionOptions.supportBigNumbers = cnnObj.supportBigNumbers;
	}
	if(Number.isInteger(cnnObj.max_attempts)){
		meta.max_attempts = cnnObj.max_attempts > 0 ? cnnObj.max_attempts - 1 : 0;
	}
}

function Connect(callback){
	if(meta.status == "lost")
	{
		connection = mysql.createConnection(connectionOptions);
		connection.connect(function(err){
			if(err)
			{
				callback(err);
			}
			else
			{
				meta.status = "open";
				connection.on("error",errorHandler);
			}
		});
	}
}

function IsConnected(){

	return (meta.status === "open");
}

module.exports = {
	query:Query,
	queryQueue: QueryQueue,
	tableExists:TableExists,
	enqueueQuery:EnqueueQuery,
	setConnection:SetConnection,
	connect:Connect,
	isConnected:IsConnected
}