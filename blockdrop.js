/* 
 * BlockDropGame - A shameless Tetris clone
 * Benjamin Booth
 * bkbooth at gmail dot com
 */

var gridSize = 30;

var PieceFactory = {
	// Define our pieces here
	pieces: [
		{ id: "o", size: 2, blocks: { // O/square piece
			rot0: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }],
			rot90: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }],
			rot180: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }],
			rot270: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }]
		}},
		{ id: "l", size: 3, blocks: { // L piece
			rot0: [{ left: 2, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }],
			rot90: [{ left: 1, top: 0 }, { left: 1, top: 1 }, { left: 1, top: 2 }, { left: 2, top: 2 }],
			rot180: [{ left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 0, top: 2 }],
			rot270: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 1, top: 1 }, { left: 1, top: 2 }]
		}},
		{ id: "j", size: 3, blocks: { // J piece
			rot0: [{ left: 0, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }],
			rot90: [{ left: 1, top: 0 }, { left: 2, top: 0 }, { left: 1, top: 1 }, { left: 1, top: 2 }],
			rot180: [{ left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 2, top: 2 }],
			rot270: [{ left: 1, top: 0 }, { left: 1, top: 1 }, { left: 0, top: 2 }, { left: 1, top: 2 }]
		}},
		{ id: "s", size: 3, blocks: { // S piece
			rot0: [{ left: 1, top: 0 }, { left: 2, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }],
			rot90: [{ left: 1, top: 0 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 2, top: 2 }],
			rot180: [{ left: 1, top: 1 }, { left: 2, top: 1 }, { left: 0, top: 2 }, { left: 1, top: 2 }],
			rot270: [{ left: 0, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }, { left: 1, top: 2 }]
		}},
		{ id: "z", size: 3, blocks: { // Z piece
			rot0: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 1, top: 1 }, { left: 2, top: 1 }],
			rot90: [{ left: 2, top: 0 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 1, top: 2 }],
			rot180: [{ left: 0, top: 1 }, { left: 1, top: 1 }, { left: 1, top: 2 }, { left: 2, top: 2 }],
			rot270: [{ left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }, { left: 0, top: 2 }]
		}},
		{ id: "t", size: 3, blocks: { // T piece
			rot0: [{ left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 },{ left: 2, top: 1 }],
			rot90: [{ left: 1, top: 0 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 1, top: 2 }],
			rot180: [{ left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 1, top: 2 }],
			rot270: [{ left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }, { left: 1, top: 2 }]
		}},
		{ id: "i", size: 4, blocks: { // I/straight piece
			rot0: [{ left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 3, top: 1 }],
			rot90: [{ left: 2, top: 0 }, { left: 2, top: 1 }, { left: 2, top: 2 }, { left: 2, top: 3 }],
			rot180: [{ left: 0, top: 2 }, { left: 1, top: 2 }, { left: 2, top: 2 }, { left: 3, top: 2 }],
			rot270: [{ left: 1, top: 0 }, { left: 1, top: 1 }, { left: 1, top: 2 }, { left: 1, top: 3 }]
		}}
	],
	
	create: function() {
		// Randomly choose a piece blueprint to create from
		var pieceBlueprint = this.pieces[Math.floor(Math.random() * this.pieces.length)];
		
		// Create and setup the wrapper div for the piece
		// Place some of 
		var newPiece = document.createElement("div");
		newPiece.className = "piece-wrapper piece-" + pieceBlueprint.id;
		newPiece.pieceSize = pieceBlueprint.size;
		newPiece.blocksMap = pieceBlueprint.blocks;
		newPiece.topVal = -gridSize;
		newPiece.leftVal = gridSize * (5 - (Math.round(pieceBlueprint.size / 2)));
		newPiece.rotate = 0;
		
		newPiece.style.top = newPiece.topVal + "px";
		newPiece.style.left = newPiece.leftVal + "px"
		newPiece.style.width = gridSize * pieceBlueprint.size + "px";
		newPiece.style.height = gridSize * pieceBlueprint.size + "px";
		
		// Loop through the blocks defined in the piece blueprint
		pieceBlueprint.blocks["rot0"].forEach(function(offsets) {
			// Create and setup the block for the piece
			var block = document.createElement("div");
			block.className = "piece-block";
			block.style.left = gridSize * offsets.left + "px";
			block.style.top = gridSize * offsets.top + "px";
			
			// Append the block to the piece wrapper
			newPiece.appendChild(block);
		});
		
		// Append the piece to the TetrisGame board and return it
		return document.getElementById("game-wrapper").appendChild(newPiece);
	}
};

