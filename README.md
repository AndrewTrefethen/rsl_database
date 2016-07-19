# rsl_database
This Node JS Module handles connections to a MySQL database and provides some utility functions for queuing requests

## Installation

  npm install rsl_database --save

## Usage

  var database = require('rsl_database');

  database.setConnection({
  	host:"localhost", //database host, default "localhost"
  	user:"username", //database username, default "root"
  	password:"password", //database password, default ""
  	database:"database name", //database name, default "test"
  	supportBigNumbers:true, //does the database support Big Numbers, default true
  	max_attempts:3 //max number of connection attempts before Error propogation, default 3
  });

  database.connect(function(err){
  	if(err){
  		console.log(err.message);
  	}
  	else{
  		console.log("established connection to database");
  	}
  });

  //database.query(query[,fillins])
  //using fillins automatically checks the variables for possibly dangerous values such as HTML or JavaScript that has not been encoded for safe display 

  database.query("SELECT 1 + 1 As Sum") //returns [{Sum:2}];

  database.query("SELECT * From users WHERE username = ?",["andrew"]) //returns array of user rows with username equal to andrew

  database.query("SELECT * From users WHERE username = ? AND age = ?",["andrew","21"]) //returns array of user rows with username equal to andrew and age is 21

  var queue = [];

  //database.enqueueQuery(query[,fillins])
  //this function returns a queueable object to mitigate callbacks

  //queue.push(database.enqueueQuery(query[,fillins])); //pass the same values you would to directly query the database

  queue.push(database.enqueueQuery("SELECT 1 + 1 As Sum"));
  queue.push(database.enqueueQuery("SELECT 2 + 2 As Sum"));
  queue.push(database.enqueueQuery("SELECT 4 + 4 As Sum"));

  //once the queue is filled with the desired queries, we need to query the whole queue

  database.queryQueue(queue,callback(err,results));
  /*
  	results = [
  		[
  			{Sum:2}
  		],[
  			{Sum:4}
  		],[
  			{Sum:8}
  		]
  	]
  */
  //results is an array of arrays, each query in the queue pushed its rows array onto the end of the results array in order
  //the queryQueue function will callback with an Error if there was an error ANYWEHRE in the queue


## Tests

  npm test

## Release History

  * 0.1.0 Initial release