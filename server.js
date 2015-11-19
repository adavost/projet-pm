var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var nbPlayers = 0;
var nbPlayersReady = 0;
var nbPlayersMax = 4;
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  nbPlayers++;
  io.emit('connect disconnect', nbPlayers);
  console.log('A new player has joined the game');

  socket.on('ready', function(){
    nbPlayersReady++;
    io.emit('ready', nbPlayersReady);
  });
  socket.on('not ready', function(){
    nbPlayersReady--;
    io.emit('not ready', nbPlayersReady);
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
