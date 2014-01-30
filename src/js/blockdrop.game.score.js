/*
 * BlockDrop - A shameless Tetris clone
 * Scores handler
 * Ben Booth
 * bkbooth at gmail dot com
 */

BlockDrop.namespace("BlockDrop.Game.Score");

BlockDrop.Game.Score = (function(Score) {
    "use strict";
    console.log("BlockDrop.Game.Score");

    // Local variables
    var score = 0,          // The players current score
        lines = 0,          // Number of cleared lines
        level = 1,          // The current level, increases every 10 lines
        dropLength = 0;     // Measure how long the player hard or soft drops the piece continuously

    /**
     * Reset current score
     */
    var reset = function() {
        score = 0;
        lines = 0;
        level = 1;
    };

    /**
     * Reset the drop length
     */
    var resetDropLength = function() {
        dropLength = 0;
    };

    /**
     * Get current score
     *
     * @returns {Number} Current score
     */
    var getScore = function() {
        return score;
    };

    /**
     * Get current lines
     *
     * @returns {Number} Current lines
     */
    var getLines = function() {
        return lines;
    };

    /**
     * Get current level
     *
     * @returns {Number} Current level
     */
    var getLevel = function() {
        return level;
    };

    /**
     * Increment the score based on the number of rows completed
     * Additional small score increases for hard and soft drops
     *
     * @param {Number} numRows - Number of rows cleared at the same time
     *
     * @returns {Number} Current score
     */
    var incrementScore = function(numRows) {
        switch (numRows) {
            case 4:
                score += (1200 * level);
                break;
            case 3:
                score += (300 * level);
                break;
            case 2:
                score += (100 * level);
                break;
            case 1:
                score += (40 * level);
                break;
        }

        score += dropLength;

        return score;
    };

    /**
     * Increment the number of completed lines
     */
    var incrementLines = function() {
        lines++;
    };

    /**
     * Increment the current level
     */
    var incrementLevel = function() {
        level++;
    };

    /**
     * Increment drop length during hard drop
     */
    var incrementDrop = function() {
        dropLength++;
    };

    // Public interface
    Score.reset = reset;
    Score.resetDropLength = resetDropLength;
    Score.getScore = getScore;
    Score.getLines = getLines;
    Score.getLevel = getLevel;
    Score.incrementScore = incrementScore;
    Score.incrementLines = incrementLines;
    Score.incrementLevel = incrementLevel;
    Score.incrementDrop = incrementDrop;

    return Score;

})(BlockDrop.Game.Score);
