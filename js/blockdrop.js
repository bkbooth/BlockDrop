/* 
 * BlockDropGame - A shameless Tetris clone
 * Benjamin Booth
 * bkbooth at gmail dot com
 */

// Define all variables, setup all UI elements
var BlockDropGame = function(targetElement)
{
	// gameplay variables
	this.lines = 0;
	this.score = 0;
	this.level = 1;
	this._intervalId = null;
	this._dropWaitId = null;
	this.piece = null;
	this.nextPiece = null;
	this.touchStartX = null;
	this.touchStartY = null;
	this.isPlaying = false;
	
	// layout variables
	this.baseSize = 30;			// This is the base font size, can resize the whole board with this
	this.gameWrapper = null;
	this.infoWrapper = null;
	this.scoreElement = null
	this.levelElement = null;
	this.linesElement = null;
	this.nextElement = null;
	
	// dialogs
	this.startButton = null;
	this.pauseButton = null;
	this.resumeButton = null;
	this.finishDialog = null;
	
	// load the UI and listeners
	this.initialSetup(targetElement);
	this.setupEventListeners();
	
	// show the start game button
	this.showDialog("start");
};

// First time setup, create all the elements
BlockDropGame.prototype.initialSetup = function(targetElement)
{
	var wrapperElement, scoreWrapper, levelWrapper, linesWrapper, nextWrapper, nextContainer;
	
	targetElement = targetElement || document.getElementsByTagName("body")[0];
	
	// Set the base size
	var gameWidth = 16.5;
	var gameHeight = 21.0;
	var gameRatio = gameWidth / gameHeight;
	if (window.innerWidth / window.innerHeight > gameRatio) {
		// extra horizontal space
		this.baseSize = Math.floor(window.innerHeight / gameHeight);
	} else {
		// extra vertical space
		this.baseSize = Math.floor(window.innerWidth / gameWidth);
	}
	document.getElementsByTagName("body")[0].style.fontSize = this.baseSize + "px";
	
	// create and append the game wrapper
	wrapperElement = document.createElement("div");
	wrapperElement.setAttribute("id", "game-wrapper");
	wrapperElement.style.marginTop = Math.floor((window.innerHeight - (this.baseSize * gameHeight)) / 2) + "px";
	targetElement.appendChild(wrapperElement);
	
	// create and append the game board
	this.gameWrapper = document.createElement("div");
	this.gameWrapper.setAttribute("id", "game-board");
	wrapperElement.appendChild(this.gameWrapper);
	
	// create and append the info bar
	this.infoWrapper = document.createElement("div");
	this.infoWrapper.setAttribute("id", "game-info");
	wrapperElement.appendChild(this.infoWrapper);
	
	// create and append the next block display
	nextWrapper = document.createElement("div");
	nextWrapper.setAttribute("id", "game-next");
	nextWrapper.innerHTML = "<span class='title'>Next:</span>"
	this.nextElement = document.createElement("div");
	this.nextElement.setAttribute("class", "container");
	nextWrapper.appendChild(this.nextElement);
	this.infoWrapper.appendChild(nextWrapper);
	
	// create and append the score display to the info bar
	scoreWrapper = document.createElement("div");
	scoreWrapper.setAttribute("id", "game-score");
	scoreWrapper.innerHTML = "<span class='title'>Score:</span> ";
	this.scoreElement = document.createElement("span");
	this.scoreElement.setAttribute("class", "value");
	this.scoreElement.innerHTML = "0";
	scoreWrapper.appendChild(this.scoreElement);
	this.infoWrapper.appendChild(scoreWrapper);
	
	// create and append the level display to the info bar
	levelWrapper = document.createElement("div");
	levelWrapper.setAttribute("id", "game-level");
	levelWrapper.innerHTML = "<span class='title'>Level:</span> ";
	this.levelElement = document.createElement("span");
	this.levelElement.setAttribute("class", "value");
	this.levelElement.innerHTML = "1";
	levelWrapper.appendChild(this.levelElement);
	this.infoWrapper.appendChild(levelWrapper);
	
	// create and append the lines display to the info bar
	linesWrapper = document.createElement("div");
	linesWrapper.setAttribute("id", "game-lines");
	linesWrapper.innerHTML = "<span class='title'>Lines:</span> ";
	this.linesElement = document.createElement("span");
	this.linesElement.setAttribute("class", "value");
	this.linesElement.innerHTML = "0";
	linesWrapper.appendChild(this.linesElement);
	this.infoWrapper.appendChild(linesWrapper);
};

