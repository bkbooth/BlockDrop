/* 
 * BlockDropGame - A shameless Tetris clone
 * Benjamin Booth
 * bkbooth at gmail dot com
 */

var gridSize = 30;		// Make this variable rather than fixed

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

// Simple bounding box check, used for both crude and precision checks
BlockDropGame.isBoxIntersecting = function(sourceObject, targetObject, sourceOffsets) {
	//console.log("bounding box detecting");
	//console.log("direction: " + direction);
	if (sourceObject.offsetTop + sourceObject.offsetHeight + sourceOffsets.top > targetObject.offsetTop &&		// source.bottom >= target.top
		sourceObject.offsetTop + sourceOffsets.top < targetObject.offsetTop + targetObject.offsetHeight &&		// source.top <= target.bottom
		sourceObject.offsetLeft + sourceObject.offsetWidth + sourceOffsets.left > targetObject.offsetLeft &&	// source.right >= target.left
		sourceObject.offsetLeft + sourceOffsets.left < targetObject.offsetLeft + targetObject.offsetWidth) {	// source.left <= target.right
		return true;
	} else {
		return false;
	}
};
// Crude piece-by-piece check to find nearby pieces
// saves needing to do a box-by-box check on every piece
BlockDropGame.getNearbyPieces = function(object, offsets) {
	//console.log("crude detecting "+allPieces.length);
	
	// Get all pieces from the game board and initialise array of nearby pieces
	var allPieces = document.getElementById("game-wrapper").getElementsByClassName("piece-wrapper");
	var nearbyPieces = [];
	
	// Loop through each piece, check it's not the current piece and then do a bounding box check
	for (var i = 0; i < allPieces.length; i++) {
		if (allPieces[i] !== object && BlockDropGame.isBoxIntersecting(object, allPieces[i], offsets)) {
			nearbyPieces.push(allPieces[i]);
		}
	}

	return nearbyPieces;
};
// Go through all nearby pieces and compare each block to each of
// the current pieces blocks
BlockDropGame.checkAllNearbyPieces = function(object, nearbyPieces, offsets) {
	//console.log("precision detecting "+nearbyPieces.length);
	
	// Initialise some variables
	var i, j, k, allNPBlocks = null, objectBlocks = object.getElementsByClassName("piece-block");
	
	for (i = 0; i < nearbyPieces.length; i++) {
		// Loop through all nearby piece, get its blocks
		allNPBlocks = nearbyPieces[i].getElementsByClassName("piece-block");
		//console.log(i+" has "+allNPBlocks.length+" blocks");
		for (j = 0; j < allNPBlocks.length; j++) {
			// Loop through all blocks of the nearby pieces
			for (k = 0; k < objectBlocks.length; k++) {
				// Loop through all blocks of the current piece, do a bounding box check
				//console.log("inner most loop "+objectBlocks[k].offsetLeft+" "+allNPBlocks[j].offsetLeft);
				if (BlockDropGame.isBoxIntersecting({
					// need to create a new source object accounting for parent offsets
					// there must be a better way?
					offsetLeft: object.offsetLeft + objectBlocks[k].offsetLeft,
					offsetTop: object.offsetTop + objectBlocks[k].offsetTop,
					offsetWidth: objectBlocks[k].offsetWidth,
					offsetHeight: objectBlocks[k].offsetHeight 
				}, {
					// need to create a new target object accounting for parent offsets
					// there must be a better way?
					offsetLeft: nearbyPieces[i].offsetLeft + allNPBlocks[j].offsetLeft,
					offsetTop: nearbyPieces[i].offsetTop + allNPBlocks[j].offsetTop,
					offsetWidth: allNPBlocks[j].offsetWidth,
					offsetHeight: allNPBlocks[j].offsetHeight
				}, offsets)) {
					/* console.log("collision found. src.left: "+objectBlocks[k].offsetLeft+", src.top: "+objectBlocks[k].offsetTop+
						", trgt.left: "+allNPBlocks[j].offsetLeft+", trgt.top"+allNPBlocks[j].offsetTop); */
					return true;
				}
				//console.log("no collision");
			}
		}
	}
	return false;
};
// Is the current piece intersecting with any walls or other pieces?
BlockDropGame.isIntersecting = function(object, target, offsets) {
	var objectBlocks = object.getElementsByClassName("piece-block");
	switch (target) {
		case 'leftWall':
			for (var i = 0; i < objectBlocks.length; i++) {
				//console.log(objectBlocks[i].offsetLeft + object.leftVal);
				if (object.offsetLeft + objectBlocks[i].offsetLeft + offsets.left < 0) {
					//console.log("left wall collision");
					return true;
				}
			}
			break;
		case 'rightWall':
			for (var i = 0; i < objectBlocks.length; i++) {
				//console.log(objectBlocks[i].offsetLeft + object.leftVal);
				if (object.offsetLeft + objectBlocks[i].offsetLeft + objectBlocks[i].offsetWidth + offsets.left > gridSize * 10) {
					//console.log("right wall collision");
					return true;
				}
			}
			break;
		case 'bottomWall':
			for (var i = 0; i < objectBlocks.length; i++) {
				if (object.offsetTop + objectBlocks[i].offsetTop + objectBlocks[i].offsetHeight + offsets.top > gridSize * 20) {
					//console.log("bottom wall collision");
					return true;
				}
			}
			break;
		default:
			// no default case
	}
	
	// Originally had an "otherPieces" target check, but we always need to check other pieces
	var nearbyPieces = BlockDropGame.getNearbyPieces(object, offsets);
	//console.log("possible collisions: "+possibleCollisions.length);
	if (nearbyPieces.length > 0 && BlockDropGame.checkAllNearbyPieces(object, nearbyPieces, offsets)) {
		//console.log("other piece collision");
		return true;
	}
	
	return false;
};

