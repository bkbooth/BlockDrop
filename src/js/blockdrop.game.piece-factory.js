/*
 * BlockDrop - A shameless Tetris clone
 * Game piece factory
 * Ben Booth
 * bkbooth at gmail dot com
 */

BlockDrop.namespace("BlockDrop.Game.PieceFactory");

BlockDrop.Game.PieceFactory = (function (PieceFactory) {
    "use strict";
    console.log("BlockDrop.Game.PieceFactory");

    // Dependencies
    var TemplateEngine = BlockDrop.TemplateEngine,
        Utils = BlockDrop.Utils;

    // Define all game pieces and each rotation step
    var pieces = [
        { id: "o", size: 2, blocks: { // O/square piece
            r0: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }],
            r90: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }],
            r180: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }],
            r270: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }]
        }},
        { id: "l", size: 3, blocks: { // L piece
            r0: [{ left: 2, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }],
            r90: [{ left: 1, top: 0 }, { left: 1, top: 1 }, { left: 1, top: 2 }, { left: 2, top: 2 }],
            r180: [{ left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 0, top: 2 }],
            r270: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 1, top: 1 }, { left: 1, top: 2 }]
        }},
        { id: "j", size: 3, blocks: { // J piece
            r0: [{ left: 0, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }],
            r90: [{ left: 1, top: 0 }, { left: 2, top: 0 }, { left: 1, top: 1 }, { left: 1, top: 2 }],
            r180: [{ left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 2, top: 2 }],
            r270: [{ left: 1, top: 0 }, { left: 1, top: 1 }, { left: 0, top: 2 }, { left: 1, top: 2 }]
        }},
        { id: "s", size: 3, blocks: { // S piece
            r0: [{ left: 1, top: 0 }, { left: 2, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }],
            r90: [{ left: 1, top: 0 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 2, top: 2 }],
            r180: [{ left: 1, top: 1 }, { left: 2, top: 1 }, { left: 0, top: 2 }, { left: 1, top: 2 }],
            r270: [{ left: 0, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }, { left: 1, top: 2 }]
        }},
        { id: "z", size: 3, blocks: { // Z piece
            r0: [{ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 1, top: 1 }, { left: 2, top: 1 }],
            r90: [{ left: 2, top: 0 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 1, top: 2 }],
            r180: [{ left: 0, top: 1 }, { left: 1, top: 1 }, { left: 1, top: 2 }, { left: 2, top: 2 }],
            r270: [{ left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }, { left: 0, top: 2 }]
        }},
        { id: "t", size: 3, blocks: { // T piece
            r0: [{ left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 },{ left: 2, top: 1 }],
            r90: [{ left: 1, top: 0 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 1, top: 2 }],
            r180: [{ left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 1, top: 2 }],
            r270: [{ left: 1, top: 0 }, { left: 0, top: 1 }, { left: 1, top: 1 }, { left: 1, top: 2 }]
        }},
        { id: "i", size: 4, blocks: { // I/straight piece
            r0: [{ left: 0, top: 1 }, { left: 1, top: 1 }, { left: 2, top: 1 }, { left: 3, top: 1 }],
            r90: [{ left: 2, top: 0 }, { left: 2, top: 1 }, { left: 2, top: 2 }, { left: 2, top: 3 }],
            r180: [{ left: 0, top: 2 }, { left: 1, top: 2 }, { left: 2, top: 2 }, { left: 3, top: 2 }],
            r270: [{ left: 1, top: 0 }, { left: 1, top: 1 }, { left: 1, top: 2 }, { left: 1, top: 3 }]
        }}
    ];

    /**
     * Create and return a new Tetris piece, can be random or a pre-defined piece.
     *
     * @param {Number} index - Index of requested piece
     * @param {Number} rotate - Starting rotation
     *
     * @returns {HTMLElement} DOM node containing a Tetris piece
     */
    var create = function(index, rotate) {
        var blueprint, blocks,
            piece, i, n;

        // Use the passed in starting rotation or set it to 0
        if (!(rotate >= 0 && rotate < 360 && rotate % 90 === 0)) {
            rotate = 0;
        }

        // Use the passed index or randomly choose a piece blueprint to create from
        if (!(typeof index === "number" && index >= 0 && index < pieces.length)) {
            index = Math.floor(Math.random() * pieces.length);
        }

        blueprint = pieces[index];

        // Create and setup the wrapper div for the piece
        piece = TemplateEngine.get("template/block.tpl.html", {id: blueprint.id});

        // Size of the new piece
        piece.style.width = blueprint.size + "em";
        piece.style.height = blueprint.size + "em";

        // Loop through the blocks defined in the piece blueprint
        blocks = blueprint.blocks["r" + rotate];
        for (i = 0, n = blocks.length; i < n; i++) {
            piece.children[i].style.top = blocks[i].top + "em";
            piece.children[i].style.left = blocks[i].left + "em";
        }

        // Add these useful properties to the piece
        Utils.setIntData(piece, "index", index);
        Utils.setIntData(piece, "rotate", rotate);
        Utils.setIntData(piece, "size", blueprint.size);

        // Return the new piece
        return piece;
    };

    /**
     * Get the blocks mapping for a particular piece and rotation
     *
     * @param {Number} index - Index of requested piece
     * @param {Number} rotate - Rotation step
     *
     * @returns {Array} Blocks mapping
     */
    var getMap = function(index, rotate) {
        return pieces[index].blocks["r" + rotate];
    };

    // Public interface
    PieceFactory.create = create;
    PieceFactory.getMap = getMap;

    return PieceFactory;

})(BlockDrop.Game.PieceFactory);
