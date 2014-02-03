/*
 * BlockDrop - A shameless Tetris clone
 * Simple Template Engine
 * Ben Booth
 * bkbooth at gmail dot com
 */

BlockDrop.namespace("BlockDrop.TemplateEngine");

BlockDrop.TemplateEngine = (function (TemplateEngine) {
    "use strict";
    console.log("BlockDrop.TemplateEngine");

    // Dependencies
    var Utils = BlockDrop.Utils,
        xhr = new XMLHttpRequest(),
        parser = new DOMParser();

    // Local variables
    var cache = JSON.parse(localStorage.getItem("BlockDrop.cache.template")) || {};

    /**
     * Load a template, store and retrieve from the cache after first load
     *
     * @param {String} fileName - Location of template file containing HTML
     *
     * @returns {String} HTML string
     */
    var load = function(fileName) {
        var contents = cache[Utils.hashCode(fileName)];

        if (!contents) {
            contents = "";
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    contents = xhr.responseText;
                }
            };
            xhr.open("GET", fileName, false);
            xhr.send();

            cache[Utils.hashCode(fileName)] = contents;
            localStorage.setItem("BlockDrop.cache.template", JSON.stringify(cache));
        }

        return contents;
    };

    /**
     * Find and replace template tags
     *
     * @param {String} templateString - HTML string
     * @param {Object} replaceMap - Key/value pairs
     *
     * @returns {String} HTML string
     */
    var replaceTags = function(templateString, replaceMap) {
        return templateString.replace(/\{\{\s*([a-zA-Z0-9\.\$_]+)\s*}}/g, function() {
            var parts = arguments[1].split(".");
            return replaceMap[parts[ parts.length - 1 ]] !== void 0 ? replaceMap[parts[ parts.length - 1 ]] : "";
        });
    };

    /**
     * Find and replace repeating blocks
     *
     * @param {String} templateString - HTML string
     * @param {Object} replaceMap - Key/value pairs
     *
     * @returns {String} HTML string
     */
    var replaceRepeats = function(templateString, replaceMap) {
        return templateString.replace(/\{\{\s*repeat\s+([a-zA-Z0-9]+)\s+as\s+([a-zA-Z0-9]+)\s*}}([\s\S]+)\{\{\s*endrepeat\s*}}/g, function() {
            var inArray = arguments[1],
                repeat = arguments[3],
                output = "";

            if (replaceMap[inArray] !== void 0 && replaceMap[inArray] instanceof Array) {
                for (var i = 0; i < replaceMap[inArray].length; i++) {
                    replaceMap[inArray][i].$index = i + 1;
                    output += replaceTags(repeat, replaceMap[inArray][i]);
                }
            }

            return output;
        });
    };

    /**
     * Transform template string with actual values
     *
     * @param {String} templateString - HTML string
     * @param {Object} [replaceMap] - Key/value pairs
     *
     * @returns {String} HTML string
     */
    var transform = function(templateString, replaceMap) {
        templateString = replaceRepeats(templateString, replaceMap);
        return replaceTags(templateString, replaceMap);
    };

    /**
     * Parse the HTML string into DOM nodes
     *
     * @param {String} templateString - HTML string
     *
     * @returns {HTMLElement} DOM node
     */
    var parse = function(templateString) {
        return parser.parseFromString(templateString, "text/html").querySelector("body").children[0];
    };

    /**
     * Load and transform the template
     *
     * @param {String} fileName - Location of template file containing HTML
     * @param {Object} [replaceMap] - Key/value pairs
     *
     * @returns {String} HTML string
     */
    var getString = function(fileName, replaceMap) {
        var contents = load(fileName);
        if (replaceMap) {
            return transform(contents, replaceMap);
        } else {
            return contents;
        }
    };

    /**
     * Load, transform and parse the template
     *
     * @param {String} fileName - Location of template file containing HTML
     * @param {Object} [replaceMap] - Key/value pairs
     *
     * @returns {HTMLElement} DOM node
     */
    var get = function(fileName, replaceMap) {
        var contents = getString(fileName, replaceMap);
        return parse(contents);
    };

    // Public interface
    TemplateEngine.getString = getString;
    TemplateEngine.get = get;

    return TemplateEngine;

})(BlockDrop.TemplateEngine);
