/*
 * BlockDrop - A shameless Tetris clone
 * Main game logic
 * Ben Booth
 * bkbooth at gmail dot com
 */

BlockDrop.namespace("BlockDrop.Game");

BlockDrop.Game = (function (Game) {
    "use strict";
    console.log("BlockDrop.Game");

    // Dependencies
    var Settings = BlockDrop.Game.Settings,
        UI = BlockDrop.Game.UI,
        Score = BlockDrop.Game.Score,
        CollisionDetection = BlockDrop.Game.CollisionDetection,
        Input = BlockDrop.Game.Input,
        AudioLibrary = BlockDrop.AudioLibrary;

    // Local variables
    var dropTimer,          // Timer triggered when player is holding down until piece hits the bottom
        playing = false,    // Records the state of the game
        timer = null,       // The main game loop timer
        baseTime = 1000;    // The base time, 1 second

    var start = function() {
        UI.loadFirstPieces();

        Score.reset();
        UI.drawElements();

        playing = true;
        startTimer();

        UI.show("game");
    };

    /**
     * Clear the timer and hide the game board
     */
    var pause = function() {
        clearTimer();
        playing = false;

        UI.show("pause-menu");
    };

    /**
     * Restart the timer and show the game board
     */
    var resume = function() {
        playing = true;
        startTimer();

        UI.show("game");
    };

    /**
     * Set the game state, clear the board and hide/show relevant dialogs
     *
     * @param {Object} options
     * @param {Boolean} options.quit - Was the game quit or finished properly?
     */
    var finish = function(options) {
        playing = false;

        if (options && options.quit) {
            UI.show("menu");
        } else {
            UI.show("finish");
        }
    };

    /**
     * Automatically drop the current piece if possible
     * otherwise check for completed rows and then generate a new piece
     */
    var update = function() {
        var piece = UI.getElement("pieces.current"),
            completeRows, i;

        clearDropTimer();

        if (CollisionDetection.canMoveDown(piece)) {
            UI.moveDown(piece);
            Score.resetDropLength();
        } else {
            // Play the drop sound after delay on soft drop
            if (!Input.isHardDrop() && Settings.get("sound")) {
                AudioLibrary.play("drop");
            }
            Input.resetHardDrop();

            clearTimer();

            UI.addCurrentPieceToBoard();

            completeRows = UI.findCompleteRows();
            Score.incrementScore(completeRows.length);

            for (i = completeRows.length; i > 0; i--) {
                // Starting from the end of the array (highest complete row)
                // because when you clear the lower rows first the value
                // of the higher rows to clear would need to drop too
                UI.clearCompleteRow(completeRows[i - 1]);
                Score.incrementLines();

                // Increase the level if we just hit a multiple of 10 lines
                if (Score.getLines() % 10 === 0) {
                    Score.incrementLevel();
                }
            }

            piece = UI.loadNextPiece();

            if (CollisionDetection.isGameOver()) {
                finish({ quit: false });
            } else {
                startTimer();
            }

            UI.drawElements();
        }
    };

    /**
     * Is the game currently playing?
     *
     * @returns {Boolean}
     */
    var isPlaying = function() {
        return playing;
    };

    /**
     * Start the game timer
     */
    var startTimer = function() {
        timer = setInterval(update, baseTime / Score.getLevel());
    };

    /**
     * Clear the game timer
     */
    var clearTimer = function() {
        clearInterval(timer);
        timer = void 0;
    };

    /**
     * Start the drop timer
     *
     * @returns {Object} the timer object
     */
    var startDropTimer = function() {
        if (!dropTimer) {
            dropTimer = setTimeout(update, (baseTime / 2) / Score.getLevel());
        }

        return dropTimer;
    };

    /**
     * Clear the drop timer
     */
    var clearDropTimer = function() {
        clearTimeout(dropTimer);
        dropTimer = void 0;
    };

    /**
     * Check the status of the drop timer
     *
     * @returns {Boolean}
     */
    var isDropping = function() {
        return !!dropTimer;
    };

    // Public interface
    Game.start = start;
    Game.pause = pause;
    Game.resume = resume;
    Game.finish = finish;
    Game.isPlaying = isPlaying;
    Game.startTimer = startTimer;
    Game.clearTimer = clearTimer;
    Game.startDropTimer = startDropTimer;
    Game.isDropping = isDropping;

    return Game;

})(BlockDrop.Game);
