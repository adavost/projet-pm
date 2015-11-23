var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

gameStarted = false;
var nbPlayers = 0;
var nbPlayersReady = 0;
var nbSweetsPerPlayer = 5;
var gameData = {
	nbPlayers: 0,
	playersSize: 20,
	sweetsSize: 5,
	sweetsCoords: null,
	players: null
};

function generateGameData(){
	//Setting the number of plyaers for the game
	gameData.nbPlayers = nbPlayersReady;
	
	//Generating random sweets positions
	sweetsCoords = [];
	for(i=0; i<nbPlayersReady * nbSweetsPerPlayer; i++){
		sweetsCoords.push({
			x: Math.floor(Math.random()*395), 
			y: Math.floor(Math.random()*395)
		});
	}
	gameData.sweetsCoords = sweetsCoords;

	//Initializing players positions
	var players = [
		{ coords:{x:5,y:5}, score:0 }, 
		{ coords:{x:375,y:375}, score:0 }, 
		{ coords:{x:375,y:5}, score:0 }, 
		{ coords:{x:5,y:375}, score:0 }
	];
	while(players.length > nbPlayersReady){
		players.pop();	
	}		
	gameData.players = players;	
}		


app.get('/', function(req, res){
  	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  	nbPlayers++;
  	io.emit('connect disconnect', nbPlayers);
  	socket.emit('players information', {nbPR: nbPlayersReady, gameStarted: gameStarted, gameData: gameData});
  	console.log('A new player has joined the game');
	
  	socket.on('ready', function(){
    		nbPlayersReady++;
    		socket.emit('ready approved', nbPlayersReady);
    		io.emit('ready', nbPlayersReady);
    		//Check if the game should start
    		if(nbPlayersReady == nbPlayers || nbPlayersReady == 4){
			//Starts a 5sec countdown before the game starts
			gameStarted = true;
			var countdown = 5;
			var idInterval = setInterval(function(){
				io.emit('game will start', countdown);
				if(countdown == 0){
					clearInterval(idInterval);
					generateGameData();
					io.emit('game starts', gameData);
				}
				else countdown--;
			}, 1000);
			io.emit('game will start', countdown);
			countdown--;
    		}
  	});

  	socket.on('player move', function(data){
    		//Changing player coords
    		switch(data.keyPressed){
			case "ArrowUp":
				if(gameData.players[data.playerId].coords.y-20 >= 0) gameData.players[data.playerId].coords.y -= 20;
				else gameData.players[data.playerId].coords.y = 0;
				break;
			case "ArrowDown":
       			if(gameData.players[data.playerId].coords.y+20 <= 380) gameData.players[data.playerId].coords.y += 20;
				else gameData.players[data.playerId].coords.y = 380;
				break;
			case "ArrowLeft":
			    if(gameData.players[data.playerId].coords.x-20 >= 0) gameData.players[data.playerId].coords.x -= 20;
				else gameData.players[data.playerId].coords.x = 0;
				break;
			case "ArrowRight":
        		if(gameData.players[data.playerId].coords.x+20 <= 380) gameData.players[data.playerId].coords.x += 20;
				else gameData.players[data.playerId].coords.x = 380;
   		}    
   		io.emit('player move', {id: data.playerId, coords: gameData.players[data.playerId].coords});
   		//Comparing with sweets coords
		var maxDistToEat = gameData.playersSize/2 + gameData.sweetsSize;
		var diffX = 0, diffY = 0;
		for(i=0; i<gameData.sweetsCoords.length; i++){
			diffX = Math.abs(gameData.players[data.playerId].coords.x + gameData.playersSize/2 - gameData.sweetsCoords[i].x);
			diffY = Math.abs(gameData.players[data.playerId].coords.y + gameData.playersSize/2 - gameData.sweetsCoords[i].y);
			if(diffX < maxDistToEat && diffY < maxDistToEat){
				//Removing the sweet + updating player score
				gameData.sweetsCoords.splice(i,1);
				gameData.players[data.playerId].score++;
				io.emit('sweet eaten', {playerId: data.playerId, playerScore: gameData.players[data.playerId].score, sweetIndex: i});
			}
		}
		if(gameData.sweetsCoords.length == 0){
	  		//End of the game
	  		var winnerId = 0;
			for(i=1; i<gameData.players.length; i++){
				if(gameData.players[i].score > gameData.players[winnerId].score){
					winnerId = i;
				}
			}
			io.emit('game over', winnerId);
			nbPlayersReady = 0;
			gameStarted = false;
			io.emit('players information', {nbPR: 0, gameStarted: false, gameData: null});
		}	
 	});
  
 	socket.on('disconnect', function(){
    		nbPlayers--;
    		io.emit('connect disconnect', nbPlayers);
    		console.log('A player has left the game');
 	});
});

http.listen(3000, function(){
  	console.log('listening on *:3000');
});


