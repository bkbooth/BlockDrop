/* 
 * BlockDropGame - A shameless Tetris clone
 * Benjamin Booth
 * bkbooth at gmail dot com
 */

// Define all variables, setup all UI elements
var BlockDropGame = function(targetElement)
{
	// gameplay variables
	this.lines = 0;				// the number of cleared lines
	this.score = 0;				// the players score
	this.level = 1;				// the level, increases every 10 lines, drop speed based on this
	this.dropLength = 0;		// measure how long the player hard or soft drops the piece continuously
	this._intervalId = null;	// the main game loop timer
	this._dropWaitId = null;	// timer triggered when player is holding down until piece hits the bottom
	this.piece = null;			// the currently moving piece
	this.nextPiece = null;		// the next piece
	this.touchStartX = null;	// x coordinate where the touch event started
	this.touchStartY = null;	// y coordinate where the touch event started
	this.touchMoved = false;	// records whether the piece has been moved during the touch event
	this.touchBlocked = false;	// touch temporary blocked to reduce sensitivity / increase control
	this.hardDropped = false;	// prevent rotating or moving after a hard drop
	this.isPlaying = false;		// records the state of the game
	
	// layout variables
	this.baseSize = 30;			// the base font size, can resize the whole board with this
	this.gameWrapper = null;	// the game board
	this.infoWrapper = null;	// the info sidebar
	this.scoreElement = null	// the HTML score output element
	this.levelElement = null;	// the HTML level output element
	this.linesElement = null;	// the HTML lines output element
	this.nextElement = null;	// the HTML wrapper that holds the next piece
	
	// dialogs
	this.startButton = null;	// HTML element for the "Start" button
	this.aboutButton = null;	// HTML element for the "About" button
	this.scoresButton = null;	// HTML element for the "High Scores" button
	this.pauseButton = null;	// HTML element for the "Pause" button
	this.resumeButton = null;	// HTML element for the "Resume" button
	this.quitButton = null;		// HTML element for the "Quit" button
	this.infoDialog = null;		// HTML element for the "Info" dialog
	this.finishDialog = null;	// HTML element for the "Game Over" dialog
	this.highScoresDialog = null; // HTML element for the "High Scores" dialog
	this.scoreName = null;		// HTML element for the score name input field
	
	// setup localStorage stuff
	this.numSavedScores = 0;
	this.highScores = [];
	this.loadScores();
	
	// load the UI and listeners
	this.initialSetup(targetElement);
	this.setupEventListeners();
	
	// show the start game and about buttons
	this.showDialog("start");
	this.showDialog("about");
	this.showDialog("scores");
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
BlockDropGame.prototype.startGame = function()
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
	this.touchStartX = null;
	this.touchStartY = null;
	this.touchMoved = false;
	this.touchBlocked = false;
	this.isPlaying = true;
	
	// show/hide the relevant dialogs
	this.hideDialog("start");
	this.hideDialog("about");
	this.hideDialog("scores");
	this.showDialog("pause");
	
	// Start the timer
	this._intervalId = setInterval(this.update.bind(this), 1000 / this.level);
};

