/*
 * BlockDrop - A shameless Tetris clone
 * Collision detection utilities
 * Ben Booth
 * bkbooth at gmail dot com
 */

BlockDrop.namespace("BlockDrop.Game.CollisionDetection");

BlockDrop.Game.CollisionDetection = (function(CollisionDetection) {
    "use strict";
    console.log("BlockDrop.Game.CollisionDetection");

    // Dependencies
    var UI = BlockDrop.Game.UI,
        PieceFactory = BlockDrop.Game.PieceFactory,
        Utils = BlockDrop.Utils;

    /**
     * Collision targets
     * @readonly
     * @enum {String}
     */
    var Target = {
        BOTTOM: "bottomWall",
        LEFT: "leftWall",
        RIGHT: "rightWall",
        ALL: "all",
        BLOCKS: "otherBlocks"
    };

    /**
     * Check if moving down will cause a collision with the bottom wall or other blocks
     *
     * @param {HTMLElement} [piece] - DOM element of game piece
     *
     * @returns {Boolean}
     */
    var canMoveDown = function(piece) {
        piece = piece || UI.getElement("pieces.current");

        // Offset 1 space down
        var offset = {
            top: UI.getBaseSize(),
            left: 0
        };

        return !isIntersecting(piece, Target.BOTTOM, offset);
    };

    /**
     * Check if moving left will cause a collision with the left wall or other blocks
     *
     * @param {HTMLElement} [piece] - DOM element of game piece
     *
     * @returns {Boolean}
     */
    var canMoveLeft = function(piece) {
        piece = piece || UI.getElement("pieces.current");

        // Offset 1 space to the left
        var offset = {
            top: 0,
            left: -UI.getBaseSize()
        };

        return !isIntersecting(piece, Target.LEFT, offset);
    };

    /**
     * Check if moving right will cause a collision with the right wall or other blocks
     *
     * @param {HTMLElement} [piece] - DOM element of game piece
     *
     * @returns {Boolean}
     */
    var canMoveRight = function(piece) {
        piece = piece || UI.getElement("pieces.current");

        // Offset 1 space to the right
        var offset = {
            top: 0,
            left: UI.getBaseSize()
        };

        return !isIntersecting(piece, Target.RIGHT, offset);
    };

    /**
     * Check if rotating will cause a collision with other pieces
     * Always want to allow rotation against a wall, adjust position after rotate
     *
     * @param {HTMLElement} [piece] - DOM element of game piece
     *
     * @returns {Boolean}
     */
    var canRotate = function(piece) {
        piece = piece || UI.getElement("pieces.current");

        var pieceIndex = Utils.getIntData(piece, "index"),
            pieceRotate = Utils.getIntData(piece, "rotate"),
            pieceSize = Utils.getIntData(piece, "size"),
            tempRotate = pieceRotate + 90,
            gameBoard = UI.getElement("wrappers.game"),
            baseSize = UI.getBaseSize(),
            tempPiece, intersecting, offset;

        if (tempRotate >= 360) {
            tempRotate = 0;
        }

        // Create a temporary piece with the next rotation step
        tempPiece = gameBoard.appendChild( PieceFactory.create(pieceIndex, tempRotate) );
        tempPiece.style.zIndex = "-1"; // Shouldn't be needed, prevents piece flashing visible just in case
        tempPiece.style.left = (piece.offsetLeft / baseSize) + "em";
        tempPiece.style.top = (piece.offsetTop / baseSize) + "em";

        // Intersection test with no offsets
        intersecting = isIntersecting(tempPiece, Target.ALL, {left: 0, top: 0});
        if (intersecting) {
            // If we're intersecting with the left or right wall,
            // check if we can move 1 space in the opposite direction to allow the rotate
            // the straight piece sometimes needs to rebound 2 steps off the wall
            offset = 1;
            if (pieceSize === 4 && ((intersecting === Target.LEFT && pieceRotate === 90) ||
                                    (intersecting === Target.RIGHT && pieceRotate === 270))) {
                offset = 2;
            }

            if (intersecting === Target.LEFT && canMoveRight(tempPiece)) {
                piece.style.left = (piece.offsetLeft / baseSize) + offset + "em";
                gameBoard.removeChild(tempPiece);
                return true;
            } else if (intersecting === Target.RIGHT && canMoveLeft(tempPiece)) {
                piece.style.left = (piece.offsetLeft / baseSize) - offset + "em";
                gameBoard.removeChild(tempPiece);
                return true;
            }

            gameBoard.removeChild(tempPiece);
            return false;
        }

        gameBoard.removeChild(tempPiece);
        return true;
    };

    /**
     * Check if the newly created piece is already unable to move
     *
     * @param {HTMLElement} [piece] - DOM element of game piece
     *
     * @returns {Boolean}
     */
    var isGameOver = function(piece) {
        piece = piece || UI.getElement("pieces.current");

        // No offset, we only care about where the piece is now
        var offset = {
            top: 0,
            left: 0
        };

        return isIntersecting(piece, Target.BOTTOM, offset);
    };

    /**
     * Check if the piece is intersecting with any walls or other pieces
     *
     * @param {HTMLElement} element - DOM element
     * @param {Target} target - Collision target
     * @param {Object} offset
     * @param {Number} offset.top
     * @param {Number} offset.left
     *
     * @returns {Boolean|String} False or the name of the collision object
     */
    var isIntersecting = function(element, target, offset) {
        // Get the blocks of the current piece
        var objectBlocks = element.querySelectorAll(".piece-block"),
            baseSize = UI.getBaseSize(),
            i, n;

        // Check if any of the piece blocks will be outside the left wall
        if (target === Target.LEFT || target === Target.ALL) {
            for (i = 0, n = objectBlocks.length; i < n; i++) {
                if (element.offsetLeft + objectBlocks[i].offsetLeft + offset.left < 0) {
                    return Target.LEFT;
                }
            }
        }

        // Check if any of the piece blocks will be outside the right wall
        if (target === Target.RIGHT || target === Target.ALL) {
            for (i = 0, n = objectBlocks.length; i < n; i++) {
                if (element.offsetLeft + objectBlocks[i].offsetLeft + objectBlocks[i].offsetWidth + offset.left >
                    baseSize * 10) {
                    return Target.RIGHT;
                }
            }
        }

        // Check if any of the piece blocks will be outside the bottom wall
        if (target === Target.BOTTOM || target === Target.ALL) {
            for (i = 0, n = objectBlocks.length; i < n; i++) {
                if (element.offsetTop + objectBlocks[i].offsetTop + objectBlocks[i].offsetHeight + offset.top >
                    baseSize * 20) {
                    return Target.BOTTOM;
                }
            }
        }

        // Always compare against all other blocks
        if (checkAllBlocks(element, offset)) {
            return Target.BLOCKS;
        }

        return false;
    };

    /**
     * Compare the blocks of the piece with all other blocks on the game board
     *
     * @param {HTMLElement} element - DOM element
     * @param {Object} offset
     * @param {Number} offset.top
     * @param {Number} offset.left
     *
     * @returns {Boolean} Collision with other blocks
     */
    var checkAllBlocks = function(element, offset) {
        // Initialise some variables
        var allBlocks = UI.getElement("wrappers.game").querySelectorAll(".piece-block"),
            objectBlocks = element.querySelectorAll(".piece-block"),
            piece = UI.getElement("pieces.current"),
            i, j, n, m;

        // Loop through all blocks on the game board
        for (i = 0, n = allBlocks.length; i < n; i++) {
            // Ignore blocks from the passed in object and the current piece
            if (allBlocks[i].parentElement !== element && allBlocks[i].parentElement !== piece) {
                // Loop through all blocks of the current piece
                for (j = 0, m = objectBlocks.length; j < m; j++) {
                    // Do a simple box collision check
                    if (isBoxIntersecting({
                        // Need to create a new source object accounting for parent offsets
                        offsetLeft: element.offsetLeft + objectBlocks[j].offsetLeft,
                        offsetTop: element.offsetTop + objectBlocks[j].offsetTop,
                        offsetWidth: objectBlocks[j].offsetWidth,
                        offsetHeight: objectBlocks[j].offsetHeight
                    }, allBlocks[i], offset)) {
                        return true;
                    }
                }
            }
        }

        return false;
    };

    /**
     * Simple box collision detection
     *
     * @param {HTMLElement|Object} source - DOM element
     * @param {HTMLElement|Object} target - DOM element
     * @param {Object} offset
     * @param {Number} offset.top
     * @param {Number} offset.left
     *
     * @returns {Boolean}
     */
    var isBoxIntersecting = function(source, target, offset) {
        return (source.offsetTop + source.offsetHeight + offset.top > target.offsetTop &&   // source.bottom > target.top
            source.offsetTop + offset.top < target.offsetTop + target.offsetHeight &&       // source.top < target.bottom
            source.offsetLeft + source.offsetWidth + offset.left > target.offsetLeft &&     // source.right > target.left
            source.offsetLeft + offset.left < target.offsetLeft + target.offsetWidth);      // source.left < target.right
    };

    // Public interface
    CollisionDetection.canMoveDown = canMoveDown;
    CollisionDetection.canMoveLeft = canMoveLeft;
    CollisionDetection.canMoveRight = canMoveRight;
    CollisionDetection.canRotate = canRotate;
    CollisionDetection.isGameOver = isGameOver;

    return CollisionDetection;

})(BlockDrop.Game.CollisionDetection);
