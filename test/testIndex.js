var expect = require('chai').expect;

var index = require('./../index.js');

var query = index.query;

var queryQueue = index.queryQueue;

var enqueueQuery = index.enqueueQuery;

describe('query', function() {
  it('should callback error when passed an undefined query', function() {
  	query(undefined,undefined,function(err,row){
  		expect(err).to.be.a('error');
  		expect(err).to.have.property('message').that.equals("Query not Specified");
  	});
  });
});

describe('queryQueue', function() {
  it('should callback error when passed an queue with an undefined query', function() {
  	queryQueue([{}],function(err,row){
  		expect(err).to.be.a('error');
  		expect(err).to.have.property('message').that.equals("No query specified in queue at index 0");
  	});
  });
  it('should return and empty array when passed an empty queue', function() {
  	queryQueue([],function(err,rows){
  		expect(Array.isArray(rows)).to.equal(true);
  		expect(rows).to.be.empty;
  	});
  });
  it('should callback error when passed an undefined queue', function() {
  	queryQueue(undefined,function(err,row){
  		expect(err).to.be.a('error');
  		expect(err).to.have.property('message').that.equals("Queue is not an array");
  	});
  });
});

describe('enqueueQuery', function() {
  it('should throw error when passed an undefined query', function() {
  	expect(enqueueQuery).to.throw(Error);
  });
  it('should autofill an undefined fillins with an empty array', function() {
  	var queueable = enqueueQuery("");
  	expect(queueable).to.have.property('fillins');
  	expect(Array.isArray(queueable.fillins)).to.equal(true);
  	expect(queueable.fillins).to.be.empty;
  });
  it('should return correctly defined object', function() {
  	var queueable = enqueueQuery("",[1,2,3]);
  	expect(queueable).to.have.property('fillins');
  	expect(queueable).to.have.property('query');
  	expect(1).to.be.oneOf(queueable.fillins);
  	expect(2).to.be.oneOf(queueable.fillins);
  	expect(3).to.be.oneOf(queueable.fillins);
  });
});