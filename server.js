var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

var nbPlayers = 0;
var nbPlayersReady = 0;
var nbSweetsPerPlayer = 5;
var dataForClient = function(){
	var randCoords = [];
	var ret = {
		nbPlayers: nbPlayers,
		nbSweetsPerPlayer: 5,
		sweetsCoords: null
	};

	for(i=0; i<nbPlayersReady * ret.nbSweetsPerPlayer; i++){
		randCoords.push({x: Math.random(), y: Math.random()});
	}
	ret.sweetsCoords = randCoords;
	
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
    			//Generating random numbers for sweets positions
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

  socket.on('player move', function(playerData){
    io.emit('player move', playerData);
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


