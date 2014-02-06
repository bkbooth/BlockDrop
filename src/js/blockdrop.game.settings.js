/*
 * BlockDrop - A shameless Tetris clone
 * Game settings
 * Ben Booth
 * bkbooth at gmail dot com
 */

BlockDrop.namespace("BlockDrop.Game.Settings");

BlockDrop.Game.Settings = (function(Settings) {
    "use strict";
    console.log("BlockDrop.Game.Settings");

    // Dependencies
    var Utils = BlockDrop.Utils;

    // Local variables
    var settings = {
        music: localStorage.getItem("BlockDrop.settings.music") ?
            Utils.parseBool(localStorage.getItem("BlockDrop.settings.music")) :
            localStorage.setItem("BlockDrop.settings.music", true),
        sound: localStorage.getItem("BlockDrop.settings.sound") ?
            Utils.parseBool(localStorage.getItem("BlockDrop.settings.sound")) :
            localStorage.setItem("BlockDrop.settings.sound", true)
    };

    /**
     * Get a stored setting value
     *
     * @param {String} setting
     *
     * @returns {*}
     */
    var get = function(setting) {
        return settings[setting];
    };

    /**
     * Set a stored setting value
     *
     * @param {String} setting
     * @param {*} value
     *
     * @returns {*}
     */
    var set = function(setting, value) {
        settings[setting] = value;
        localStorage.setItem("BlockDrop.settings." + setting, value);
        return settings[setting];
    };

    /**
     * Toggle a stored boolean value
     *
     * @param {String} setting
     *
     * @returns {Boolean} Toggled value of the setting
     */
    var toggle = function(setting) {
        set(setting, !get(setting));
        return get(setting);
    };

    // Public interface
    Settings.get = get;
    Settings.set = set;
    Settings.toggle = toggle;

    return Settings;

})(BlockDrop.Game.Settings);
