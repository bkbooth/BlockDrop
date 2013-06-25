
var Game = { };

Game.fps = 2;
Game.piece = document.getElementsByClassName("piece-wrapper")[0];

Game.update = function() {
	Game.piece.topVal += 30;
	if (Game.piece.topVal >= 540) {
		Game.piece.topVal = 540;
		//clearInterval(Game._intervalId);
	}
};
Game.draw = function() {
	Game.piece.style.left = Game.piece.leftVal + "px";
	Game.piece.style.top = Game.piece.topVal + "px";
	Game.piece.style['-webkit-transform'] = "rotate(" + Game.piece.rotate + "deg)";
};
Game.run = function() {
	//console.log("running!");
	Game.update();
	Game.draw();
}
Game.init = function() {
	Game.piece.topVal = 30;
	Game.piece.leftVal = 90;
	Game.piece.rotate = 0;
	Game.draw();
}();

document.addEventListener("keydown", function(e) {
	//console.log(e.keyCode);
	if (e.keyCode == '37' || e.keyCode == '64') {
		// left key or 'a'
		console.log("left");
		Game.piece.leftVal -= 30;
		if (Game.piece.leftVal < 0) {
			Game.piece.leftVal = 0;
		}
	} else if (e.keyCode == '39' || e.keyCode == '68') {
		// right key or 'd'
		console.log("right");
		Game.piece.leftVal += 30;
		if (Game.piece.leftVal > 210) {
			Game.piece.leftVal = 210;
		}
	} else if (e.keyCode == '38' || e.keyCode == '87') {
		// up key or 'w'
		console.log("up");
		Game.piece.rotate += 90;
		if (Game.piece.rotate >= 360) {
			Game.piece.rotate = 0;
		}
	} else if (e.keyCode == '40' || e.keyCode == '83') {
		// down key or 's'
		console.log("down");
		Game.piece.topVal += 30;
		if (Game.piece.topVal > 540) {
			Game.piece.topVal = 540;
		}
	} 

	Game.draw();
});

Game._intervalId = setInterval(Game.run, 1000 / Game.fps);

