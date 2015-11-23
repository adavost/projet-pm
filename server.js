var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

var nbPlayers = 0;
var nbPlayersReady = 0;
var nbSweetsPerPlayer = 5;
var nbSweets = 0;
var sweetsCoords = null;
var players = null;
var playersSize = 20;
var sweetsRadius = 5;
var dataForClient = function(){
	var ret = {
		nbPlayers: nbPlayersReady,
		playersSize: 20,
		sweetsSize: 5,
		sweetsCoords: null,
		players: null
	};
	
	//Generating random sweets positions
	sweetsCoords = [];
	for(i=0; i<nbPlayersReady * nbSweetsPerPlayer; i++){
		sweetsCoords.push({
			x: Math.floor(Math.random()*400), 
			y: Math.floor(Math.random()*400)
		});
	}
	ret.sweetsCoords = sweetsCoords;

	//Initializing players positions
	players = [{coords:{x:5,y:5}, score:0}, {coords:{x:375,y:375}, score:0}, 
		{coords:{x:375,y:5}, score:0}, {coords:{x:5,y:375}, score:0}];
	for(i=players.length; i>nbPlayersReady; i--){
		players.pop();	
	}		
	ret.players = players;	

	nbSweets = nbSweetsPerPlayer * nbPlayersReady;
	
	return ret;
}		


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  nbPlayers++;
  io.emit('connect disconnect', nbPlayers);
  socket.emit('players information', nbPlayersReady);
  console.log('A new player has joined the game');

  socket.on('ready', function(){
    nbPlayersReady++;
    socket.emit('ready approved', nbPlayersReady);
    io.emit('ready', nbPlayersReady);
    //Check if the game should start
    if(nbPlayersReady == nbPlayers){
	//Starts a 5sec countdown before the game starts
	var countdown = 5;
	var idInterval = setInterval(function(){
		io.emit('game will start', countdown);
		if(countdown == 0){
			clearInterval(idInterval);
    			//Generating random sweets positions
    			var sweetsCoords = []
    			for(i=0; i<nbPlayersReady * nbSweetsPerPlayer; i++){
				sweetsCoords.push({
					x: Math.random(), 
					y: Math.random()
      				});
    			}
			io.emit('game starts', dataForClient());
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
        players[data.playerId].coords.y -= 20;
	break;
      case "ArrowDown":
        players[data.playerId].coords.y += 20;
	break;
      case "ArrowLeft":
        players[data.playerId].coords.x -= 20;
	break;
      case "ArrowRight":
        players[data.playerId].coords.x += 20;
    }    
    io.emit('player move', 
	{id: data.playerId, coords: players[data.playerId].coords});
    //Comparing with sweets coords
    var maxDistToEat = playersSize/2 + sweetsRadius;
    var diffX = 0, diffY = 0;
    for(i=0; i<sweetsCoords.length; i++){
      diffX = Math.abs(players[data.playerId].coords.x + playersSize/2 
	- sweetsCoords[i].x);
      diffY = Math.abs(players[data.playerId].coords.y + playersSize/2 
	- sweetsCoords[i].y);
      if(diffX < maxDistToEat && diffY < maxDistToEat){
	//Removing the sweet + updating player score
	sweetsCoords.splice(i,1);
	players[data.playerId].score++;
	io.emit('sweet eaten', {playerId: data.playerId, playerScore: players[data.playerId].score, sweetIndex: i});
	if(sweetsCoords.length == 0){
	  //END OF THE GAME
	}
      }
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