// Initialise a game, create an initial piece and start the timer
BlockDropGame.prototype.init = function()
{
	// Create the initial piece
	this.piece = this.gameWrapper.appendChild(PieceFactory.create());
	this.piece.style.top = -1 + "em";
	this.piece.style.left = (5 - (Math.round(this.piece.size / 2))) + "em"; 
	
	this.nextPiece = this.nextElement.appendChild(PieceFactory.create());
	this.nextPiece.style.left = ((4 - this.nextPiece.size) / 2) + "em";
	this.nextPiece.style.top = ((4 - this.nextPiece.size) / 2) + "em";
	
	// Initialise the game variables
	this.score = 0;
	this.lines = 0;
	this.level = 1;
	this.drawElements();
	this.isPlaying = true;
	
	// Start the timer
	this._intervalId = setInterval(this.update.bind(this), 1000 / this.level);
};

// Automatically drop the current piece if possible
// otherwise check for completed rows and then generate a new piece
BlockDropGame.prototype.update = function()
{
	//console.log(this);
	if (this.canMoveDown()) {
		this.piece.style.top = (this.piece.offsetTop / this.baseSize) + 1 + "em";
	} else {
		clearInterval(this._intervalId);
		
		this.addCurrentPieceToBoard();
		
		var completeRows = this.findCompleteRows();
		
		this.incrementScore(completeRows.length);
		
		for (var i = completeRows.length; i > 0; i--) {
			// Starting from the end of the array (highest complete row)
			// because when you clear the lower rows first the value
			// of the higher rows to clear would need to drop too
			this.clearCompleteRow(completeRows[i - 1]);
			this.lines++;
			
			// Increase the level if we just hit a multiple of 10 lines 
			if (this.lines % 10 === 0) {
				//console.log("speeding up!");
				this.level++;
			}
		}

		// Create a new piece and restart the timer
		this.piece = this.nextPiece.parentNode.removeChild(this.nextPiece);
		this.gameWrapper.appendChild(this.piece);
		this.piece.style.top = -1 + "em";
		this.piece.style.left = (5 - (Math.round(this.piece.size / 2))) + "em"; 
		
		this.nextPiece = this.nextElement.appendChild(PieceFactory.create());
		this.nextPiece.style.left = ((4 - this.nextPiece.size) / 2) + "em";
		this.nextPiece.style.top = ((4 - this.nextPiece.size) / 2) + "em";
		
		if (this.isGameOver()) {
			this.isPlaying = false;
			this.clearGameBoard();
			this.hideDialog(this.pauseButton);
			this.nextPiece.parentNode.removeChild(this.nextPiece);
			this.showDialog("finish");
		} else {
			this._intervalId = setInterval(this.update.bind(this), 1000 / this.level);
		}
		
		this.drawElements();
	}
};

// The loop function, update the board, draw any changes
/* BlockDropGame.prototype.run = function()
{
	//console.log("running!");
	BlockDropGame.update();
	//BlockDropGame.draw();
} */

// Ideally all output to the HTML should happen here
BlockDropGame.prototype.drawElements = function()
{
	this.scoreElement.innerHTML = this.score;
	this.linesElement.innerHTML = this.lines;
	this.levelElement.innerHTML = this.level;
};

// Check if moving down will cause a collision with the bottom wall or other blocks
BlockDropGame.prototype.canMoveDown = function(piece)
{
	piece = piece || this.piece;
	
	// Offset 1 space down
	var offsets = {
		top: this.baseSize,
		left: 0
	};
	if (this.isIntersecting(this.piece, 'bottomWall', offsets)) {
		return false;
	}
	return true;
};

// Check if moving left will cause a collision with the left wall or other blocks
BlockDropGame.prototype.canMoveLeft = function(piece)
{
	piece = piece || this.piece;
	
	// Offset 1 space to the left
	var offsets = {
		top: 0,
		left: -this.baseSize
	};
	if (this.isIntersecting(piece, 'leftWall', offsets)) {
		return false;
	}
	return true;
};

