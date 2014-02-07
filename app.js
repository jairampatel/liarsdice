/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var exphbs  = require('express3-handlebars');

var app = require('express')()
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);






// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

io.of('/game').on('connection',function(socket){
	console.log('connected server side');
	socket.on('join',function(room){
		console.log('somebody joined: ' + room);
		socket.join(room);
		socket.broadcast.to(room).emit('enterRoom');
	});
});

app.get('/play',function(req,res){
	res.render('play',{
		id: req.query.id
	});
});

app.get('/',function(req,res){
	res.render('home');
});



server.listen(app.get('port'), function(){
  
});
