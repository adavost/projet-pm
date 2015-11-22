var players = [];
var sweets = [];
var score = 0;
var ctx = null;

/* Player 1: top left
 * Player 2: bottom right
 * Player 3: top right
 * Player 4: bottom left
 * NB: in the code, players are numbered from 0 to 3.
*/
function getPlayerStartingCoords(i){
	var ret = {x: 5, y: 5};
	if(i==2 || i==1) ret.x = $('canvas').width() - PLAYERS_SIZE - 5;
	if(i==3 || i==1) ret.y = $('canvas').height() - PLAYERS_SIZE - 5;
	return ret;	
}
	

function startGame(data){
	ctx = $('canvas')[0].getContext('2d');
	drawPlayers(data.nbPlayers);
	drawSweets(data.sweetsCoords);
	
	gameStarted = true;
	arrowsKeysReactionsEnabled(true);
}

function drawSweets(sweetsCoords){
	sweets = sweetsCoords;
	ctx.fillStyle = "red";
	for(i=0; i < sweets.length; i++){
		ctx.beginPath();
		sweets[i].x *= $('canvas').width();
		sweets[i].y *= $('canvas').height();
		ctx.arc(sweets[i].x, sweets[i].y, SWEETS_SIZE, 0, 2*Math.PI);
		ctx.fill();
	}
}

function drawPlayers(nbPlayers, playersSize){
	players = [];
	for(i=0; i<nbPlayers; i++){
		players[i] = {coords: null};
		players[i].coords = getPlayerStartingCoords(i);
		ctx.fillStyle = PLAYERS_COLORS[i];
		ctx.strokeStyle = PLAYERS_COLORS[i];
		ctx.beginPath();
		ctx.fillRect(players[i].coords.x, players[i].coords.y, 
			PLAYERS_SIZE, PLAYERS_SIZE);
	}
}

function arrowsKeysReactionsEnabled(bool){
	if(bool){
		var data = {playerId: 0, keyPressed: null};
		$(window).keypress(function(e){
			if(e.key.contains("Arrow")){
				data.playerId = $('span').attr('id');
				data.keyPressed = e.key;
				socket.emit('player move', data);
			}
		});
	}
	else{
		$(window).off('keypress');
	}
}

function movePlayer(data){
	//Clearing old position
	var x = players[data.playerId].coords.x;
	var y = players[data.playerId].coords.y;
	ctx.clearRect(x, y, PLAYERS_SIZE, PLAYERS_SIZE);
	//Setting new position
	ctx.fillStyle = PLAYERS_COLORS[data.playerId];
	switch(data.keyPressed){
		case "ArrowUp": 
			players[data.playerId].coords.y -= 20;
			y -= 20;
			break;
		case "ArrowDown":		
			players[data.playerId].coords.y += 20;
			y += 20;
			break;
		case "ArrowLeft":
			players[data.playerId].coords.x -= 20;
			x -= 20;
			break;
		case "ArrowRight":
			players[data.playerId].coords.x += 20;
			x += 20;
	}
	ctx.fillRect(x, y, PLAYERS_SIZE, PLAYERS_SIZE);
	updateScore(players[data.playerId]);
}

function updateScore(player){
	//Comparing player coords with sweets coords
	/*var maxDistance = PLAYERS_SIZE/2 + SWEETS_SIZE;
	var diffX = 0, diffY = 0;
	for(i=0; i<sweets.length; i++){
		diffX = Math.abs(player.coords.x - sweets[i].x);
		diffY = Math.abs(player.coords.y - sweets[i].y);
		if(
	}*/	
}
