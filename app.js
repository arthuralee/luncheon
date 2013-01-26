var express = require("express");
var path = require("path");
var mongo = require("mongodb");
var Db = mongo.Db;
var BSON = mongo.BSONPure;
var app = express();

// CORS Middleware that sends HTTP headers with every request
// Allows connections from http://localhost:8081
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT,GET,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With');
    next();
}

// Config
app.configure(function () {
	app.use('/static', express.static(__dirname + '/static'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(allowCrossDomain);		// Our CORS middleware
	app.use(app.router);
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


// Database
// mongodb://host/dbname
var db;
Db.connect('mongodb://localhost:27017/luncheon', function (err, database){
	if (err)
		console.log(err);
	db = database;
});


// =========== ROUTES ==========

// Creates a user
app.post('/api/users', function (req,res) {
	var user = {
		nickname: req.body.nickname,
		phone: req.body.phone,
		status: req.body.status,
		loc: req.body.loc,
		active: false,
		last: Date.now()
	};
	db.collection("users").insert(user, function (err, results){
		if (err)
			console.log(err);
	});
	// useful so client gets server generated stuff like IDs
	res.send(user);
});

// Get all users
app.get('/api/users', function (req, res) {
	db.collection("users").find({}).toArray(function (err, userArray){
		if (err)
			console.log(err);
		res.send(userArray);
	});
});

// Get all active users
app.get('/api/users/active', function (req, res) {
	db.collection("users").find({"active" : true, "_id" : {$ne: new BSON.ObjectID(req.query.id)}}).toArray(function (err, userArray){
		if (err)
			console.log(err);
		res.send(userArray);
	});
});

// Sets a user as active
app.post('/api/users/active', function(req, res) {
	var userStatus = req.body.status || "";
	db.collection("users").update({"_id" : new BSON.ObjectID(req.body.id)}, 
									{ $set: {
										"active" : true, 
										"loc": req.body.loc, 
										"status": userStatus, 
										"last":Date.now()
										}
	}, function (err){
		if (err)
			console.log(err);
		}
	);
});

// Sets a user as inactive
app.post('/api/users/inactive', function(req, res) {
	db.collection("users").update({"_id": new BSON.ObjectID(req.body.id)},	{ $set : {"active" : false}});
});

app.get('/api/users/:id/heartbeat', function(req, res) {

});

// Launch server
app.listen(8000);