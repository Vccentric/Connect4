/**
 * Connect4 v1.0.0
 * This is a jQuery plugin of the board game: Connect-4
 *
 * @author      Christopher Viray
 * @copyright   (c) 2018 Christopher Viray
 * @license     MIT
 * @version     1.0.0
 */

// plugin definition
(function ($) {

    // variables
    var boardGrid = [];
    var movesList = [];
    var currentPlayer = 1; // values: 1 = red, 2 = yellow
    var maxRows = 6;
    var maxColumns = 7;
    var numConnectedToWin = 4;
    var gameover = false;

    // main function
    $.fn.connect4 = function (options) {
        init(); // init values
        render(this) // render function
        return this;
    };

    // function to initialize values
    function init() {
        // reset values
        boardGrid = [];
        movesList = [];
        currentPlayer = 1;
        gameover = false;

        // reset board grid values
        for (var x = 0; x < maxColumns; x++) {
            for (var y = 0; y < maxRows; y++) {
                if (boardGrid[x] == undefined) {
                    boardGrid[x] = [];
                }
                boardGrid[x][y] = 0; // set empty
            }
        }
    }

    // function to set move on board grid
    function setMove(x, y) {
        // set move
        var move = {
            'player': currentPlayer,
            'x': x,
            'y': y
        };

        // update lists
        movesList.push(move);
        boardGrid[x][y] = currentPlayer;
    }

    // function to check if move is valid
    function checkMoveValid(x, y) {
        var results = false;

        if (boardGrid[x][y] == 0) { // check if square has not already been taken
            if (y == 0) { // check if square is on bottom row
                results = true;
            } else if (boardGrid[x][y - 1] == 1 || boardGrid[x][y - 1] == 2) { // check if square is stack on top of a previous move
                results = true;
            }
        }

        return results;
    }

    // function to check if there is a winner with the current moves made
    function checkForWinner() {
        var moves = movesList.length;
        if (moves >= ((numConnectedToWin * 2) - 1)) { // only check for winner if there has been enough moves made
            var movePlayer = movesList[moves - 1].player;
            var connected = [];
            var deltaX, deltaY;
            var directions = [[1, 0], [0, 1], [1, 1], [1, -1]]; // check direction: horizontal | vertical | ascending diagonal | descending diagonal

            // check for win
            for (var w = 0; w < directions.length; w++) { // loop directions
                for (var x = 0; x < maxColumns; x++) { // loop columns
                    for (var y = 0; y <= maxRows; y++) { // loop rows
                        connected = []; // reset
                        for (var z = 0; z < numConnectedToWin; z++) {

                            try {
                                // calculate next square to check for depending on which direction
                                deltaX = (x + (z * directions[w][0]));
                                deltaY = (y + (z * directions[w][1]));

                                // check values
                                if (boardGrid[deltaX][deltaY] == movePlayer) {
                                    connected.push({ 'x': deltaX, 'y': deltaY });

                                    // check if there is a # of connected squares to win
                                    if (connected.length == numConnectedToWin) {
                                        updateConnectedWinSquares(connected);
                                        return (movePlayer + 2); // send win message depending on player (Red: 3 / Yellow: 4)
                                    }

                                } else {
                                    connected = []; // reset
                                    break;
                                }

                            } catch (error) { // array index went out of bounds and is undefined
                                connected = []; // reset
                                break;
                            }
                        }
                    }
                }
            }

            // check for draw
            if (movesList.length == (maxColumns * maxRows)) {
                return 5; // send draw message
            }
        }

        return false;
    }

    // function to render game interface
    function render($root) {
        // defensive check
        if ($root == undefined || $root.length == 0) return;

        var $header = $('<h1>', { 'class': 'game_title', 'text': 'Connect-4' });
        var $wrapper = $('<div>', { 'class': 'game' });
        $root.append($header).append($wrapper);

        var $left = $('<div>', { 'class': 'left_section' });
        var $right = $('<div>', { 'class': 'right_section' });
        $wrapper.append($left).append($right);

        // render game display
        var text = (currentPlayer == 2) ? 'Player Turn: Yellow' : 'Player Turn: Red'; // check who is the starting player
        var $gameDisplay = $('<div>', { 'id': 'game_display', 'text': text });
        $left.append($gameDisplay)

        // render game board
        var $gameBoard = $('<div>', { 'class': 'game_board' });
        $left.append($gameBoard);

        // create rows
        var $row, $button
        for (var y = 0; y < maxRows; y++) {
            $row = $('<div>', { 'class': 'row' });

            // create squares
            for (var x = 0; x < maxColumns; x++) {
                $button = $('<button>', { 'id': 'square_' + x + y, 'class': 'square' });
                $button.data({ 'x': x, 'y': y });
                $button.on('click', clickSquare);
                $row.append($button);
            }

            // add to game board
            $gameBoard.prepend($row);
        }

        // render restart button
        var $restartButton = $('<button>', { 'id': 'restart', 'text': 'Restart Game' });
        $restartButton.on('click', clickRestart);
        $left.append($restartButton);

        // render moves list
        var $gameInfo = $('<div>', { 'class': 'game_info' });
        var $title = $('<div>', { 'class': 'list_title', 'text': 'Moves List' });
        var $list = $('<ol>', { 'id': 'moves_list' });
        $gameInfo.append($title).append($list);
        $right.append($gameInfo);
    }

    // function to update all board squares
    function updateAllBoardSquares() {
        // find all board squares
        var $square, x, y;
        $('button.square').each(function () {
            $square = $(this);
            x = $square.data('x');
            y = $square.data('y');

            // defensive check
            if (x == undefined || y == undefined) return;

            // update individual board square depending on board grid value
            updateBoardSquare($square, boardGrid[x][y], false);
        });
    }

    // function to update a specific board square
    function updateBoardSquare($square, player, winner) {
        $square.removeClass('red yellow winner'); // reset

        // check which player
        if (player == 1) {
            $square.addClass('red');
        } else if (player == 2) {
            $square.addClass('yellow');
        }

        // check if part of connected winning squares
        if (winner) {
            $square.addClass('winner');
        }
    }

    // function to update all connected winning squares
    function updateConnectedWinSquares(squares) {
        var $square, x, y;
        for (var i = 0; i < squares.length; i++) {
            x = squares[i].x;
            y = squares[i].y;

            // check if square exists
            $square = $('#square_' + x + y);
            if ($square.length) {
                updateBoardSquare($square, boardGrid[x][y], true);
            }
        }
    }

    // function to update game display with a predefined message
    function updateGameDisplay(opts) {
        var $elm = $('#game_display');
        switch (opts) {
            case 1:
                $elm.text('Player Turn: Red');
                break;
            case 2:
                $elm.text('Player Turn: Yellow');
                break;
            case 3:
                $elm.text('Winner: Red!!!');
                break;
            case 4:
                $elm.text('Winner: Yellow!!!');
                break;
            case 5:
                $elm.text('Game is a Draw!!!');
                break;
            default:
                break;
        }
    }

    // function to handle click action on square
    function clickSquare(e) {
        // check if game is over
        if (gameover) return;

        // get board grid positions from square
        var $square = $(e.currentTarget);
        var x = $square.data('x');
        var y = $square.data('y');

        // defensive check
        if (x == undefined || y == undefined) return;

        // check move is valid
        if (checkMoveValid(x, y)) {
            // enter move
            setMove(x, y);
            updateBoardSquare($square, currentPlayer, false);
            addPrevMoveButton(movesList, currentPlayer);

            // check for winner
            var results = checkForWinner();
            if (results == 3 || results == 4 || results == 5) { // win (3/4) or draw (5)
                gameover = true;
                updateGameDisplay(results);
            } else { // set next player
                currentPlayer = (currentPlayer == 1) ? 2 : 1; // switch player
                updateGameDisplay(currentPlayer);
            }

        }
    }

    // function to handle click action on restart button
    function clickRestart(e) {
        init(); // reset default values
        updateAllBoardSquares();
        updateGameDisplay(currentPlayer);
        $('#moves_list').empty(); // empty moves list
    }

    // function to handle click action on prev move button
    function clickPrevMoveButton(e) {
        // get board grid positions from square
        var $button = $(e.currentTarget);
        var prevList = $button.data('list');
        var prevPlayer = $button.data('player');

        // defensive check
        if (prevList == undefined || prevPlayer == undefined) return;

        var index = prevList.length + 1;
        var last = movesList.length;

        // update current move data with the previous move data
        currentPlayer = prevPlayer;
        movesList = prevList;
        gameover = false; // reset

        // reset board grid values
        for (var x = 0; x < maxColumns; x++) {
            for (var y = 0; y < maxRows; y++) {
                boardGrid[x][y] = 0; // set empty
            }
        }

        // update board grid data with the updated moves list
        var movePlayer, moveX, moveY;
        for (var i = 0; i < movesList.length; i++) {
            movePlayer = movesList[i].player;
            moveX = movesList[i].x;
            moveY = movesList[i].y;

            // defensive check
            if (moveX != undefined && moveY != undefined) {
                boardGrid[moveX][moveY] = movePlayer;
            }
        }

        // update game interface with the new data
        updateAllBoardSquares();
        updateGameDisplay(currentPlayer);

        // update the moves list by removing the selected move button and all the other move buttons after it from the list
        for (var j = index; j <= last; j++) {
            $('#move_' + j).remove();
        }
    }

    // function to add a prev move button to the moves list
    function addPrevMoveButton(mList, mPlayer) {
        var $list = $('#moves_list');
        var $item = $('<li>', { 'id': 'move_' + mList.length });
        var $button = $('<button>', { 'class': 'prev_move', 'text': 'Go to Move #' + mList.length });
        var copyList = $.extend(true, [], mList);
        copyList.pop(); // remove the last move in moves list because we want to jump back to it and replay it
        $button.data({ 'list': copyList, 'player': mPlayer });
        $button.on('click', clickPrevMoveButton);
        $item.append($button);
        $list.append($item);
    }

}(jQuery));
