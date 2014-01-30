/*
 * BlockDrop - A shameless Tetris clone
 * Some utility functions
 * Ben Booth
 * bkbooth at gmail dot com
 */

BlockDrop.namespace("BlockDrop.Utils");

BlockDrop.Utils = (function (Utils) {
    "use strict";
    console.log("BlockDrop.Utils");

    /**
     * Escape a RegExp string
     *
     * @param {String} str
     *
     * @returns {String} Escaped RegExp string
     */
    var escapeRegExp = function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };

    /**
     * Make a string safe for an Object key
     *
     * @param {String} str
     *
     * @returns {String} Key safe string
     */
    var makeKeySafe = function(str) {
        return str.replace(/[^a-zA-Z0-9]/g, "");
    };

    /**
     * Implementation of Java's String.hashCode()
     * http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
     *
     * @param {String} str
     *
     * @returns {String} Hash from input string
     */
    var hashCode = function(str) {
        /* jshint bitwise: false */
        var hash = 0, i, l, char;
        if (str.length === 0) { return hash; }
        for (i = 0, l = str.length; i < l; i++) {
            char  = str.charCodeAt(i);
            hash  = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString();
    };

    /**
     * Parse a string representation of a boolean into a boolean
     *
     * @param {String} str - "true" or "false"
     *
     * @returns {Boolean}
     */
    var parseBool = function(str) {
        return str === "true" && str !== "0";
    };

    /**
     * Get an integer from a string DOM element data attribute
     *
     * @param {HTMLElement} element - The DOM element to get the attribute from
     * @param {String} attribute - The data attribute to retrieve (without "data-" prefix)
     *
     * @returns {Number}
     */
    var getIntData = function(element, attribute) {
        return parseInt(element.dataset[attribute], 10);
    };

    /**
     * Set a DOM element data attribute using an integer
     *
     * @param {HTMLElement} element - The DOM element to set the attribute on
     * @param {String} attribute - The data attribute to set (without "data-" prefix)
     * @param {Number} value - The value to set the attribute to
     */
    var setIntData = function(element, attribute, value) {
        element.dataset[attribute] = value.toString();
    };

    // Public interface
    Utils.escapeRegExp = escapeRegExp;
    Utils.makeKeySafe = makeKeySafe;
    Utils.hashCode = hashCode;
    Utils.parseBool = parseBool;
    Utils.getIntData = getIntData;
    Utils.setIntData = setIntData;

    return Utils;

})(BlockDrop.Utils);