BlockDropGame.canMoveLeft = function() {
	var offsets = {
		top: 0,
		left: -gridSize
	};
	if (BlockDropGame.isIntersecting(BlockDropGame.piece, 'leftWall', offsets)) {
		return false;
	}
	return true;
};
BlockDropGame.canMoveRight = function() {
	var offsets = {
		top: 0,
		left: gridSize
	};
	if (BlockDropGame.isIntersecting(BlockDropGame.piece, 'rightWall', offsets)) {
		return false;
	}
	return true;
};
BlockDropGame.canMoveDown = function() {
	var offsets = {
		top: gridSize,
		left: 0
	};
	if (BlockDropGame.isIntersecting(BlockDropGame.piece, 'bottomWall', offsets)) {
		return false;
	}
	return true;
};
BlockDropGame.canRotate = function() {
	return true;
};

BlockDropGame.findCompleteRows = function() {
	var i, j, k, allPiecesBlocks, completeRows = [];
	//var allPieces = document.getElementById("game-wrapper").getElementsByClassName("piece-wrapper");
	var allBlocks = document.getElementById("game-wrapper").getElementsByClassName("piece-block");
	// Check 20 rows from the bottom up
	for (i = 19; i >= 0; i--) {
		for (j = 0; j < 10; j++) {
			var foundBlock = false;
			for (k = 0; k < allBlocks.length && !foundBlock; k++) {
				if (allBlocks[k].offsetTop + allBlocks[k].parentNode.offsetTop == i * gridSize &&
					allBlocks[k].offsetLeft + allBlocks[k].parentNode.offsetLeft == j * gridSize) {
					foundBlock = true;
				}
			}
			if (!foundBlock) {
				break;
			}
		}
		if (j == 9) {
			completeRows.push(i);
		}
	}
	return completeRows;
};

BlockDropGame.update = function() {
	/* var completeRows = BlockDropGame.findCompleteRows();
	if (completeRows.length > 0) {
		console.log("complete rows: " + completeRows.length);
	} */
	
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
		if (BlockDropGame.canRotate()) {
			BlockDropGame.piece.rotate += 90;
			if (BlockDropGame.piece.rotate >= 360) {
				BlockDropGame.piece.rotate = 0;
			}
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
