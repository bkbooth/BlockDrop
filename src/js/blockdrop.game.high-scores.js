/*
 * BlockDrop - A shameless Tetris clone
 * Scores handler
 * Ben Booth
 * bkbooth at gmail dot com
 */

BlockDrop.namespace("BlockDrop.Game.HighScores");

BlockDrop.Game.HighScores = (function(HighScores) {
    "use strict";
    console.log("BlockDrop.Game.HighScores");

    // Dependencies
    var Score = BlockDrop.Game.Score;

    // Local variables
    var highScores = [];

    /**
     * Compare two score objects
     *
     * @param {Object} a - Object with a score property
     * @param {Number} a.score
     * @param {Object} b - Object with a score property
     * @param {Number} b.score
     *
     * @returns {number} Comparison result
     */
    var scoreCompare = function(a, b) {
        if (a.score < b.score) {
            return 1;
        } else if (a.score > b.score) {
            return -1;
        } else {
            return 0;
        }
    };

    /**
     * Load high scores from localStorage
     */
    var load = function() {
        highScores = JSON.parse(localStorage.getItem("BlockDrop.scores")) || [];
    };

    /**
     * Compare new user's score with high scores list
     *
     * @param {String} name - Name of user
     */
    var save = function(name) {
        // Update and sort the high scores
        highScores[highScores.length] = {
            score: Score.getScore(),
            name: name
        };
        highScores.sort(scoreCompare);

        // Only keep 20 high scores
        if (highScores.length > 20) {
            highScores.length = 20;
        }

        // Save scores to localStorage
        localStorage.setItem("BlockDrop.scores", JSON.stringify(highScores));
    };

    /**
     * Get high scores list
     *
     * @returns {Array<Object>} List of high scores
     */
    var get = function() {
        return highScores;
    };

    // Public interface
    HighScores.load = load;
    HighScores.save = save;
    HighScores.get = get;

    return HighScores;

})(BlockDrop.Game.HighScores);
