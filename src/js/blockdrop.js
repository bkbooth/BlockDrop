/* 
 * BlockDrop - A shameless Tetris clone
 * Ben Booth
 * bkbooth at gmail dot com
 */

/* global BlockDrop: true */

var BlockDrop = BlockDrop || function(opts) {
    "use strict";
    console.log("BlockDrop");

    // Dependencies
    var Game = BlockDrop.Game,
        UI = BlockDrop.Game.UI,
        Input = BlockDrop.Game.Input,
        HighScores = BlockDrop.Game.HighScores,
        Settings = BlockDrop.Game.Settings,
        AudioLibrary = BlockDrop.AudioLibrary;

    var options = {
        base: (opts && opts.base) ? opts.base : "body"
    };

    var baseElement = options.base[0] === "#" ?
        document.getElementById( options.base.substr(1) ) :
        document.getElementsByTagName( options.base )[0];

    if (!baseElement) {
        throw new Error("Could not find base element: " + options.base);
    }

    AudioLibrary.load("move", "audio/blip.wav");
    AudioLibrary.load("drop", "audio/drop.wav");
    AudioLibrary.load("rotate", "audio/rotate.wav");
    AudioLibrary.load("clear", "audio/clear.wav");
    AudioLibrary.load("tetris", "audio/tetris.wav");
    AudioLibrary.load("music", "audio/Havok.ogg", true);
    if (Settings.get("music")) { AudioLibrary.play("music"); }

    HighScores.load();
    UI.initialise(baseElement);
    Input.setupEventListeners();
    UI.show("menu");

    return Game;
};

/**
 * Build empty objects along namespace string
 *
 * @param {String} nsString - String representation of namespace
 *
 * @returns {Object} created object from namespace string
 */
BlockDrop.namespace = function(nsString) {
    "use strict";

    var parts = nsString.split("."),
        parent = BlockDrop,
        i, n;

    // strip redundant leading global
    if (parts[0] === "BlockDrop") {
        parts = parts.slice(1);
    }

    for(i = 0, n = parts.length; i < n; i++) {
        // create property if it doesn't exist
        if (typeof parent[parts[i]] === "undefined") {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }

    return parent;
};
