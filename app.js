var express = require("express");
var path = require("path");
var mongoose = require('mongoose');
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
mongoose.connect('mongodb://localhost/luncheon');

// New mongoose schema to create our Todo model
var Schema = mongoose.Schema;
var User = new Schema({
	nickname: { type: String, required: true },
	phone: { type: Number, required: false },
	status: { type: String, required: false },
	loc: { type: Array, required: false },
	active: { type: Boolean, required: true},
	last: {type:Date, required: false}
});
var UserModel = mongoose.model('User', User);


// =========== ROUTES ==========

// Creates a user
app.post('/api/users', function (req,res) {
	var user = new UserModel({
		nickname: req.body.nickname,
		phone: req.body.phone,
		status: req.body.status,
		loc: req.body.loc,
		active: false
	});

	// save to mongodb
	user.save();

	// useful so client gets server generated stuff like IDs
	return res.send(user);
});

// Get all users
app.get('/api/users', function (req, res) {
	return UserModel.find(function(err, users) {
		if (err) console.log(err);
		return res.send(users);
	});
});

// Get all active users
app.get('/api/users/active', function (req, res) {
	return UserModel.find()
			.where('active').equals(true)
			.where('_id').ne(req.query.id)
			.exec(function(err, users) {
		if (err) console.log(err);
		return res.send(users);
	});
});

// Sets a user as active
app.post('/api/users/active', function(req, res) {
	return UserModel.findById(req.body.id, function(err, user) {
		user.active = true;
		user.loc = req.body.loc;
		if(req.body.status) user.status = req.body.status;
		user.last = Date.now();
		user.save();
		return res.send(user);
	});
});

// Sets a user as inactive
app.post('/api/users/inactive', function(req, res) {
	return UserModel.findById(req.body.id, function(err, user) {
		user.active = false;
		user.save();
		return res.send(user);
	});
});

app.get('/api/users/:id/heartbeat', function(req, res) {

});

/*
// Get a single todo
app.get('/user/:id', function (req, res) {
	// pattern matches /todos/*
	// given id is passed to req.params.id
	return TodoModel.findById(req.params.id, function(err, todo) {
		res.send(todo);
	});
});

// Add a todo
app.post('/todos', function (req,res) {
	var todo = new TodoModel({
		desc: req.body.desc
	});

	// save to mongodb
	todo.save();

	// useful so client gets server generated stuff like IDs
	return res.send(todo);
});

// Delete a todo
app.delete('/todos/:id', function(req, res) {
	return TodoModel.findById(req.params.id, function(err, todo){
		return todo.remove(function(err) {
			return res.send('');
		});
	});
});

// Editing a todo
app.put('/todos/:id', function(req, res) {
	return TodoModel.findById(req.params.id, function(err, todo) {
		todo.desc = req.body.desc;
		todo.save();
		return res.send(todo);
	});
});
*/

// Launch server
app.listen(8000);