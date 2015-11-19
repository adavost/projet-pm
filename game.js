var sweetsPerPlayer = 5;
var sweetsCoords = [];


function startGame(){
	drawSweets();
}

function drawSweets(){
	var x, y;
	var ctx = $('canvas')[0].getContext('2d');
	ctx.fillStyle = "red";
	for(i=0; i<nbPlayers * sweetsPerPlayer; i++){
		console.log("........3");
		x = Math.random() * $('canvas').width();
		y = Math.random() * $('canvas').height();
		sweetsCoords.push({x: x, y: y});
		ctx.beginPath();
		ctx.arc(x, y, 10, 0, 2*Math.PI);
		ctx.fill();
	}
}

function drawPlayers(){

}