// Check if moving right will cause a collision with the right wall or other blocks
BlockDropGame.prototype.canMoveRight = function(piece)
{
	piece = piece || this.piece;
	
	// Offset 1 space to the right
	var offsets = {
		top: 0,
		left: this.baseSize
	};
	if (this.isIntersecting(piece, 'rightWall', offsets)) {
		return false;
	}
	return true;
};

// Check if rotating will cause a collision with other pieces
// Always want to allow rotation against a wall, will simply adjust position after rotate
BlockDropGame.prototype.canRotate = function()
{	
	// Set the next rotation step
	var tempPiece = null, tempRotate = this.piece.rotate + 90, testFail = null;
	if (tempRotate >= 360) {
		tempRotate = 0;
	}
	
	// Create a temporary piece with the next rotation step
	tempPiece = document.createElement("div");
	tempPiece.className = "piece-wrapper";
	tempPiece.size = this.piece.size;
	tempPiece.style.left = (this.piece.offsetLeft / this.baseSize) + "em";
	tempPiece.style.top = (this.piece.offsetTop / this.baseSize) + "em";
	tempPiece.style.zIndex = "-1";
	this.gameWrapper.appendChild(tempPiece);
	
	// Add the blocks for the next rotation step
	this.piece.blocksMap["rot"+tempRotate].forEach(function(offsets) {
		var tempBlock = document.createElement("div");
		tempBlock.className = "piece-block";
		tempBlock.style.left = offsets.left + "em";
		tempBlock.style.top = offsets.left + "em";
		tempPiece.appendChild(tempBlock);
	});
	
	// Intersection test with no offsets
	if (testFail = this.isIntersecting(tempPiece, 'all', {left: 0, top: 0})) {
		
		// If we're intersecting with the left or right wall,
		// check if we can move 1 space in the opposite direction to allow the rotate
		
		//console.log(this.piece.rotate);
		
		/* var offset = 1;
		if ( this.piece.size === 4 &&
			((testFail === 'leftWall' && this.piece.rotate !== 270) ||
			(testFail === 'rightWall' && this.piece.rotate !== 90)) ) {
			offset = 2;
		} */
		
		//console.log(testFail + ", offset: " + offset);
		//console.log(testFail);
		
		if (testFail === 'leftWall' && this.canMoveRight(tempPiece)) {
			this.piece.style.left = (this.piece.offsetLeft / this.baseSize) + 1 + "em";
			this.gameWrapper.removeChild(tempPiece);
			return true;
		} else if (testFail === 'rightWall' && this.canMoveLeft(tempPiece)) {
			this.piece.style.left = (this.piece.offsetLeft / this.baseSize) - 1 + "em";
			this.gameWrapper.removeChild(tempPiece);
			return true;
		}
		
		this.gameWrapper.removeChild(tempPiece);
		return false;
	}
	
	this.gameWrapper.removeChild(tempPiece);
	return true;
};

// Is the current piece intersecting with any walls or other pieces?
BlockDropGame.prototype.isIntersecting = function(object, target, offsets)
{
	// Get the blocks of the current piece
	var objectBlocks = object.getElementsByClassName("piece-block");
	
	// Check if any of the piece blocks will be outside the left wall
	if (target === 'leftWall' || target === 'all') {
		for (var i = 0; i < objectBlocks.length; i++) {
			if (object.offsetLeft + objectBlocks[i].offsetLeft + offsets.left < 0) {
				return 'leftWall';
			}
		}
	}
	
	// Check if any of the piece blocks will be outside the right wall
	if (target === 'rightWall' || target === 'all') {
		for (var i = 0; i < objectBlocks.length; i++) {
			if (object.offsetLeft + objectBlocks[i].offsetLeft + objectBlocks[i].offsetWidth + offsets.left > this.baseSize * 10) {
				return 'rightWall';
			}
		}
	}
	
	// Check if any of the piece blocks will be outside the bottom wall
	if (target === 'bottomWall' || target === 'all') {
		for (var i = 0; i < objectBlocks.length; i++) {
			if (object.offsetTop + objectBlocks[i].offsetTop + objectBlocks[i].offsetHeight + offsets.top > this.baseSize * 20) {
				return 'bottomWall';
			}
		}
	}
	
	// Always compare against all other blocks
	if (this.checkAllBlocks(object, offsets)) {
		return true;
	}
	
	return false;
};