var BlockDropGame = {
	fps: 2,
	_intervalId: null
};

BlockDropGame.isBoundingBoxCollisionDetection = function(sourceObject, targetObject) {
	//console.log("bounding box detecting");
	if (sourceObject.offsetTop + sourceObject.offsetHeight >= targetObject.offsetTop &&
		sourceObject.offsetTop <= targetObject.offsetTop + targetObject.offsetHeight &&
		sourceObject.offsetLeft + sourceObject.offsetWidth > targetObject.offsetLeft &&
		sourceObject.offsetLeft < targetObject.offsetLeft + targetObject.offsetWidth) {
		return true;
	} else {
		return false;
	}
};
BlockDropGame.crudeCollisionDetection = function(object) {
	var allPieces = document.getElementById("game-wrapper").getElementsByClassName("piece-wrapper");
	//console.log("crude detecting "+allPieces.length);
	var possibleCollisions = [];
	
	for (var i = 0; i < allPieces.length; i++) {
		if (allPieces[i] !== object && BlockDropGame.isBoundingBoxCollisionDetection(object, allPieces[i])) {
			possibleCollisions.push(allPieces[i]);
		}
	}

	return possibleCollisions;
};
BlockDropGame.precisionCollisionDetection = function(object, possibleCollisions) {
	console.log("precision detecting "+possibleCollisions.length);
	var i, j, k, allPCBlocks = null, objectBlocks = null;
	for (i = 0; i < possibleCollisions.length; i++) {
		allPCBlocks = possibleCollisions[i].getElementsByClassName("piece-block");
		//console.log(i+" has "+allPCBlocks.length+" blocks");
		for (j = 0; j < allPCBlocks.length; j++) {
			objectBlocks = object.getElementsByClassName("piece-block");
			for (k = 0; k < objectBlocks.length; k++) {
				//console.log("inner most loop "+objectBlocks[k].offsetLeft+" "+allPCBlocks[j].offsetLeft);
				if (BlockDropGame.isBoundingBoxCollisionDetection({
					// need to create a new source object accounting for parent offsets
					// there must be a better way?
					offsetLeft: object.offsetLeft + objectBlocks[k].offsetLeft,
					offsetTop: object.offsetTop + objectBlocks[k].offsetTop,
					offsetWidth: objectBlocks[k].offsetWidth,
					offsetHeight: objectBlocks[k].offsetHeight 
				}, {
					// need to create a new target object accounting for parent offsets
					// there must be a better way?
					offsetLeft: possibleCollisions[i].offsetLeft + allPCBlocks[j].offsetLeft,
					offsetTop: possibleCollisions[i].offsetTop + allPCBlocks[j].offsetTop,
					offsetWidth: allPCBlocks[j].offsetWidth,
					offsetHeight: allPCBlocks[j].offsetHeight
				})) {
					/* console.log("collision found. src.left: "+objectBlocks[k].offsetLeft+", src.top: "+objectBlocks[k].offsetTop+
						", trgt.left: "+allPCBlocks[j].offsetLeft+", trgt.top"+allPCBlocks[j].offsetTop); */
					return true;
				}
				//console.log("no collision");
			}
		}
	}
	return false;
};
BlockDropGame.checkBoundingBox = function(object, target) {
	var objectBlocks = object.getElementsByClassName("piece-block");
	switch (target) {
		case 'leftWall':
			for (var i = 0; i < objectBlocks.length; i++) {
				//console.log(objectBlocks[i].offsetLeft + object.leftVal);
				if (object.leftVal + objectBlocks[i].offsetLeft <= 0) {
					return false;
				}
			}
			break;
		case 'rightWall':
			for (var i = 0; i < objectBlocks.length; i++) {
				//console.log(objectBlocks[i].offsetLeft + object.leftVal);
				if (object.leftVal + objectBlocks[i].offsetLeft + objectBlocks[i].offsetWidth >= gridSize * 10) {
					return false;
				}
			}
			break;
		case 'bottomWall':
			for (var i = 0; i < objectBlocks.length; i++) {
				if (object.topVal + objectBlocks[i].offsetTop + objectBlocks[i].offsetHeight >= gridSize * 20) {
					return false;
				}
			}
			break;
		case 'otherPieces':
			var possibleCollisions = BlockDropGame.crudeCollisionDetection(object);
			//console.log("possible collisions: "+possibleCollisions.length);
			if (possibleCollisions.length > 0 && BlockDropGame.precisionCollisionDetection(object, possibleCollisions)) {
				return false;
			}
			break;
	}
	return true;
};

