
var PieceFactory = { };

// Define our pieces here
PieceFactory.pieces = [
	{ id: "o", width: 2, height: 2, blocks: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 1, top: 1 }, { left: 0, top: 1 }]},
	{ id: "l", width: 3, height: 2, blocks: [{ left: 2, top: 0 }, { left: 2, top: 1 }, { left: 1, top: 1 }, { left: 0, top: 1 }]},
	{ id: "j", width: 3, height: 2, blocks: [{ left: 0, top: 0 }, { left: 2, top: 1 }, { left: 1, top: 1 }, { left: 0, top: 1 }]},
	{ id: "s", width: 3, height: 2, blocks: [{ left: 1, top: 0 }, { left: 2, top: 0 }, { left: 1, top: 1 }, { left: 0, top: 1 }]},
	{ id: "z", width: 3, height: 2, blocks: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 2, top: 1 }, { left: 1, top: 1 }]},
	{ id: "t", width: 3, height: 2, blocks: [{ left: 1, top: 0 }, { left: 2, top: 1 }, { left: 1, top: 1 }, { left: 0, top: 1 }]},
	{ id: "i", width: 4, height: 0, blocks: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 2, top: 0 }, { left: 3, top: 0 }]}
];
PieceFactory.create = function() {
	// Randomly choose a piece blueprint to create from
	var pieceBlueprint = PieceFactory.pieces[Math.floor(Math.random() * 7)];
	
	// Create and setup the wrapper div for the piece
	var newPiece = document.createElement("div");
	newPiece.className = "piece-wrapper piece-" + pieceBlueprint.id;
	newPiece.style.width = 30 * pieceBlueprint.width + "px";
	newPiece.style.height = 30 * pieceBlueprint.height + "px";
	
	// Loop through the blocks defined in the piece blueprint
	pieceBlueprint.blocks.forEach(function(offsets) {
		// Create and setup the block for the piece
		var block = document.createElement("div");
		block.className = "piece-block";
		block.style.left = 30 * offsets.left + "px";
		block.style.top = 30 * offsets.top + "px";
		
		// Append the block to the piece wrapper
		newPiece.appendChild(block);
	});
	
	// Append the piece to the TetrisGame board and return it
	return document.getElementById("TetrisGame-wrapper").appendChild(newPiece);
};

var TetrisGame = { };

TetrisGame.fps = 2;
TetrisGame.occupied = new Array();
TetrisGame.piece = PieceFactory.create();

TetrisGame.update = function() {
	TetrisGame.piece.topVal += 30;
	if (TetrisGame.piece.topVal >= 540) {
		TetrisGame.piece.topVal = 540;
		//clearInterval(TetrisGame._intervalId);
	}
};
TetrisGame.checkCollisions = function() {
	TetrisGame.piece
}
TetrisGame.draw = function() {
	TetrisGame.piece.style.left = TetrisGame.piece.leftVal + "px";
	TetrisGame.piece.style.top = TetrisGame.piece.topVal + "px";
	TetrisGame.piece.style['-webkit-transform'] = "rotate(" + TetrisGame.piece.rotate + "deg)";
};
TetrisGame.run = function() {
	//console.log("running!");
	TetrisGame.update();
	TetrisGame.draw();
}
TetrisGame.init = function() {
	TetrisGame.piece.topVal = 30;
	TetrisGame.piece.leftVal = 90;
	TetrisGame.piece.rotate = 0;
	for (var i = 0; i < 21; i++) {
		TetrisGame.occupied[i] = new Array();
		for (var j = 0; j < 10; j++) {
			if (j === 9) {
				TetrisGame.occupied[i][j] = 1;
			} else {
				TetrisGame.occupied[i][j] = 0;
			}
		}
	}
	TetrisGame.draw();
}();

window.addEventListener("keydown", function(e) {
	//console.log(e.keyCode);
	//e.preventDefault();
	if (e.keyCode == '37' || e.keyCode == '64') {
		// left key or 'a'
		console.log("left");
		TetrisGame.piece.leftVal -= 30;
		if (TetrisGame.piece.leftVal < 0) {
			TetrisGame.piece.leftVal = 0;
		}
	} else if (e.keyCode == '39' || e.keyCode == '68') {
		// right key or 'd'
		console.log("right");
		TetrisGame.piece.leftVal += 30;
		if (TetrisGame.piece.leftVal > 210) {
			TetrisGame.piece.leftVal = 210;
		}
	} else if (e.keyCode == '38' || e.keyCode == '87') {
		// up key or 'w'
		console.log("up");
		TetrisGame.piece.rotate += 90;
		if (TetrisGame.piece.rotate >= 360) {
			TetrisGame.piece.rotate = 0;
		}
	} else if (e.keyCode == '40' || e.keyCode == '83') {
		// down key or 's'
		console.log("down");
		TetrisGame.piece.topVal += 30;
		if (TetrisGame.piece.topVal > 540) {
			TetrisGame.piece.topVal = 540;
		}
	} 

	TetrisGame.draw();
});

TetrisGame._intervalId = setInterval(TetrisGame.run, 1000 / TetrisGame.fps);