// Compare the blocks of the current piece to all other blocks on the game board
BlockDropGame.prototype.checkAllBlocks = function(object, offsets)
{
	// Initialise some variables
	var i, j, allBlocks = this.gameWrapper.getElementsByClassName("piece-block"),
		objectBlocks = object.getElementsByClassName("piece-block");
	
	// Loop through all blocks on the game board
	for (i = 0; i < allBlocks.length; i++) {
		// Ignore blocks from the current piece
		if (allBlocks[i].parentNode !== object) {
			// Loop through all blocks of the current piece
			for (j = 0; j < objectBlocks.length; j++) {
				// Do a simple box collision check
				if (this.isBoxIntersecting({
					// need to create a new source object accounting for parent offsets
					// maybe there's a better way?
					offsetLeft: object.offsetLeft + objectBlocks[j].offsetLeft,
					offsetTop: object.offsetTop + objectBlocks[j].offsetTop,
					offsetWidth: objectBlocks[j].offsetWidth,
					offsetHeight: objectBlocks[j].offsetHeight
				}, allBlocks[i], offsets)) {
					return true;
				}
			}
		}
	}

	return false;
};

// Simple bounding box check, used for both crude and precision checks
BlockDropGame.prototype.isBoxIntersecting = function(sourceObject, targetObject, sourceOffsets)
{
	if (sourceObject.offsetTop + sourceObject.offsetHeight + sourceOffsets.top > targetObject.offsetTop &&		// source.bottom >= target.top
		sourceObject.offsetTop + sourceOffsets.top < targetObject.offsetTop + targetObject.offsetHeight &&		// source.top <= target.bottom
		sourceObject.offsetLeft + sourceObject.offsetWidth + sourceOffsets.left > targetObject.offsetLeft &&	// source.right >= target.left
		sourceObject.offsetLeft + sourceOffsets.left < targetObject.offsetLeft + targetObject.offsetWidth) {	// source.left <= target.right
		return true;
	} else {
		return false;
	}
};

