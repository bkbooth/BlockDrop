/*
 * BlockDrop - A shameless Tetris clone
 * UI elements, buttons, dialogs, etc.
 * Ben Booth
 * bkbooth at gmail dot com
 */

BlockDrop.namespace("BlockDrop.Game.UI");

BlockDrop.Game.UI = (function(UI) {
    "use strict";
    console.log("BlockDrop.Game.UI");

    // Dependencies
    var PieceFactory = BlockDrop.Game.PieceFactory,
        Score = BlockDrop.Game.Score,
        HighScores = BlockDrop.Game.HighScores,
        Settings = BlockDrop.Game.Settings,
        TemplateEngine = BlockDrop.TemplateEngine,
        Utils = BlockDrop.Utils;

    // Local variables
    var baseSize = 30,  // The base font size, can resize the whole board with this
        elements = {};  // Container for the DOM elements we want to use later

    /**
     * First time setup, create the game board from template and setup all DOM elements
     *
     * @param {HTMLElement} target
     */
    var initialise = function(target) {
        var gameWidth = 16.5,
            gameHeight = 21.0,
            gameRatio;

        // Set the base size
        gameRatio = gameWidth / gameHeight;
        if (window.innerWidth / window.innerHeight > gameRatio) {
            // Extra horizontal space
            baseSize = Math.floor(window.innerHeight / gameHeight);
        } else {
            // Extra vertical space
            baseSize = Math.floor(window.innerWidth / gameWidth);
        }
        document.querySelector("body").style.fontSize = baseSize + "px";

        // Load the game board from template
        target.appendChild( TemplateEngine.get("template/board.tpl.html", {
            margin: Math.floor((window.innerHeight - (baseSize * gameHeight)) / 2),
            settingsMusic: Settings.get("music"),
            settingsSound: Settings.get("sound")
        }) );

        // Setup the wrappers, elements and buttons from the created template
        setElement("wrappers.game", target.querySelector("#game-board"));
        setElement("wrappers.info", target.querySelector("#game-info"));
        setElement("wrappers.next", target.querySelector("#game-next").querySelector(".container"));
        setElement("status.score", target.querySelector("#game-score").querySelector(".value"));
        setElement("status.level", target.querySelector("#game-level").querySelector(".value"));
        setElement("status.lines", target.querySelector("#game-lines").querySelector(".value"));
        setElement("buttons.music", target.querySelector("#button-music"));
        setElement("buttons.sound", target.querySelector("#button-sound"));

        // Create buttons
        setElement("buttons.start", TemplateEngine.get("template/button.tpl.html", { name: "start", value: "Start" }));
        setElement("buttons.about", TemplateEngine.get("template/button.tpl.html", { name: "about", value: "About" }));
        setElement("buttons.scores", TemplateEngine.get("template/button.tpl.html", { name: "scores", value: "High Scores" }));
        setElement("buttons.pause", TemplateEngine.get("template/button.tpl.html", { name: "pause", value: "Pause" }));
        setElement("buttons.resume", TemplateEngine.get("template/button.tpl.html", { name: "resume", value: "Resume" }));
        setElement("buttons.quit", TemplateEngine.get("template/button.tpl.html", { name: "quit", value: "Quit" }));

        // Create dialogs, 'finish' and 'scores' will be updated after a game is finished
        // but their templates will be cached by loading them here
        setElement("dialogs.info", TemplateEngine.get("template/dialog.tpl.html", {
            name: "info",
            title: "About BlockDrop",
            content: TemplateEngine.getString("template/about.tpl.html")
        }));
        setElement("dialogs.finish", TemplateEngine.get("template/dialog.tpl.html", {
            name: "finish",
            title: "Game Over!",
            content: TemplateEngine.getString("template/finish.tpl.html", { score: Score.getScore() })
        }));
        setElement("inputs.name", getElement("dialogs.finish").querySelector("#score_name"));
        setElement("dialogs.scores", TemplateEngine.get("template/dialog.tpl.html", {
            name: "scores",
            title: "High Scores",
            content: TemplateEngine.getString("template/scores.tpl.html", { scores: HighScores.get() })
        }));
    };

    /**
     * Get the calculated base size
     *
     * @returns {Number}
     */
    var getBaseSize = function() {
        return baseSize;
    };

    /**
     * Add a DOM element to the elements object using a namespace style
     *
     * @param {String} name - Namespace style reference
     * @param {HTMLElement} element - DOM element to add to elements object
     *
     * @returns {HTMLElement} DOM element passed in, now added to the elements object
     */
    var setElement = function(name, element) {
        var parts = name.split("."),
            parent = elements,
            i, n;

        // Build up the element properties like a namespace
        for (i = 0, n = parts.length; i < n; i++) {
            if (i === n - 1) {
                parent[parts[i]] = element;
            } else if (typeof parent[parts[i]] === "undefined") {
                // create property if it doesn't exist
                parent[parts[i]] = {};
            }

            parent = parent[parts[i]];
        }

        return element;
    };

    /**
     * Get a DOM element from the elements object
     *
     * @param {String} name - Namespace style reference
     *
     * @returns {HTMLElement|Boolean} Requested DOM element or false
     */
    var getElement = function(name) {
        var parts = name.split("."),
            parent = elements,
            i, n;

        // Loop through the properties
        for (i = 0, n = parts.length; i < n; i++) {
            if (typeof parent[parts[i]] === "undefined") {
                return false;
            } else {
                parent = parent[parts[i]];
            }
        }

        // Return the found property
        return parent;
    };

    /**
     * Create the initial and next game pieces
     */
    var loadFirstPieces = function() {
        var gameBoard = getElement("wrappers.game"),
            nextWrapper = getElement("wrappers.next"),
            currentPiece,
            nextPiece;

        currentPiece = gameBoard.appendChild( setElement("pieces.current", PieceFactory.create()) );
        currentPiece.style.top = -1 + "em";
        currentPiece.style.left = (5 - Math.round( Utils.getIntData(currentPiece, "size") / 2 )) + "em";

        nextPiece = nextWrapper.appendChild( setElement("pieces.next", PieceFactory.create()) );
        nextPiece.style.top = ((4 - Utils.getIntData(nextPiece, "size")) / 2) + "em";
        nextPiece.style.left = ((4 - Utils.getIntData(nextPiece, "size")) / 2) + "em";
    };

    /**
     * Copy the next piece to the current piece and create a new next piece
     *
     * @returns {HTMLElement} new current piece
     */
    var loadNextPiece = function() {
        var gameBoard = getElement("wrappers.game"),
            nextWrapper = getElement("wrappers.next"),
            nextPiece = getElement("pieces.next"),
            currentPiece;

        // Copy the next piece to the current piece and set it up
        currentPiece = setElement("pieces.current", nextWrapper.removeChild(nextPiece));
        gameBoard.appendChild(currentPiece);
        currentPiece.style.top = -1 + "em";
        currentPiece.style.left = (5 - Math.round( Utils.getIntData(currentPiece, "size") / 2 )) + "em";

        // Create a new next piece
        nextPiece = setElement("pieces.next", nextWrapper.appendChild(PieceFactory.create()));
        nextPiece.style.top = ((4 - Utils.getIntData(nextPiece, "size")) / 2) + "em";
        nextPiece.style.left = ((4 - Utils.getIntData(nextPiece, "size")) / 2) + "em";

        return currentPiece;
    };

    /**
     * Move the piece one space to the left
     *
     * @param {HTMLElement} [piece] - Game piece
     */
    var moveLeft = function(piece) {
        piece = piece || getElement("pieces.current");
        piece.style.left = (piece.offsetLeft / getBaseSize()) - 1 + "em";
    };

    /**
     * Move the piece one space to the right
     *
     * @param {HTMLElement} [piece] - Game piece
     */
    var moveRight = function(piece) {
        piece = piece || getElement("pieces.current");
        piece.style.left = (piece.offsetLeft / getBaseSize()) + 1 + "em";
    };

    /**
     * Move the piece one space down
     *
     * @param {HTMLElement} [piece] - Game piece
     */
    var moveDown = function(piece) {
        piece = piece || getElement("pieces.current");
        piece.style.top = (piece.offsetTop / getBaseSize()) + 1 + "em";
    };

    /**
     * Rotate the current game piece
     *
     * @param {HTMLElement} [piece] - Game piece
     */
    var rotate = function(piece) {
        piece = piece || getElement("pieces.current");

        var rotation = Utils.getIntData(piece, "rotate"),
            blocks, blocksMap,
            i, n;

        rotation += 90;
        if (rotation >= 360) {
            rotation = 0;
        }

        // Loop through the blocks in the current piece
        blocks = piece.querySelectorAll(".piece-block");
        blocksMap = PieceFactory.getMap( Utils.getIntData(piece, "index"), rotation );
        for (i = 0, n = blocks.length; i < n; i++) {
            // Update their positions to the next rotation step
            blocks[i].style.left = blocksMap[i].left + "em";
            blocks[i].style.top = blocksMap[i].top + "em";
        }

        Utils.setIntData(piece, "rotate", rotation);
    };

    /**
     * Show a specific view
     *
     * @param {String} name - View to show
     */
    var show = function(name) {
        var gameBoard = getElement("wrappers.game"),
            gameWrapper = gameBoard.parentNode,
            infoWrapper = getElement("wrappers.info"),
            inputName;

        hideAllElements();

        switch(name) {
            case "menu":
                showElement(getElement("buttons.start"), gameBoard);
                showElement(getElement("buttons.about"), gameBoard);
                showElement(getElement("buttons.scores"), gameBoard);
                break;
            case "info":
                showElement(getElement("dialogs.info"), gameWrapper);
                break;
            case "scores":
                setElement("dialogs.scores", TemplateEngine.get("template/dialog.tpl.html", {
                    name: "scores",
                    title: "High Scores",
                    content: TemplateEngine.getString("template/scores.tpl.html", { scores: HighScores.get() })
                }));
                showElement(getElement("dialogs.scores"), gameWrapper);
                break;
            case "game":
                showAllBlocks();
                showElement(getElement("buttons.pause"), infoWrapper);
                break;
            case "pause-menu":
                hideAllBlocks();
                showElement(getElement("buttons.resume"), gameBoard);
                showElement(getElement("buttons.quit"), gameBoard);
                break;
            case "finish":
                setElement("dialogs.finish", TemplateEngine.get("template/dialog.tpl.html", {
                    name: "finish",
                    title: "Game Over!",
                    content: TemplateEngine.getString("template/finish.tpl.html", { score: Score.getScore() })
                }));
                inputName = setElement("inputs.name", getElement("dialogs.finish").querySelector("#score_name"));
                showElement(getElement("dialogs.finish"), gameWrapper);
                inputName.focus();
        }
    };

    /**
     * Check if UI element is visible
     *
     * @param {HTMLElement} element - DOM node
     *
     * @returns {Boolean}
     */
    var isVisible = function(element) {
        return element && element.dataset.visible === "true";
    };

    /**
     * Update the info DOM elements
     */
    var drawElements = function() {
        var score = getElement("status.score"),
            lines = getElement("status.lines"),
            level = getElement("status.level");

        score.innerHTML = Score.getScore();
        lines.innerHTML = Score.getLines();
        level.innerHTML = Score.getLevel();
    };

    /**
     * Remove the piece wrapper and place the blocks on the game board
     * This is needed to detect and remove completed rows
     *
     * @param {HTMLElement} [piece] - Game piece
     */
    var addCurrentPieceToBoard = function(piece) {
        piece = piece || getElement("pieces.current");

        var pieceBlocks = piece.querySelectorAll(".piece-block"),
            gameBoard = getElement("wrappers.game"),
            baseSize = getBaseSize(),
            newLeft, newTop, newBlock,
            i, n;

        // Loop through each of the blocks in the piece
        for (i = 0, n = pieceBlocks.length; i < n; i++) {
            // Get new left and top relative to the game board
            newLeft = piece.offsetLeft + pieceBlocks[i].offsetLeft;
            newTop = piece.offsetTop + pieceBlocks[i].offsetTop;

            // Remove the block from the piece and update it's position
            newBlock = piece.removeChild(pieceBlocks[i]);
            newBlock.style.left = (newLeft / baseSize) + "em";
            newBlock.style.top = (newTop / baseSize) + "em";

            // Add the block back in as a child of the game board
            gameBoard.appendChild(newBlock);
        }

        // Remove the now empty piece from the board
        gameBoard.removeChild(piece);
    };

    /**
     * Create and return a list of rows which are full of blocks
     *
     * @returns {Array<Number>}
     */
    var findCompleteRows = function() {
        var allBlocks = getElement("wrappers.game").querySelectorAll(".piece-block"),
            baseSize = getBaseSize(),
            completeRows = [],
            i, j, k, n;

        // Check 20 rows from the bottom up
        for (i = 19; i >= 0; i--) {
            // Check 10 columns from left to right
            for (j = 0; j < 10; j++) {
                // Check all blocks in the game board
                for (k = 0, n = allBlocks.length; k < n; k++) {
                    // If we find a block at this row and column we can exit early
                    if (allBlocks[k].offsetTop === i * baseSize &&
                        allBlocks[k].offsetLeft === j * baseSize) {
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

    /**
     * Clear a single complete row and drop all blocks above it a single line
     *
     * @param {Number} completeRow
     */
    var clearCompleteRow = function(completeRow) {
        var allBlocks = getElement("wrappers.game").querySelectorAll(".piece-block"),
            baseSize = getBaseSize(),
            blocksToRemove = [],
            i, n;

        // Loop through all blocks on the game board
        for (i = 0, n = allBlocks.length; i < n; i++) {
            if (allBlocks[i].offsetTop === completeRow * baseSize) {
                // If the block is in this row, push it to be removed
                // directly removing here breaks the loop
                blocksToRemove.push(allBlocks[i]);
            } else if (allBlocks[i].offsetTop < completeRow * baseSize) {
                // If the block is above the row being removed, drop it 1 space
                allBlocks[i].style.top = (allBlocks[i].offsetTop / baseSize) + 1 + "em";
            }
        }

        // Now lets go through and remove all the blocks in the row
        for (i = 0; i < blocksToRemove.length; i++) {
            blocksToRemove[i].parentNode.removeChild(blocksToRemove[i]);
        }
    };

    /**
     * Clear the current game board before starting a new game
     */
    var clearGameBoard = function() {
        // Get all blocks from the game board
        var gameBoard = getElement("wrappers.game"),
            allBlocks = gameBoard.querySelectorAll(".piece-block"),
            currentPiece = getElement("pieces.current"),
            nextPiece = getElement("pieces.next"),
            nextWrapper = getElement("wrappers.next"),
            i, n;

        for (i = 0, n = allBlocks.length; i < n; i++) {
            if (allBlocks[i].parentNode !== currentPiece) {
                gameBoard.removeChild(allBlocks[i]);
            }
        }

        // Remove the current and next pieces
        gameBoard.removeChild(currentPiece);
        nextWrapper.removeChild(nextPiece);
    };

    /**
     * Hide a DOM element
     *
     * @param {HTMLElement} element - The DOM element to hide
     *
     * @returns {HTMLElement} The now detached DOM element
     */
    var hideElement = function(element) {
        element.dataset.visible = "false";
        return element.parentNode.removeChild(element);
    };

    /**
     * Show a DOM element
     *
     * @param {HTMLElement} element - The DOM element to show
     * @param {HTMLElement} target - The parent to attach the DOM element to
     *
     * @returns {HTMLElement} The now attached and visible DOM element
     */
    var showElement = function(element, target) {
        element.dataset.visible = "true";
        return target.appendChild(element);
    };

    /**
     * Hide all buttons and dialogs
     */
    var hideAllElements = function() {
        var i, n,
            allElements = [
            getElement("buttons.start"),
            getElement("buttons.about"),
            getElement("buttons.scores"),
            getElement("buttons.pause"),
            getElement("buttons.resume"),
            getElement("buttons.quit"),
            getElement("dialogs.info"),
            getElement("dialogs.finish"),
            getElement("dialogs.scores")
        ];

        for (i = 0, n = allElements.length; i < n; i++) {
            if (isVisible(allElements[i])) {
                hideElement(allElements[i]);
            }
        }
    };

    /**
     * Hide all blocks on the game board
     */
    var hideAllBlocks = function() {
        var allBlocks = getElement("wrappers.game").querySelectorAll(".piece-block"),
            nextPiece = getElement("pieces.next"),
            i, n;

        for (i = 0, n = allBlocks.length; i < n; i++) {
            allBlocks[i].style.display = "none";
        }
        nextPiece.style.display = "none";
    };

    /**
     * Show all blocks on the game board
     */
    var showAllBlocks = function() {
        var allBlocks = getElement("wrappers.game").querySelectorAll(".piece-block"),
            nextPiece = getElement("pieces.next"),
            i, n;

        for (i = 0, n = allBlocks.length; i < n; i++) {
            allBlocks[i].style.display = "block";
        }
        nextPiece.style.display = "block";
    };

    // Public interface
    UI.initialise = initialise;
    UI.getBaseSize = getBaseSize;
    UI.getElement = getElement;
    UI.loadFirstPieces = loadFirstPieces;
    UI.loadNextPiece = loadNextPiece;
    UI.moveLeft = moveLeft;
    UI.moveRight = moveRight;
    UI.moveDown = moveDown;
    UI.rotate = rotate;
    UI.show = show;
    UI.isVisible = isVisible;
    UI.drawElements = drawElements;
    UI.addCurrentPieceToBoard = addCurrentPieceToBoard;
    UI.findCompleteRows = findCompleteRows;
    UI.clearCompleteRow = clearCompleteRow;
    UI.clearGameBoard = clearGameBoard;

    return UI;

})(BlockDrop.Game.UI);
