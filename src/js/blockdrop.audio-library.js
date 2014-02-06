/*
 * BlockDrop - A shameless Tetris clone
 * Audio library and player
 * Ben Booth
 * bkbooth at gmail dot com
 */

BlockDrop.namespace("BlockDrop.AudioLibrary");

BlockDrop.AudioLibrary = (function(AudioLibrary) {
    "use strict";
    console.log("BlockDrop.AudioLibrary");

    // Local variables
    var library = {};

    /**
     * Load an audio file into the library
     *
     * @param {String} audio - Easy to remember name of the audio file for later use
     * @param {String} fileName - Actual filename of the audio file
     * @param {Object} [options]
     * @param {Boolean} [options.loop] - Enable looping for the audio
     * @param {Boolean} [options.play] - Play the audio immediately?
     */
    var load = function(audio, fileName, options) {
        library[audio] = new Audio(fileName);
        library[audio].loop = options && !!options.loop;
        if (options && !!options.play) {
            library[audio].play();
        }
    };

    /**
     * Play an audio file
     *
     * @param {String} audio - File to play
     */
    var play = function(audio) {
        if (library[audio]) {
            library[audio].play();
        }
    };

    /**
     * Pause an audio file
     *
     * @param {String} audio - File to pause
     */
    var pause = function(audio) {
        if (library[audio]) {
            library[audio].pause();
        }
    };

    /**
     * Stop an audio file
     *
     * @param {String} audio - File to stop
     */
    var stop = function(audio) {
        if (library[audio]) {
            library[audio].pause();
            library[audio].currentTime = 0;
        }
    };

    // Public interface
    AudioLibrary.load = load;
    AudioLibrary.play = play;
    AudioLibrary.pause = pause;
    AudioLibrary.stop = stop;

    return AudioLibrary;

})(BlockDrop.AudioLibrary);