// Create and return a list of rows which are full of blocks
BlockDropGame.prototype.findCompleteRows = function()
{
	// Initialise variables, get all of the blocks in the game
	var i, j, k, completeRows = [];
	var allBlocks = this.gameWrapper.getElementsByClassName("piece-block");
	
	// Check 20 rows from the bottom up
	for (i = 19; i >= 0; i--) {
		// Check 10 columns from left to right
		for (j = 0; j < 10; j++) {
			// Check all blocks in the game board
			for (k = 0; k < allBlocks.length; k++) {
				// If we find a block at this row and column we can exit early
				if (allBlocks[k].offsetTop === i * this.baseSize &&
					allBlocks[k].offsetLeft === j * this.baseSize) {
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
	
	return completeRows;
};

// Clear a single complete row and drop all blocks above it a single line
BlockDropGame.prototype.clearCompleteRow = function(completeRow)
{	
	// Initialise some variables
	var i, allBlocks = this.gameWrapper.getElementsByClassName("piece-block");
	var blocksToRemove = [];
	
	// Loop through all blocks on the game board
	for (i = 0; i < allBlocks.length; i++) {
		if (allBlocks[i].offsetTop === completeRow * this.baseSize) {
			// If the block is in this row, push it to be removed
			// directly removing here breaks the loop
			blocksToRemove.push(allBlocks[i]);
		} else if (allBlocks[i].offsetTop < completeRow * this.baseSize) {
			// If the block is above the row being removed, drop it 1 space
			allBlocks[i].style.top = (allBlocks[i].offsetTop / this.baseSize) + 1 + "em";
		}
	}
	
	// Now lets go through and remove all the blocks in the row
	for (i = 0; i < blocksToRemove.length; i++) {
		blocksToRemove[i].parentNode.removeChild(blocksToRemove[i]);
	}
};

// Is the newly created piece already overlapping an existing piece?
// Only called when new pieces are created
BlockDropGame.prototype.isGameOver = function()
{
	// No offset, we only care about where the piece is currently
	var offsets = {
		top: 0,
		left: 0
	};
	if (this.isIntersecting(this.piece, 'bottomWall', offsets)) {
		return true;
	}
	return false;
};

// Before starting a new game, clear the current game board
BlockDropGame.prototype.clearGameBoard = function()
{
	var allBlocks = this.gameWrapper.getElementsByClassName("piece-block");
	var allBlocksLength = allBlocks.length;// the length changes as we remove blocks
	
	for (var i = 0; i < allBlocksLength; i++) {
		// Always remove the first one
		if (allBlocks[0].parentNode !== this.piece) {
			this.gameWrapper.removeChild(allBlocks[0]);
		}
	}
	
	this.gameWrapper.removeChild(this.piece);
};

// Remove the piece wrapper and leave just the blocks behind
// This makes it much easier to detect and remove completed rows
BlockDropGame.prototype.addCurrentPieceToBoard = function()
{	
	// Initialise some variables
	var i, newLeft, newTop, newBlock;
	var pieceBlocks = this.piece.getElementsByClassName("piece-block");
	var pieceBlocksLength = pieceBlocks.length; // the length changes as we remove blocks
	
	// Loop through each of the blocks in the piece
	for (var i = 0; i < pieceBlocksLength; i++) {
		// Get new left and top relative to the game board
		newLeft = this.piece.offsetLeft + pieceBlocks[0].offsetLeft;
		newTop = this.piece.offsetTop + pieceBlocks[0].offsetTop;
		
		// Remove the block from the piece and update it's position
		newBlock = this.piece.removeChild(pieceBlocks[0]);
		newBlock.style.left = (newLeft / this.baseSize) + "em";
		newBlock.style.top = (newTop / this.baseSize) + "em";
		
		// Add the block back in as a child of the game board
		this.gameWrapper.appendChild(newBlock);
	}
	
	// Remove the now empty piece from the board
	this.gameWrapper.removeChild(this.piece);
};

// increment the score based on the number of rows completed
BlockDropGame.prototype.incrementScore = function(numRows)
{
	console.log(numRows);
	switch (numRows) {
		case 4:
			this.score += (1200 * this.level);
			break;
		case 3:
			this.score += (300 * this.level);
			break;
		case 2:
			this.score += (100 * this.level);
			break;
		case 1:
			this.score += (40 * this.level);
			break;
		default:
			break;
	}
};

// show the requested button
BlockDropGame.prototype.showDialog = function(button)
{
	switch (button) {
		case "start":
			this.startButton = document.createElement("div");
			this.startButton.setAttribute("id", "button-start");
			this.startButton.setAttribute("class", "button");
			this.startButton.innerHTML = "Start";
			this.gameWrapper.appendChild(this.startButton);
			break;
		case "pause":
			this.pauseButton = document.createElement("div");
			this.pauseButton.setAttribute("id", "button-pause");
			this.pauseButton.setAttribute("class", "button");
			this.pauseButton.innerHTML = "Pause";
			this.infoWrapper.appendChild(this.pauseButton);
			break;
		case "resume":
			this.resumeButton = document.createElement("div");
			this.resumeButton.setAttribute("id", "button-resume");
			this.resumeButton.setAttribute("class", "button");
			this.resumeButton.innerHTML = "Resume";
			this.gameWrapper.appendChild(this.resumeButton);
			break;
		case "finish":
			this.finishDialog = document.createElement("div");
			this.finishDialog.setAttribute("id", "dialog-finish");
			this.finishDialog.setAttribute("class", "dialog");
			this.finishDialog.innerHTML = "<div>Game over!<br />Your score was: " + this.score + "</div>";
			this.finishDialog.innerHTML += "<div class='close-button'>x</div>";
			this.gameWrapper.appendChild(this.finishDialog);
			break;
		default:
			break;
	}
};

// hide the requested button, accepts string or object
BlockDropGame.prototype.hideDialog = function(dialog)
{
	if (typeof dialog === "object" && (
		dialog === this.startButton ||
		dialog === this.pauseButton ||
		dialog === this.resumeButton ||
		dialog === this.finishDialog
	)) {
		dialog.parentNode.removeChild(dialog);
	} else if (typeof button === "string") {
		switch (button) {
			case "start":
				this.startButton.parentNode.removeChild(this.startButton);
				break;
			case "pause":
				this.pauseButton.parentNode.removeChild(this.pauseButton);
				break;
			case "resume":
				this.resumeButton.parentNode.removeChild(this.resumeButton);
				break;
			case "finish":
				this.finishDialog.parentNode.removeChild(this.finishButton);
				break;
			default:
				break;
		}
	}
};

// clear the timer, hide the game board
BlockDropGame.prototype.pauseGame = function()
{
	clearTimeout(this._intervalId);
	this.isPlaying = false;
	
	var allBlocks = this.gameWrapper.getElementsByClassName("piece-block");
	for (var i = 0; i < allBlocks.length; i++) {
		allBlocks[i].style.display = "none";
	}
	
	this.nextPiece.style.display = "none";
};

// clear the timer, show the game board
BlockDropGame.prototype.resumeGame = function()
{
	var allBlocks = this.gameWrapper.getElementsByClassName("piece-block");
	for (var i = 0; i < allBlocks.length; i++) {
		allBlocks[i].style.display = "block";
	}
	
	this.nextPiece.style.display = "block";
	
	this.isPlaying = true;
	this._intervalId = setInterval(this.update.bind(this), 1000 / this.level);
};

// left key or left swipe handler
BlockDropGame.prototype.moveLeftHandler = function() {
	if (this.canMoveLeft()) {
		this.piece.style.left = (this.piece.offsetLeft / this.baseSize) - 1 + "em";
	}
};

// right key or right swipe handler
BlockDropGame.prototype.moveRightHandler = function() {
	if (this.canMoveRight()) {
		this.piece.style.left = (this.piece.offsetLeft / this.baseSize) + 1 + "em";
	}
};

// down key or swipe down handler
BlockDropGame.prototype.moveDownHandler = function() {
	//clearInterval(that._intervalId);
	if (this.canMoveDown()) {
		this.piece.style.top = (this.piece.offsetTop / this.baseSize) + 1 + "em";
	}
	//that._intervalId = setInterval(that.update.bind(that), 1000 / that.level);
};

// up key or swipe up handler
BlockDropGame.prototype.rotateHandler = function() {
	if (this.canRotate()) {
		this.piece.rotate += 90;
		if (this.piece.rotate >= 360) {
			this.piece.rotate = 0;
		}
	}

	// Loop through the blocks in the current piece
	var blocks = this.piece.getElementsByClassName("piece-block");
	for (var i = 0; i < blocks.length; i++) {
		// Update their positions to the next rotation step
		blocks[i].style.left = this.piece.blocksMap["rot"+this.piece.rotate][i].left + "em";
		blocks[i].style.top = this.piece.blocksMap["rot"+this.piece.rotate][i].top + "em";
	}
};

// Setup the event listeners
BlockDropGame.prototype.setupEventListeners = function()
{
	var that = this;
	
	window.addEventListener("click", function(event)
	{
		//console.log(event);
		if (event.target === that.startButton) {
			// hide the button, show the pause button, start the game
			that.hideDialog(that.startButton);
			that.showDialog("pause");
			that.init();
			
			event.preventDefault();
		} else if (event.target === that.pauseButton) {
			// hide the button, show the resume button, pause the game
			that.hideDialog(that.pauseButton);
			that.showDialog("resume");
			that.pauseGame();
			
			event.preventDefault();
		} else if (event.target === that.resumeButton) {
			// hide the button, show the pause button, resume the game
			that.hideDialog(that.resumeButton);
			that.showDialog("pause");
			that.resumeGame();
			
			event.preventDefault();
		} else if (that.finishDialog && event.target === that.finishDialog.getElementsByClassName("close-button")[0]) {
			// hide the dialog, show the start button
			that.hideDialog(that.finishDialog);
			that.showDialog("start");
		}
	});
	
	window.addEventListener("keydown", function(event)
	{
		if (!that.isPlaying) {
			return;
		}
		
		var keyPressed = event.KeyCode || event.which;
		//console.log(keyPressed);
		
		if (keyPressed == '37' || keyPressed == '65' || keyPressed == '72') {
			// left key, 'a' or 'h'
			//console.log("left");
			that.moveLeftHandler();
			event.preventDefault();
		} else if (keyPressed == '39' || keyPressed == '68' || keyPressed == '76') {
			// right key, 'd' or 'l'
			//console.log("right");
			that.moveRightHandler();
			event.preventDefault();
		} else if (keyPressed == '38' || keyPressed == '87' || keyPressed == '75') {
			// up key, 'w' or 'k'
			//console.log("up");
			that.rotateHandler();
			event.preventDefault();
		} else if (keyPressed == '40' || keyPressed == '83' || keyPressed == '74') {
			// down key, 's' or 'j'
			//console.log("down");
			that.moveDownHandler();
			event.preventDefault();
		}
	
		//BlockDropGame.draw();
	});
	
	window.addEventListener("touchstart", function(event) {
		//console.log(event);
		//console.log("start x: "+event.changedTouches[0].clientX+", y: "+event.changedTouches[0].clientY);
		
		if (!that.isPlaying) {
			return;
		}
		
		// set the location for the start of the touch
		that.touchStartX = event.changedTouches[0].clientX;
		that.touchStartY = event.changedTouches[0].clientY;
	});
	
	window.addEventListener("touchmove", function(event) {
		//console.log(event);
		//console.log("end x: "+event.changedTouches[0].clientX+", y: "+event.changedTouches[0].clientY);
		
		if (!that.isPlaying) {
			return;
		}
		
		// calculate the move
		var touchEndX = event.changedTouches[0].clientX;
		var touchEndY = event.changedTouches[0].clientY;
		var touchMoveX = touchEndX - that.touchStartX;
		var touchMoveY = touchEndY - that.touchStartY;
		
		// lets check what kind of movement
		if (Math.abs(touchMoveX) > Math.abs(touchMoveY)) {
			// horizontal swipe
			if (touchMoveX > 0) {
				// right swipe
				//console.log("swipe right");
				that.moveRightHandler();
			} else {
				// left swipe
				//console.log("swipe left");
				that.moveLeftHandler();
			}
			event.preventDefault();
		} else {
			// vertical swipe
			if (touchMoveY > 0) {
				// down swipe
				//console.log("swipe down");
				that.moveDownHandler();
				event.preventDefault(); // allow to swipe and hold down
			} else {
				// up swipe
				//console.log("swipe up");
				that.rotateHandler();
				//event.preventDefault();
			}
		}
	});
};

var PieceFactory =
{
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
	
	
	// Create and return a new Tetris piece, can be random or a pre-defined piece.
	create: function(pieceIndex, initRotate)
	{
		var initRotate = initRotate || "0";
		// Use the passed index or randomly choose a piece blueprint to create from
		if (!(typeof pieceIndex === "number" && pieceIndex >= 0 && pieceIndex <= this.pieces.length)) {
			pieceIndex = Math.floor(Math.random() * this.pieces.length);
		}
		var pieceBlueprint = this.pieces[pieceIndex];
		
		// Create and setup the wrapper div for the piece 
		var newPiece = document.createElement("div");
		newPiece.className = "piece-wrapper";
		
		// Add these useful properties to the piece,
		newPiece.blocksMap = pieceBlueprint.blocks;
		newPiece.rotate = 0;
		newPiece.size = pieceBlueprint.size;
		
		// Size of the new piece
		// positioning not handled here anymore, caller sets position
		newPiece.style.width = pieceBlueprint.size + "em";
		newPiece.style.height = pieceBlueprint.size + "em";
		
		// Loop through the blocks defined in the piece blueprint
		pieceBlueprint.blocks["rot"+initRotate].forEach(function(offsets) {
			// Create and setup the block for the piece
			var block = document.createElement("div");
			block.className = "piece-block piece-" + pieceBlueprint.id;
			block.style.left = offsets.left + "em";
			block.style.top = offsets.top + "em";
			
			// Append the block to the piece wrapper
			newPiece.appendChild(block);
		});
		
		// Return the new piece
		return newPiece;
	}
};