// Automatically drop the current piece if possible
// otherwise check for completed rows and then generate a new piece
BlockDropGame.prototype.update = function()
{
	this._dropWaitId = null;
	this.hardDropped = false;
	
	if (this.canMoveDown()) {
		this.piece.style.top = (this.piece.offsetTop / this.baseSize) + 1 + "em";
		this.dropLength = 0;
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
			this.finishGame(false);
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
	if (this.isIntersecting(piece, 'bottomWall', offsets)) {
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
	tempPiece = this.gameWrapper.appendChild(PieceFactory.create(this.piece.pieceIndex, tempRotate));
	tempPiece.style.zIndex = "-1";
	tempPiece.style.left = (this.piece.offsetLeft / this.baseSize) + "em";
	tempPiece.style.top = (this.piece.offsetTop / this.baseSize) + "em";
	
	// Intersection test with no offsets
	if (testFail = this.isIntersecting(tempPiece, 'all', {left: 0, top: 0})) {
		
		// If we're intersecting with the left or right wall,
		// check if we can move 1 space in the opposite direction to allow the rotate
		// the straight piece sometimes needs to rebound 2 steps off the wall
		var offset = 1;
		if ( this.piece.size === 4 &&
			((testFail === 'leftWall' && this.piece.rotate === 90) ||
			(testFail === 'rightWall' && this.piece.rotate === 270)) ) {
			offset = 2;
		}
		
		if (testFail === 'leftWall' && this.canMoveRight(tempPiece, offset)) {
			this.piece.style.left = (this.piece.offsetLeft / this.baseSize) + offset + "em";
			this.gameWrapper.removeChild(tempPiece);
			return true;
		} else if (testFail === 'rightWall' && this.canMoveLeft(tempPiece, offset)) {
			this.piece.style.left = (this.piece.offsetLeft / this.baseSize) - offset + "em";
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
		return 'otherBlocks';
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
		// Ignore blocks from the passed in object and the current piece
		if (allBlocks[i].parentNode !== object && allBlocks[i].parentNode !== this.piece) {
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
	this.nextElement.removeChild(this.nextPiece);
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
	//console.log(numRows);
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
	this.score += this.dropLength;
	this.dropLength = 0;
};

// show the requested button
BlockDropGame.prototype.showDialog = function(dialog)
{
	var tempHTML; // need to build up HTML before applying it to innerHTML
	
	switch (dialog) {
		case "start":
			this.startButton = document.createElement("div");
			this.startButton.setAttribute("id", "button-start");
			this.startButton.setAttribute("class", "button");
			this.startButton.innerHTML = "Start";
			this.gameWrapper.appendChild(this.startButton);
			break;
		case "about":
			this.aboutButton = document.createElement("div");
			this.aboutButton.setAttribute("id", "button-about");
			this.aboutButton.setAttribute("class", "button");
			this.aboutButton.innerHTML = "About";
			this.gameWrapper.appendChild(this.aboutButton);
			break;
		case "scores":
			this.scoresButton = document.createElement("div");
			this.scoresButton.setAttribute("id", "button-scores");
			this.scoresButton.setAttribute("class", "button");
			this.scoresButton.innerHTML = "High Scores";
			this.gameWrapper.appendChild(this.scoresButton);
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
		case "quit":
			this.quitButton = document.createElement("div");
			this.quitButton.setAttribute("id", "button-quit");
			this.quitButton.setAttribute("class", "button");
			this.quitButton.innerHTML = "Quit";
			this.gameWrapper.appendChild(this.quitButton);
			break;
		case "info":
			this.infoDialog = document.createElement("div");
			this.infoDialog.setAttribute("id", "dialog-info");
			this.infoDialog.setAttribute("class", "dialog");
			tempHTML = "<p>About BlockDrop</p>";
			tempHTML += "<div class='close-button'>x</div>";
			tempHTML += "<div class='inner-content'>";
			tempHTML += "<p>BlockDrop is a shameless Tetris&reg; clone using pure JavaScript, HTML and CSS. ";
			tempHTML += "I started writing it while teaching myself how to use JavaScript as a proper language and wean myself off jQuery. ";
			tempHTML += "I'm also using it as a testing platform for various JavaScript, HTML5 and CSS3 features. ";
			tempHTML += "I've tested in Chrome, Firefox, IE 9/10 and Chrome for Android so it should work on most modern platforms.</p>";
			tempHTML += "<p>Controls:<p>";
			tempHTML += "<p><span class='key'>&#x25C0;</span> <span class='key'>a</span> <span class='key'>h</span> or swipe &larr;<br />moves the piece left</p>";
			tempHTML += "<p><span class='key'>&#x25B6;</span> <span class='key'>d</span> <span class='key'>l</span> or swipe &rarr;<br />moves the piece right</p>";
			tempHTML += "<p><span class='key'>&#x25B2;</span> <span class='key'>w</span> <span class='key'>k</span> swipe &uarr;, or single tap<br />rotates the piece 90&deg; clock-wise</p>";
			tempHTML += "<p><span class='key'>&#x25BC;</span> <span class='key'>s</span> <span class='key'>j</span> or swipe &darr;<br />soft drops the piece (drop line by line)</p>";
			tempHTML += "<p><span class='key key-long'>spacebar</span> or <span class='key key-long'>&crarr; enter</span><br />hard drops the piece (drop all the way to the bottom)</p>";
			tempHTML += "<p><br />GitHub: view the <a href='https://github.com/bkbooth/BlockDrop' target='_blank'>source code</a> or <a href='https://github.com/bkbooth' target='_blank'>find me</a></p>";
			tempHTML += "</div>";
			this.infoDialog.innerHTML = tempHTML;
			this.gameWrapper.parentNode.appendChild(this.infoDialog);
			break;
		case "finish":
			this.finishDialog = document.createElement("div");
			this.finishDialog.setAttribute("id", "dialog-finish");
			this.finishDialog.setAttribute("class", "dialog");
			tempHTML = "<p>Game Over!</p>";
			tempHTML += "<div class='close-button'>x</div>";
			tempHTML += "<div class='inner-content'>";
			tempHTML += "<p>Your score was:<br /><span class='score'>" + this.score + "</span></p>";
			tempHTML += "<p>Enter your name below to save the high score:</p>";
			tempHTML += "<input id='score_name' placeholder='Your name...' />";
			tempHTML += "</div>";
			this.finishDialog.innerHTML = "<p>Game over!<br />Your score was: " + this.score + "</p>";
			this.finishDialog.innerHTML += "<div class='close-button'>x</div>";
			this.finishDialog.innerHTML = tempHTML;
			this.gameWrapper.appendChild(this.finishDialog);
			this.scoreName = document.getElementById("score_name");
			this.scoreName.focus();
			break;
		case "scores-dialog":
			this.highScoresDialog = document.createElement("div");
			this.highScoresDialog.setAttribute("id", "dialog-scores");
			this.highScoresDialog.setAttribute("class", "dialog");
			tempHTML = "<p>Local High Scores</p>";
			tempHTML += "<div class='close-button'>x</div>";
			tempHTML += "<div class='inner-content'>";
			tempHTML += "<table><thead><tr><th>&nbsp</th><th>Score</th><th>Player</th></tr></thead><tbody>";
			for (var i = 0; i < this.highScores.length; i++) {
				tempHTML += "</tr><th>" + (i + 1) + "</th>";
				tempHTML += "<td>" + this.highScores[i].score + "</td>";
				tempHTML += "<td>" + this.highScores[i].name + "</td></tr>";
			}
			tempHTML += "</tbody></table></div>";
			this.highScoresDialog.innerHTML = tempHTML;
			this.gameWrapper.parentNode.appendChild(this.highScoresDialog);
			break;
		default:
			break;
	}
};

// hide the requested button or dialog, accepts a string or an object
BlockDropGame.prototype.hideDialog = function(dialog)
{
	if (typeof dialog === "object" && (
		dialog === this.startButton ||
		dialog === this.aboutButton ||
		dialog === this.scoresButton ||
		dialog === this.pauseButton ||
		dialog === this.resumeButton ||
		dialog === this.quitButton ||
		dialog === this.infoDialog ||
		dialog === this.finishDialog ||
		dialog === this.highScoresDialog
	)) {
		dialog.parentNode.removeChild(dialog);
	} else if (typeof dialog === "string") {
		switch (dialog) {
			case "start":
				this.startButton.parentNode.removeChild(this.startButton);
				this.startButton = null;
				break;
			case "about":
				this.aboutButton.parentNode.removeChild(this.aboutButton);
				this.aboutButton = null;
				break;
			case "scores":
				this.scoresButton.parentNode.removeChild(this.scoresButton);
				this.scoresButton = null;
				break;
			case "pause":
				this.pauseButton.parentNode.removeChild(this.pauseButton);
				this.pauseButton = null;
				break;
			case "resume":
				this.resumeButton.parentNode.removeChild(this.resumeButton);
				this.resumeButton = null;
				break;
			case "quit":
				this.quitButton.parentNode.removeChild(this.quitButton);
				this.quitButton = null;
				break;
			case "info":
				this.infoDialog.parentNode.removeChild(this.infoDialog);
				this.infoDialog = null;
				break;
			case "finish":
				this.finishDialog.parentNode.removeChild(this.finishDialog);
				this.finishDialog = null;
				this.scoreName = null;
				break;
			case "scores-dialog":
				this.highScoresDialog.parentNode.removeChild(this.highScoresDialog);
				this.highScoresDialog = null;
				break;
			default:
				break;
		}
	}
};

// clear the timer, hide the game board
BlockDropGame.prototype.pauseGame = function()
{
	// clear the game timer and set the game state
	clearTimeout(this._intervalId);
	this.isPlaying = false;
	
	// hide all blocks
	var allBlocks = this.gameWrapper.getElementsByClassName("piece-block");
	for (var i = 0; i < allBlocks.length; i++) {
		allBlocks[i].style.display = "none";
	}
	this.nextPiece.style.display = "none";
	
	// show/hide the relevant dialogs
	this.hideDialog("pause");
	this.showDialog("resume");
	this.showDialog("quit");
};

// clear the timer, show the game board
BlockDropGame.prototype.resumeGame = function()
{
	// show all blocks 
	var allBlocks = this.gameWrapper.getElementsByClassName("piece-block");
	for (var i = 0; i < allBlocks.length; i++) {
		allBlocks[i].style.display = "block";
	}
	this.nextPiece.style.display = "block";
	
	// set the game state and restart the timer
	this.isPlaying = true;
	this._intervalId = setInterval(this.update.bind(this), 1000 / this.level);
	
	// show/hide the relevant dialogs
	this.hideDialog("resume");
	this.hideDialog("quit");
	this.showDialog("pause");
};

// set the game state, clear the board and hide/show relevant dialogs
BlockDropGame.prototype.finishGame = function(quit)
{
	this.isPlaying = false;
	this.clearGameBoard();
	
	if (quit) {
		this.hideDialog("resume");
		this.hideDialog("quit");
		this.showDialog("start");
		this.showDialog("about");
		this.showDialog("scores");
	} else {
		this.hideDialog("pause");
		this.showDialog("finish");
	}
}

// load the saved scores from localStorage
BlockDropGame.prototype.loadScores = function() {
	// get the number of saved scores
	this.numSavedScores = parseInt(localStorage.getItem("blockdrop.numscores"), 10) || 0;
	
	// loop through loading scores from localStorage
	for (var i = 0; i < this.numSavedScores; i++) {
		this.highScores[i] = {};
		this.highScores[i].name = localStorage.getItem("blockdrop.scores." + i + ".name");
		this.highScores[i].score = parseInt(localStorage.getItem("blockdrop.scores." + i + ".score"), 10);
	}
}

// save the users input name with their score
BlockDropGame.prototype.saveScore = function() {
	// update and sort the saved scores object array
	this.highScores[this.numSavedScores] = {};
	this.highScores[this.numSavedScores].name = this.scoreName.value;
	this.highScores[this.numSavedScores].score = this.score;
	this.highScores.sort(this.scoreCompare);
	
	// increment the number of saved scores (max 20)
	this.numSavedScores++;
	if (this.numSavedScores > 20) {
		this.numSavedScores = 20;
	}
	
	// loop through and save all of the scores back to localStorage
	for (var i = 0; i < this.numSavedScores; i++) {
		localStorage.setItem("blockdrop.scores." + i + ".name", this.highScores[i].name);
		localStorage.setItem("blockdrop.scores." + i + ".score", this.highScores[i].score);
	}
	localStorage.setItem("blockdrop.numscores", this.numSavedScores);
}

// left key or left swipe handler
BlockDropGame.prototype.moveLeftHandler = function()
{
	if (this.canMoveLeft()) {
		this.piece.style.left = (this.piece.offsetLeft / this.baseSize) - 1 + "em";
	}
};

// right key or right swipe handler
BlockDropGame.prototype.moveRightHandler = function()
{
	if (this.canMoveRight()) {
		this.piece.style.left = (this.piece.offsetLeft / this.baseSize) + 1 + "em";
	}
};

// down key or swipe down handler
BlockDropGame.prototype.moveDownHandler = function()
{
	clearInterval(this._intervalId);
	
	if (this.canMoveDown()) {
		this.piece.style.top = (this.piece.offsetTop / this.baseSize) + 1 + "em";
		this.dropLength++;
	} else {
		// if we can't move down, start a timer to trigger a game update
		if (this._dropWaitId === null) {
			this._dropWaitId = setTimeout(this.update.bind(this), 500 / this.level);
		} 
		return;
	}
	
	this._intervalId = setInterval(this.update.bind(this), 1000 / this.level);
};

// hard drop drops the piece all the way to the bottom
BlockDropGame.prototype.hardDropHandler = function()
{
	while (this._dropWaitId === null) {
		this.moveDownHandler();
	}
	// force an update straight away after hard drop
	this.hardDropped = true;
}

// up key or swipe up handler
BlockDropGame.prototype.rotateHandler = function()
{
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

// compare two score objects
BlockDropGame.prototype.scoreCompare = function(a, b)
{
	if (a.score < b.score) {
		return 1;
	} else if (a.score > b.score) {
		return -1;
	} else {
		return 0;
	}
}

// Setup the event listeners
BlockDropGame.prototype.setupEventListeners = function()
{
	var that = this;
	var wrapperElement = this.gameWrapper.parentNode;
	
	wrapperElement.addEventListener("click", function(event)
	{
		if (event.target === that.startButton) {
			// start the game
			that.startGame();
			event.preventDefault();
		} else if (event.target === that.aboutButton) {
			// hide the start and about buttons, show the info dialog
			that.hideDialog("start");
			that.hideDialog("about");
			that.hideDialog("scores");
			that.showDialog("info");
			event.preventDefault();
		} else if (event.target === that.scoresButton) {
			// hide the start and about buttons, show the high scores dialog
			that.hideDialog("start");
			that.hideDialog("about");
			that.hideDialog("scores");
			that.showDialog("scores-dialog");
			event.preventDefault();
		} else if (event.target === that.pauseButton) {
			// pause the game
			that.pauseGame();
			event.preventDefault();
		} else if (event.target === that.resumeButton) {
			// resume the game
			that.resumeGame();
			event.preventDefault();
		} else if (event.target === that.quitButton) {
			// quit the game
			that.finishGame(true);
			event.preventDefault();
		} else if (that.infoDialog && event.target === that.infoDialog.getElementsByClassName("close-button")[0]) {
			// hide the dialog, show the start and about buttons
			that.hideDialog("info");
			that.showDialog("start");
			that.showDialog("about");
			that.showDialog("scores");
			event.preventDefault();
		} else if (that.finishDialog && event.target === that.finishDialog.getElementsByClassName("close-button")[0]) {
			// hide the dialog, show the start and about buttons
			that.hideDialog("finish");
			that.showDialog("start");
			that.showDialog("about");
			that.showDialog("scores");
			event.preventDefault();
		} else if (that.highScoresDialog && event.target === that.highScoresDialog.getElementsByClassName("close-button")[0]) {
			// hide the dialog, show the start and about buttons
			that.hideDialog("scores-dialog");
			that.showDialog("start");
			that.showDialog("about");
			that.showDialog("scores");
			event.preventDefault();
		}
	});
	
	// still needs to be window?
	window.addEventListener("keydown", function(event)
	{
		var keyPressed = event.KeyCode || event.which;
		//console.log(keyPressed);
		//console.log(event);
		
		if (that.scoreName && event.target === that.scoreName && event.keyCode !== 27) {
			// when the user is inputting their name, only allow escape to flow
			// through to the rest of the event handler
			if (event.keyCode === 13) {
				// enter key pressed
				that.saveScore();
				that.hideDialog("finish");
				that.showDialog("scores-dialog");
			}
			return;
		}
		
		if (keyPressed === 18) {
			// alt key pressed, highlight first letter of buttons
			var buttons = that.gameWrapper.parentNode.getElementsByClassName("button");
			for (var i = 0; i < buttons.length; i++) {
				buttons[i].setAttribute("class", "button hl-first");
			}
			event.preventDefault();
		}
		
		// split the touch controls into game and menu controls
		if (that.isPlaying && !that.hardDropped) {
			// game is playing
			switch (keyPressed) {
				case 37:	// left key
				case 72:	// 'h' key
				case 65:	// 'a' key
					that.moveLeftHandler();
					event.preventDefault();
					break;
				case 39:	// right key
				case 76:	// 'l' key
				case 68:	// 'd' key
					that.moveRightHandler();
					event.preventDefault();
					break;
				case 38:	// up key
				case 75:	// 'k' key
				case 87:	// 'w' key
					that.rotateHandler();
					event.preventDefault();
					break;
				case 40:	// down key
				case 74:	// 'j' key
				case 83:	// 's' key
					that.moveDownHandler();
					event.preventDefault();
					break;
				case 13:	// enter key
				case 32:	// space key
					that.hardDropHandler();
					event.preventDefault();
					break;
				case 27:	// esc key
				case 80:	// 'p' key
					that.pauseGame();
					event.preventDefault();
					break;
			}
		} else if (!that.isPlaying) {
			// game not playing
			switch (keyPressed) {
				case 13:	// enter key
				case 32:	// space key
					if (that.startButton) {
						that.startGame();
					} else if (that.resumeButton) {
						that.resumeGame();
					}
					event.preventDefault();
					break;
				case 83:	// 's' key
					if (that.startButton) { that.startGame(); }
					event.preventDefault();
					break;
				case 65:	// 'a' key
					if (that.aboutButton) {
						that.hideDialog("start");
						that.hideDialog("about");
						that.hideDialog("scores");
						that.showDialog("info");
					} else if (that.infoDialog) {
						that.hideDialog("info");
						that.showDialog("start");
						that.showDialog("about");
						that.showDialog("scores");
					}
					event.preventDefault();
					break;
				case 72:	// 'h' key
					if (that.scoresButton) {
						that.hideDialog("start");
						that.hideDialog("about");
						that.hideDialog("scores");
						that.showDialog("scores-dialog");
					} else if (that.highScoresDialog) {
						that.hideDialog("scores-dialog");
						that.showDialog("start");
						that.showDialog("about");
						that.showDialog("scores");
					}
					event.preventDefault();
					break;
				case 82:	// 'r' key
					if (that.resumeButton) { that.resumeGame(); }
					event.preventDefault();
					break;
				case 81:	// 'q' key
					if (that.quitButton) { that.finishGame(true); }
					event.preventDefault();
					break;
				case 27:	// esc key
				case 88:	// 'x' key
					if (that.infoDialog) {
						that.hideDialog("info");
						that.showDialog("start");
						that.showDialog("about");
						that.showDialog("scores");
					} else if (that.finishDialog) {
						that.hideDialog("finish");
						that.showDialog("start");
						that.showDialog("about");
						that.showDialog("scores");
					} else if (that.highScoresDialog) {
						that.hideDialog("scores-dialog");
						that.showDialog("start");
						that.showDialog("about");
						that.showDialog("scores");
					}
					event.preventDefault();
					break;
			}
		}
	});
	
	window.addEventListener("keyup", function(event)
	{
		var keyPressed = event.KeyCode || event.which;
		
		if (keyPressed === 18) {
			// alt key released, undo highlight first letter of buttons
			var buttons = that.gameWrapper.parentNode.getElementsByClassName("button");
			for (var i = 0; i < buttons.length; i++) {
				buttons[i].setAttribute("class", "button");
			}
			event.preventDefault();
		}
	});
	
	wrapperElement.addEventListener("touchstart", function(event)
	{
		// don't detect touch unless the game is playing
		if (!that.isPlaying) {
			return;
		}
		
		// set the location for the start of the touch
		that.touchStartX = event.changedTouches[0].clientX;
		that.touchStartY = event.changedTouches[0].clientY;
		that.touchMoved = false;
		that.touchBlocked = false;
	});
	
	wrapperElement.addEventListener("touchend", function(event)
	{
		// don't detect touch unless the game is playing
		if (!that.isPlaying) {
			return;
		}
		
		// event.preventDefault on the "touchmove" handler causes the "touchend" event to still fire
		// so we need to detect if we've moved the piece during the touch event cycle
		if (!that.touchMoved && event.target !== that.pauseButton) {
			that.rotateHandler();
			event.preventDefault();
		}
	});
	
	wrapperElement.addEventListener("touchmove", function(event)
	{
		if (!that.isPlaying || that.touchBlocked) {
			return;
		}

		// calculate the move
		var touchEndX = event.changedTouches[0].clientX;
		var touchEndY = event.changedTouches[0].clientY;
		var touchMoveX = touchEndX - that.touchStartX;
		var touchMoveY = touchEndY - that.touchStartY;
		var touchBlockTime = null; // want slower movements sideways than downwards
		
		// lets check what kind of movement
		if (Math.abs(touchMoveX) > Math.abs(touchMoveY) && that.touchMoved !== 'y') {
			// horizontal swipe
			that.touchMoved = 'x';
			if (touchMoveX > 0) {
				// right swipe
				that.moveRightHandler();
			} else {
				// left swipe
				that.moveLeftHandler();
			}
			touchBlockTime = 40;
			event.preventDefault(); // allow to swipe and hold down
		} else if (Math.abs(touchMoveX) <= Math.abs(touchMoveY) && that.touchMoved !== 'x') {
			// vertical swipe
			if (touchMoveY > 0) {
				// down swipe
				that.touchMoved = 'y';
				that.moveDownHandler();
				event.preventDefault(); // allow to swipe and hold down
			} else if (!that.touchMoved) {
				// up swipe
				that.rotateHandler();
			}
			touchBlockTime = 5;
		}
		
		that.touchBlocked = true;
		setTimeout(function() {
			this.touchBlocked = false;
		}.bind(that), touchBlockTime);
	});
};

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
	
	
	// Create and return a new Tetris piece, can be random or a pre-defined piece.
	create: function(pieceIndex, initRotate)
	{
		// Use the passed in starting rotation or set it to 0
		if (!(initRotate >= 0 && initRotate < 360 && initRotate % 90 === 0)) {
			initRotate = 0;
		}
		
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
		newPiece.rotate = initRotate;
		newPiece.size = pieceBlueprint.size;
		newPiece.pieceIndex = pieceIndex;
		
		// Size of the new piece
		// positioning not handled here anymore, caller sets position
		newPiece.style.width = newPiece.size + "em";
		newPiece.style.height = newPiece.size + "em";
		
		// Loop through the blocks defined in the piece blueprint
		newPiece.blocksMap["rot"+newPiece.rotate].forEach(function(offsets) {
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
