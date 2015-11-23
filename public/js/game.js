var ctx = null;
var id = null;
var gameData = null;

function startGame(data){
	gameData = data;
	id = $('span').attr('id');
	ctx = $('canvas')[0].getContext('2d');
	initGame();
	attachReactions();
}

function showGame(data){
	gameData = data;
	ctx = $('canvas')[0].getContext('2d');
	initGame();
}

function clearGame(data){
	ctx = $('canvas')[0].getContext('2d');
	ctx.clearRect(0, 0, $('canvas').width(), $('canvas').height());
}

function initGame(){
	//Drawing sweets
	ctx.fillStyle = "red";
	for(i=0; i < gameData.sweetsCoords.length; i++){
		ctx.beginPath();
		ctx.arc(gameData.sweetsCoords[i].x, 
			gameData.sweetsCoords[i].y, 
			gameData.sweetsSize, 0, 2*Math.PI);
		ctx.fill();
	}
	//Drawing players
	for(i=0; i<gameData.nbPlayers; i++){
		ctx.fillStyle = PLAYERS_COLORS[i];
		ctx.strokeStyle = PLAYERS_COLORS[i];
		ctx.beginPath();
		ctx.fillRect(gameData.players[i].coords.x, 
			gameData.players[i].coords.y, 
			gameData.playersSize, gameData.playersSize);
	}
}

function attachReactions(){
	var dataToServer = {playerId: 0, keyPressed: null};
	$(window).keypress(function(e){
		if(e.key.contains("Arrow")){
			dataToServer.playerId = id;
			dataToServer.keyPressed = e.key;
			socket.emit('player move', dataToServer);
		}
	});
}

function detachReactions(){
	$(window).off('keypress');
}

function movePlayer(player){
	//Clearing old position
	ctx.clearRect(gameData.players[player.id].coords.x, 
		gameData.players[player.id].coords.y,
		gameData.playersSize, gameData.playersSize);
		
	//Saving new coords
	gameData.players[player.id].coords = player.coords;
	
	//Setting new position
	ctx.fillStyle = PLAYERS_COLORS[player.id];
	ctx.fillRect(player.coords.x, player.coords.y, gameData.playersSize, 			gameData.playersSize);
}

function hideSweet(data){
	//Hiding sweet
	var x = gameData.sweetsCoords[data.sweetIndex].x
		- gameData.sweetsSize - 1;
	var y = gameData.sweetsCoords[data.sweetIndex].y
		- gameData.sweetsSize - 1;
	var squareSize = gameData.sweetsSize * 2 + 2;
	ctx.clearRect(x, y, squareSize, squareSize);
	
	//Removing sweet from tab
	gameData.sweetsCoords.splice(data.sweetIndex, 1);
	
	//Redraw the player
	ctx.fillStyle = PLAYERS_COLORS[data.playerId];
	ctx.fillRect(gameData.players[data.playerId].coords.x,
		gameData.players[data.playerId].coords.y, 
		gameData.playersSize, gameData.playersSize);
}
