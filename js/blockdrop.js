/* 
 * BlockDropGame - A shameless Tetris clone
 * Benjamin Booth
 * bkbooth at gmail dot com
 */

// Need to refactor all of the code into a closure.

var gridSize = 30;		// Make this variable rather than fixed
var gameWrapper = document.getElementById("game-board");
var scoreElement = document.getElementById("game-score").getElementsByClassName("value")[0];
var levelElement = document.getElementById("game-level").getElementsByClassName("value")[0];

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
		newPiece.className = "piece-wrapper";
		
		// Add these useful properties to the piece,
		// can probably remove most of them now
		//newPiece.pieceSize = pieceBlueprint.size;
		newPiece.blocksMap = pieceBlueprint.blocks;
		//newPiece.topVal = -gridSize;
		//newPiece.leftVal = gridSize * (5 - (Math.round(pieceBlueprint.size / 2)));
		newPiece.rotate = 0;
		
		// Size & position of the new piece
		newPiece.style.top = -gridSize + "px";
		newPiece.style.left = gridSize * (5 - (Math.round(pieceBlueprint.size / 2))) + "px"
		newPiece.style.width = gridSize * pieceBlueprint.size + "px";
		newPiece.style.height = gridSize * pieceBlueprint.size + "px";
		
		// Loop through the blocks defined in the piece blueprint
		pieceBlueprint.blocks["rot0"].forEach(function(offsets) {
			// Create and setup the block for the piece
			var block = document.createElement("div");
			block.className = "piece-block piece-" + pieceBlueprint.id;
			block.style.left = gridSize * offsets.left + "px";
			block.style.top = gridSize * offsets.top + "px";
			
			// Append the block to the piece wrapper
			newPiece.appendChild(block);
		});
		
		// Append the piece to the TetrisGame board and return it
		return gameWrapper.appendChild(newPiece);
	}
};

