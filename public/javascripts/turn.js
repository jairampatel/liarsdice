var currentPlayer;
var inputRank;
var inputDiceNumber;
var currentRank;
var currentDiceNumber;

function showDice(diceArray,me){
	console.log('showing dice');
	var players = document.getElementsByClassName('player');

	for (var i = 0; i < players.length; ++i) {
	    var item = players[i];  
	    var name = item.getElementsByClassName('name')[0];
	    var diceDiv = item.getElementsByClassName('dice')[0];
	    if(name.innerHTML == me){
	    	for(var j = 0;j < diceArray.length;j++){
	    		var word = diceNumToWord(diceArray[j]);
	    		$(diceDiv).append('<div class="die ' + word + '">  <span class="dot"></span></div>');
	    	}
	    }
	    else{

	    }
	}
}

function diceNumToWord(num){
	var word;
	switch(num){
		case 1:
			word = "one";
		break;
		case 2:
			word = "two";
		break;
		case 3:
			word = "three";
		break;
		case 4:
			word = "four";
		break;
		case 5:
			word = "five";
		break;
		case 6:
			word = "six";
		break;
	}
	return word;
}
function hideControls(){
	$("#inputRank").hide();
	$("#inputDiceNumber").hide();
	$("#claim").hide();
}
function showControls(){
	$("#inputRank").show();
	$("#inputDiceNumber").show();
	$("#claim").show();
}
function selectPlayer(player,me){
	var players = document.getElementsByClassName('player');
	setPlayer(player);
	for (var i = 0; i < players.length; ++i) {
	    var item = players[i];  
	    var name = item.getElementsByClassName('name')[0];
	    if(name.innerHTML == player){
	    	$(item).toggleClass("bold");
	    }
	    else{
	    	$(item).removeClass("bold");
	    }
	}
	if(player == me)
		showControls();
}

function getInputRank(){
	return inputRank;
}

function getInputDiceNumber(){
	return inputDiceNumber;
}

function getCurrentRank(){
	return currentRank;
}

function getCurrentDiceNumber(){
	return currentDiceNumber;
}

function setInputRank(rank){
	var cr = document.getElementById('inputRank');
	cr.innerHTML = "Rank: " + rank;
	inputRank = rank;
}

function setInputDiceNumber(number){
	var cd = document.getElementById('inputDiceNumber');
	cd.innerHTML = "Dice Number: " + number;
	inputDiceNumber = number;
}
function updateCurrentRank(rank){
	var r = document.getElementById('currentRank');
	r.innerHTML = "Input Rank: " + rank;
}

function updateCurrentDiceNumber(diceNumber){
	var dn = document.getElementById('currentDiceNumber');
	dn.innerHTML = "Current Dice Number: " + diceNumber;
}

function updateSelected(selected){

}

function setPlayer(name){
	inputPlayer = name;
}

function getPlayer(){
	return inputPlayer;
}
