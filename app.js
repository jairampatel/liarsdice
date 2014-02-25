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

var rooms = {};
var users = {};
var ROOM_LIMIT = 4;

io.sockets.on('connection', function(socket){	
	console.log("connected");
	socket.on('join',function(data){		
		//addToRoom(data.room,data.name);
		console.log("joining room: " + data.name);
		socket.join(data.room);

		addToRoom(data.room,socket.id,data.name,socket);

		//io.sockets.in(data.room).emit('getPlayers', {players: getClients(data.room)});
		sendToRoom(data.room,"getPlayers",{players: getClients(data.room)});
		socket.broadcast.to(data.room).emit('enterRoom',{name: data.name, id: socket.id});
	});

	socket.on('startGame',function(data){
		var room = data.room;
		if(canStart(room)){
			startGame(room);
			var player = getNextPlayer(room);
			io.sockets.in(room).emit('nextTurn',{
				nextPlayer: player,
				currentRank: getCurrentRank(room),
				currentDiceNumber: getCurrentDiceNumber(room),
				currentSelected: getCurrentSelected(room)
			});
		}
	});

	socket.on('turnComplete',function(data){
		console.log('turn complete');
		var name = data.name;
		var room = data.room;
		var rank = data.inputRank;
		var diceNumber = data.inputDiceNumber;

		if(isInvalidMove(room,name,rank,diceNumber)){
			//TODO: check for invalid moves/send error message
		}
		else{
			if(hasStarted(room)){
				setCurrentRank(room,rank);
				setCurrentDiceNumber(room,diceNumber);

				var player = getNextPlayer(room);
				console.log('next player server: ' + player);
				io.sockets.in(room).emit('nextTurn',{
					nextPlayer: player,
					currentRank: getCurrentRank(room),
					currentDiceNumber: getCurrentDiceNumber(room),
					currentSelected: getCurrentSelected(room)
				});
			}
		}
	});
});

app.get('/play',function(req,res){
	res.render('play',{
		id: req.query.id,
		name: req.query.name
	});
});

app.get('/',function(req,res){
	res.render('home');
});



server.listen(app.get('port'), function(){
  
});

function sendToUser(id,name,hash){
	io.sockets.socket(id).emit(name,hash);
}
function sendToRoom(room,name,hash){
	var arr = io.sockets.clients(room);
	if(!arr)
		return;
	console.log('sending: ' + arr.length);
	for(var i = 0;i < arr.length;i++)
	{
		sendToUser(arr[i].id,name,hash);
	}
}
function sendDiceToPlayers(room){
	var arr = io.sockets.clients(room);
	if(!arr)
		return;
	console.log('sending dice: ' + arr.length);
	for(var i = 0;i < arr.length;i++){
		console.log('sending to: ' + arr[i].id);
		console.log('socket: ' + users[arr[i].id]);
		sendToUser(arr[i].id,"dice",{dice: rooms[room]["rooms"][i].dice});
	}
}
function rollDice(room){
	var arr = rooms[room]["rooms"];
	if(!arr)
		return null;
	for(var i = 0;i < arr.length;i++){
		var current = arr[i];
		current.dice = [];
		for(var j = 0;j < current.diceNumber;j++){
			current.dice.push(Math.floor(Math.random()*6 + 1));
		}
		current.dice.sort();
	}
}
function isInvalidMove(room,name,rank,diceNumber){
	return false;
}
function addToSelected(room,number){
	if(!rooms[room]["selected"]){
		rooms[room]["selected"] = [];
	}
	for(var i = 0;i < rooms[room]["selected"].length;i++){
		if(rooms[room]["selected"][i] == number)
		{
			return;
		}
	}
	rooms[room]["selected"].push(number);
}
function getCurrentSelected(room){
	if(rooms[room]["selected"] == null)
		rooms[room]["selected"] = [];
	return rooms[room]["selected"];
}

function getCurrentRank(room){
	if(rooms[room]["rank"] == null)
		rooms[room]["rank"] = 0;
	return rooms[room]["rank"];
}
function getCurrentDiceNumber(room){
	if(rooms[room]["diceNumber"] == null)
		rooms[room]["diceNumber"] = 0;
	return rooms[room]["diceNumber"];
}
function setCurrentRank(room,rank){
	rooms[room]["rank"] = rank;
}
function setCurrentDiceNumber(room,number){
	rooms[room]["diceNumber"] = number;
}
function getNextPlayer(room){
	var current = rooms[room]["nextPlayer"];

	if(!rooms[room]["rooms"] || !rooms[room]["rooms"] || rooms[room]["rooms"].length == 0){
		return null;
	}	
	var roomsLength;
	if(rooms[room]["rooms"] == null){
		roomsLength = 0;
	}
	else{
		roomsLength = rooms[room]["rooms"].length;
	}
	
	current = (current + 1) % roomsLength;
	rooms[room]["nextPlayer"] = current;
	
	return rooms[room]["rooms"][current].name;
}
function hasStarted(room){
	return rooms[room]["started"];
}
function canStart(room){
	return !rooms[room]["started"];
}
function startGame(room){
	console.log('start game');
	rooms[room]["started"] = true;
	rooms[room]["nextPlayer"] = -1;
	rollDice(room);
	sendDiceToPlayers(room);
}
function containsName(array,name){
	if(array == null || name == null){
		return false;
	}
	for(var i = 0;i < array.length;i++){
		if(array[i].name == name)
			return true;
	}
	return false;
}
/*
	TODO: if someone has left a room, update the rooms array to reflect it
*/
function getClients(room){
	var players = [];
	var arr = rooms[room]["rooms"];
	if(arr == null)
		return players;
	for(var i = 0;i < arr.length;i++){
		players.push(arr[i].name);
	}
	return players;
}
function addToRoom(room,id,name,socket){
	if(rooms[room] == null){
		rooms[room] = {};
	}
	if(rooms[room]["started"] == null){
		rooms[room]["started"] = false;
	}
	if(rooms[room]["rooms"] == null)
		rooms[room]["rooms"] = [];
	if(!containsName(rooms[room]["rooms"],name) && 
		!rooms[room]["started"] && 
			rooms[room]["rooms"].length < ROOM_LIMIT){
		rooms[room]["rooms"].push({
			id: id,
			name: name,
			diceNumber: 5,
			dice: []
		});
	}
}