BlockDropGame.canMoveLeft = function() {
	if (BlockDropGame.checkBoundingBox(BlockDropGame.piece, 'leftWall') &&
		BlockDropGame.checkBoundingBox(BlockDropGame.piece, 'otherPieces')) {
		return true;
	}
	return false;
};
BlockDropGame.canMoveRight = function() {
	if (BlockDropGame.checkBoundingBox(BlockDropGame.piece, 'rightWall') &&
		BlockDropGame.checkBoundingBox(BlockDropGame.piece, 'otherPieces')) {
		return true;
	}
	return false;
};
BlockDropGame.canMoveDown = function() {
	if (BlockDropGame.checkBoundingBox(BlockDropGame.piece, 'bottomWall') &&
		BlockDropGame.checkBoundingBox(BlockDropGame.piece, 'otherPieces')) {
		return true;
	}
	return false;
};

BlockDropGame.update = function() {
	if (BlockDropGame.canMoveDown()) {
		BlockDropGame.piece.topVal += gridSize;
	} else {
		clearInterval(BlockDropGame._intervalId);
		BlockDropGame.piece = PieceFactory.create();
		BlockDropGame._intervalId = setInterval(BlockDropGame.run, 1000 / BlockDropGame.fps);
	}
};
BlockDropGame.draw = function() {
	BlockDropGame.piece.style.left = BlockDropGame.piece.leftVal + "px";
	BlockDropGame.piece.style.top = BlockDropGame.piece.topVal + "px";
	
	//console.log("left: "+BlockDropGame.piece.offsetLeft+", top: "+BlockDropGame.piece.offsetTop+", width: "+BlockDropGame.piece.offsetWidth+", height: "+BlockDropGame.piece.offsetHeight);
};
BlockDropGame.run = function() {
	//console.log("running!");
	BlockDropGame.update();
	BlockDropGame.draw();
}
BlockDropGame.init = function() {
	BlockDropGame.piece = PieceFactory.create();
	
	BlockDropGame._intervalId = setInterval(BlockDropGame.run, 1000 / BlockDropGame.fps);
}();

window.addEventListener("keydown", function(event) {
	//console.log(keyPressed);
	//e.preventDefault();
	var keyPressed = event.KeyCode || event.which;
	
	if (keyPressed == '37' || keyPressed == '64') {
		// left key or 'a'
		//console.log("left");
		if (BlockDropGame.canMoveLeft()) {
			BlockDropGame.piece.leftVal -= gridSize;
		}
		event.preventDefault();
	} else if (keyPressed == '39' || keyPressed == '68') {
		// right key or 'd'
		//console.log("right");
		if (BlockDropGame.canMoveRight()) {
			BlockDropGame.piece.leftVal += gridSize;
		}
		event.preventDefault();
	} else if (keyPressed == '38' || keyPressed == '87') {
		// up key or 'w'
		//console.log("up");
		BlockDropGame.piece.rotate += 90;
		if (BlockDropGame.piece.rotate >= 360) {
			BlockDropGame.piece.rotate = 0;
		}
		
		var blocks = BlockDropGame.piece.getElementsByClassName("piece-block");
		for (var i = 0; i < blocks.length; i++) {
			blocks[i].style.left = BlockDropGame.piece.blocksMap["rot"+BlockDropGame.piece.rotate][i].left * gridSize + "px";
			blocks[i].style.top = BlockDropGame.piece.blocksMap["rot"+BlockDropGame.piece.rotate][i].top * gridSize + "px";
		}
		
		event.preventDefault();
	} else if (keyPressed == '40' || keyPressed == '83') {
		// down key or 's'
		//console.log("down");
		if (BlockDropGame.canMoveDown()) {
			BlockDropGame.piece.topVal += gridSize;
		}
		event.preventDefault();
	} 

	BlockDropGame.draw();
});
