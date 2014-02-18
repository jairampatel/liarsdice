var players = [];
var started = false;

function start(){
	started = true;
}
function hasStarted(){
	return started;
}
function containsPlayer(name){
	if(players.length == 0 || name == null){
		return false;
	}
	for(var i = 0;i < players.length;i++){
		if(players[i] == name)
			return true;
	}
	return false;
}

function addUsers(array){
	if(array){
		for(var i = 0;i < array.length;i++){
			addUser(array[i]);
		}
	}
}
function addUser(name){
	if(!containsPlayer(name) && !hasStarted()){
		$("#playerPool").append('<div class="player"> <div class="name">' + name + '</div> <div class="dice"></div></div>');
		players.push(name);
	}
}

