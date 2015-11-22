
      var socket = io();
      var canvasWidth = 400;
      var canvasHeight = 400;
      var nbPlayers = 0;
      var nbPlayersReady = 0;     
      var idCountdown = -1;
      $(document).ready(function ()
      {
	$('#nbPlayersReady').html(nbPlayersReady + "players ready");
      });
      //Onclick reaction for the button
      function onReady(){
        if( $('input').val() == "Ready !" ){
          $('input').val("Not ready");
          socket.emit('ready', ''/*name plutar*/);
        }
        else{
          $('input').val("Ready !");
          socket.emit('not ready', '');
        }
      }
      //Countdown function. Used before starting the game.
      function startCountdown(countdown){
	var text = "Everyone is ready! The game will start in ";
	if(idCountdown == -1){
	  idCountdown = setInterval(function(){
	    countdown--;
	    $('#gameStatus').text(text + countdown + "...");
  	    if(countdown == 0){
	      clearInterval(idCountdown);
	      idCountdown = -1;
	      $('#gameStatus').text("Game started! Go go go!");
	      startGame();
	    }
	  }, 1000); 
	  $('#gameStatus').text(text + countdown + "...");
        }
      }
      //Function to interrupt the countdown
      function stopCountdown(){
	if(idCountdown != -1){
	  $('#gameStatus').text("");
	  clearInterval(idCountdown);
	  idCountdown = -1;
	}
      }   