var BlockDropGame = {
	lines: 0,
	score: 0,
	speed: 1,
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

// Compare the blocks of the current piece to all other blocks on the game board
BlockDropGame.checkAllBlocks = function(object, offsets) {
	//console.log("precision detecting "+nearbyPieces.length);
	
	// Initialise some variables
	var i, j, allBlocks = gameWrapper.getElementsByClassName("piece-block"), objectBlocks = object.getElementsByClassName("piece-block");
	
	// Loop through all blocks on the game board
	for (i = 0; i < allBlocks.length; i++) {
		// Ignore blocks from the current piece
		if (allBlocks[i].parentNode !== object) {
			// Loop through all blocks of the current piece
			for (j = 0; j < objectBlocks.length; j++) {
				//console.log("inner most loop "+objectBlocks[k].offsetLeft+" "+allNPBlocks[j].offsetLeft);
				// Do a simple box collision check
				if (BlockDropGame.isBoxIntersecting({
					// need to create a new source object accounting for parent offsets
					// maybe there's a better way?
					offsetLeft: object.offsetLeft + objectBlocks[j].offsetLeft,
					offsetTop: object.offsetTop + objectBlocks[j].offsetTop,
					offsetWidth: objectBlocks[j].offsetWidth,
					offsetHeight: objectBlocks[j].offsetHeight
				}, allBlocks[i], offsets)) {
					// console.log("collision found. src.left: "+objectBlocks[k].offsetLeft+", src.top: "+objectBlocks[k].offsetTop+
					//	", trgt.left: "+allNPBlocks[j].offsetLeft+", trgt.top"+allNPBlocks[j].offsetTop);
					return true;
				}
			}
		}
	}

	return false;
};

// Is the current piece intersecting with any walls or other pieces?
BlockDropGame.isIntersecting = function(object, target, offsets) {
	
	// Get the blocks of the current piece
	var objectBlocks = object.getElementsByClassName("piece-block");
	
	switch (target) {
		case 'leftWall':
			// Check if any of the piece blocks will be outside the left wall
			for (var i = 0; i < objectBlocks.length; i++) {
				//console.log(objectBlocks[i].offsetLeft + object.leftVal);
				if (object.offsetLeft + objectBlocks[i].offsetLeft + offsets.left < 0) {
					//console.log("left wall collision");
					return true;
				}
			}
			break;
		case 'rightWall':
			// Check if any of the piece blocks will be outside the right wall
			for (var i = 0; i < objectBlocks.length; i++) {
				//console.log(objectBlocks[i].offsetLeft + object.leftVal);
				if (object.offsetLeft + objectBlocks[i].offsetLeft + objectBlocks[i].offsetWidth + offsets.left > gridSize * 10) {
					//console.log("right wall collision");
					return true;
				}
			}
			break;
		case 'bottomWall':
			// Check if any of the piece blocks will be outside the bottom wall
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
	
	// Originally had this as another case, but we always want to compare to other blocks
	if (BlockDropGame.checkAllBlocks(object, offsets)) {
		//console.log("other piece collision");
		return true;
	}
	
	return false;
};

// Check if moving left will cause a collision with the left wall or other blocks
BlockDropGame.canMoveLeft = function() {
	// Offset 1 space to the left
	var offsets = {
		top: 0,
		left: -gridSize
	};
	if (BlockDropGame.isIntersecting(BlockDropGame.piece, 'leftWall', offsets)) {
		return false;
	}
	return true;
};

// Check if moving right will cause a collision with the right wall or other blocks
BlockDropGame.canMoveRight = function() {
	// Offset 1 space to the right
	var offsets = {
		top: 0,
		left: gridSize
	};
	if (BlockDropGame.isIntersecting(BlockDropGame.piece, 'rightWall', offsets)) {
		return false;
	}
	return true;
};

// Check if moving down will cause a collision with the bottom wall or other blocks
BlockDropGame.canMoveDown = function() {
	// Offset 1 space down
	var offsets = {
		top: gridSize,
		left: 0
	};
	if (BlockDropGame.isIntersecting(BlockDropGame.piece, 'bottomWall', offsets)) {
		return false;
	}
	return true;
};

// Check if rotating will cause a collision with other pieces
// We always want to allow rotation against a wall, will simply adjust position after rotate
BlockDropGame.canRotate = function() {
	
	// Set the next rotation step
	var tempPiece, tempRotate = BlockDropGame.piece.rotate + 90;
	if (tempRotate >= 360) {
		tempRotate = 0;
	}
	
	// Create a temporary piece with the next rotation step
	tempPiece = document.createElement("div");
	tempPiece.className = "piece-wrapper";
	tempPiece.style.left = BlockDropGame.piece.offsetLeft + "px";
	tempPiece.style.top = BlockDropGame.piece.offsetTop + "px";
	
	// Add the blocks for the next rotation step
	BlockDropGame.piece.blocksMap["rot"+tempRotate].forEach(function(offsets) {
		var tempBlock = document.createElement("div");
		tempBlock.className = "piece-block";
		tempBlock.style.left = gridSize * offsets.left + "px";
		tempBlock.style.top = gridSize * offsets.left + "px";
		tempPiece.appendChild(tempBlock);
	});
	
	// Intersection test with no offsets
	if (BlockDropGame.isIntersecting(tempPiece, 'leftWall', {left: 0, top: 0})) {
		return false;
	}
	
	return true;
};

// Create and return a list of rows which are full of blocks
BlockDropGame.findCompleteRows = function() {
	// Initialise variables, get all of the blocks in the game
	var i, j, k, completeRows = [];
	var allBlocks = gameWrapper.getElementsByClassName("piece-block");
	
	// Check 20 rows from the bottom up
	for (i = 19; i >= 0; i--) {
		// Check 10 columns from left to right
		for (j = 0; j < 10; j++) {
			// Check all blocks in the game board
			for (k = 0; k < allBlocks.length; k++) {
				// If we find a block at this row and column we can exit early
				if (allBlocks[k].offsetTop === i * gridSize &&
					allBlocks[k].offsetLeft === j * gridSize) {
					break;
				}
			}
			// If we didn't exit blocks loop early, a matching block wasn't found
			// We can end this column loop
			if (k === allBlocks.length) {
				break;
			}
		}
		// If we didn't exit the column loop early, this row is full
		if (j === 10) {
			completeRows.push(i);
		}
	}
	
	//console.log("complete rows: "+completeRows.length);
	return completeRows;
};

// Clear a single complete row and drop all blocks above it a single line
BlockDropGame.clearCompleteRow = function(completeRow) {
	
	// Initialise some variables
	var i, allBlocks = gameWrapper.getElementsByClassName("piece-block");
	var blocksToRemove = [];
	
	//console.log("clearing row: "+completeRow);
	
	// Loop through all blocks on the game board
	for (i = 0; i < allBlocks.length; i++) {
		if (allBlocks[i].offsetTop === completeRow * gridSize) {
			// If the block is in this row, push it to be removed
			// directly removing here breaks the loop
			blocksToRemove.push(allBlocks[i]);
			//allBlocks[i].parentNode.removeChild(allBlocks[i]);
		} else if (allBlocks[i].offsetTop < completeRow * gridSize) {
			// If the block is above the row being removed, drop it 1 space
			allBlocks[i].style.top = (allBlocks[i].offsetTop + gridSize) + "px";
		}
	}
	
	// Now lets go through and remove all the blocks in the row
	for (i = 0; i < blocksToRemove.length; i++) {
		blocksToRemove[i].parentNode.removeChild(blocksToRemove[i]);
	}
}

// Is the newly created piece already overlapping an existing piece?
// Only called when new pieces are created
BlockDropGame.isGameOver = function() {
	// No offset, we only care about where the piece is exactly
	var offsets = {
		top: 0,
		left: 0
	};
	if (BlockDropGame.isIntersecting(BlockDropGame.piece, 'bottomWall', offsets)) {
		return true;
	}
	return false;
}

// Before starting a new game, clear the current game board
BlockDropGame.clearGameBoard = function() {
	var allBlocks = gameWrapper.getElementsByClassName("piece-block");
	var allBlocksLength = allBlocks.length;// the length changes as we remove blocks
	
	for (var i = 0; i < allBlocksLength; i++) {
		// Always remove the first one
		if (allBlocks[0].parentNode !== BlockDropGame.piece) {
			gameWrapper.removeChild(allBlocks[0]);
		}
	}
	
	gameWrapper.removeChild(BlockDropGame.piece);
}

// Remove the piece wrapper and leave just the blocks behind
// This makes it much easier to detect and remove completed rows
BlockDropGame.addCurrentPieceToBoard = function() {
	
	// Initialise some variables
	var i, newLeft, newTop, newBlock;
	var pieceBlocks = BlockDropGame.piece.getElementsByClassName("piece-block");
	var pieceBlocksLength = pieceBlocks.length; // the length changes as we remove blocks
	
	// Loop through each of the blocks in the piece
	for (var i = 0; i < pieceBlocksLength; i++) {
		// Get new left and top relative to the game board
		newLeft = BlockDropGame.piece.offsetLeft + pieceBlocks[0].offsetLeft;
		newTop = BlockDropGame.piece.offsetTop + pieceBlocks[0].offsetTop;
		
		// Remove the block from the piece and update it's position
		newBlock = BlockDropGame.piece.removeChild(pieceBlocks[0]);
		newBlock.style.left = newLeft + "px";
		newBlock.style.top = newTop + "px";
		
		// Add the block back in as a child of the game board
		gameWrapper.appendChild(newBlock);
	}
	
	// Remove the now empty piece from the board
	gameWrapper.removeChild(BlockDropGame.piece);
};

// Initialise a game, create an initial piece and start the timer
BlockDropGame.init = function() {
	if (confirm("Ready to go, are you?")) {
		// Create the initial piece and start the timer
		BlockDropGame.piece = PieceFactory.create();
		BlockDropGame.score = 0;
		BlockDropGame.lines = 0;
		BlockDropGame.speed = 1;
		BlockDropGame._intervalId = setInterval(BlockDropGame.update, 1000 / BlockDropGame.speed);
	} else {
		// Give them another chance, but lets not bug the user with setInterval
		setTimeout(BlockDropGame.init, 2000);
	}
};

// Automatically drop the current piece if possible
// otherwise check for completed rows and then generate a new piece
BlockDropGame.update = function() {
	if (BlockDropGame.canMoveDown()) {
		//BlockDropGame.piece.topVal += gridSize;
		BlockDropGame.piece.style.top = BlockDropGame.piece.offsetTop + gridSize + "px";
	} else {
		clearInterval(BlockDropGame._intervalId);
		
		BlockDropGame.addCurrentPieceToBoard();
		
		var completeRows = BlockDropGame.findCompleteRows();
		
		// increment score before clearing rows
		//console.log(completeRows.length);
		switch (completeRows.length) {
			case 4:
				BlockDropGame.score += (1200 * BlockDropGame.speed);
				break;
			case 3:
				BlockDropGame.score += (300 * BlockDropGame.speed);
				break;
			case 2:
				BlockDropGame.score += (100 * BlockDropGame.speed);
				break;
			case 1:
				BlockDropGame.score += (40 * BlockDropGame.speed);
				break;
			default:
				break;
		}
		scoreElement.innerHTML = BlockDropGame.score;
		
		for (var i = completeRows.length; i > 0; i--) {
			// Starting from the end of the array (highest complete row)
			// because when you clear the lower rows first the value
			// of the higher rows to clear would need to drop too
			BlockDropGame.clearCompleteRow(completeRows[i - 1]);
			BlockDropGame.lines++;
			//console.log("score: " + BlockDropGame.score);
			
			// Increase the speed if we just hit a multiple of 10 lines 
			if (BlockDropGame.lines % 10 === 0) {
				//console.log("speeding up!");
				BlockDropGame.speed++;
				levelElement.innerHTML = BlockDropGame.speed;
			}
		}

		// Create a new piece and restart the timer
		BlockDropGame.piece = PieceFactory.create();
		
		if (BlockDropGame.isGameOver()) {
		//if (!BlockDropGame.canMoveDown()) {
			// If can't move straight after creating piece, game over!
			alert("Game over! Your score was: " + BlockDropGame.score);
			BlockDropGame.clearGameBoard();
			BlockDropGame.init();
			/*if (confirm("Game over! Your score was: " + BlockDropGame.score + ". Do you want to play again?")) {
				
			} else {
				// do nothing?
			} */
		} else {
			BlockDropGame._intervalId = setInterval(BlockDropGame.update, 1000 / BlockDropGame.speed);
		}
	}
};

// Ideally all style-related changes to the blocks should happen here.
/* BlockDropGame.draw = function() {
	BlockDropGame.piece.style.left = BlockDropGame.piece.leftVal + "px";
	BlockDropGame.piece.style.top = BlockDropGame.piece.topVal + "px";
	
	//console.log("left: "+BlockDropGame.piece.offsetLeft+", top: "+BlockDropGame.piece.offsetTop+", width: "+BlockDropGame.piece.offsetWidth+", height: "+BlockDropGame.piece.offsetHeight);
}; */

// The loop function, update the board, draw any changes
/* BlockDropGame.run = function() {
	//console.log("running!");
	BlockDropGame.update();
	//BlockDropGame.draw();
} */

window.addEventListener("keydown", function(event) {
	//console.log(keyPressed);
	//e.preventDefault();
	var keyPressed = event.KeyCode || event.which;
	
	if (keyPressed == '37' || keyPressed == '64') {
		// left key or 'a'
		//console.log("left");
		if (BlockDropGame.canMoveLeft()) {
			//BlockDropGame.piece.leftVal -= gridSize;
			BlockDropGame.piece.style.left = BlockDropGame.piece.offsetLeft - gridSize + "px";
		}
		event.preventDefault();
	} else if (keyPressed == '39' || keyPressed == '68') {
		// right key or 'd'
		//console.log("right");
		if (BlockDropGame.canMoveRight()) {
			//BlockDropGame.piece.leftVal += gridSize;
			BlockDropGame.piece.style.left = BlockDropGame.piece.offsetLeft + gridSize + "px";
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

		// Loop through the blocks in the current piece
		var blocks = BlockDropGame.piece.getElementsByClassName("piece-block");
		for (var i = 0; i < blocks.length; i++) {
			// Update their positions to the next rotation step
			blocks[i].style.left = BlockDropGame.piece.blocksMap["rot"+BlockDropGame.piece.rotate][i].left * gridSize + "px";
			blocks[i].style.top = BlockDropGame.piece.blocksMap["rot"+BlockDropGame.piece.rotate][i].top * gridSize + "px";
		}
		
		event.preventDefault();
	} else if (keyPressed == '40' || keyPressed == '83') {
		// down key or 's'
		//console.log("down");
		if (BlockDropGame.canMoveDown()) {
			//BlockDropGame.piece.topVal += gridSize;
			BlockDropGame.piece.style.top = BlockDropGame.piece.offsetTop + gridSize + "px";
		}
		event.preventDefault();
	} 

	//BlockDropGame.draw();
});

BlockDropGame.init();
