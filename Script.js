// Get all the cells, status display element, and scoreboard elements
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.querySelector('#message');
const playerXScoreDisplay = document.querySelector('#playerXScore');
const playerOScoreDisplay = document.querySelector('#playerOScore');
const roundDisplay = document.querySelector('#round');

// Constants for player and AI
const PLAYER_X = 'X';
const PLAYER_O = 'O';
let currentPlayer = PLAYER_X; // Player goes first

// Array to store the state of the board
let board = ['', '', '', '', '', '', '', '', ''];

// Variables for the scoreboard
let playerXScore = 0;
let playerOScore = 0;
let currentRound = 1;

// Winning combinations
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Function to check if the game is won
function checkWin(board, player) {
    return winningConditions.find(condition => {
        return condition.every(index => {
            return board[index] === player;
        });
    });
}

// Function to check if the game is a draw
function checkDraw(board) {
    return board.every(cell => cell !== '');
}

// Function to make a move
function makeMove(index, player) {
    if (board[index] === '') {
        board[index] = player;
        cells[index].innerText = player;
        return true;
    }
    return false;
}

// Function to blink the winning line
function blinkWinningLine(winningCondition) {
    winningCondition.forEach(index => {
        cells[index].classList.add('blink');
    });
}

// Function to update the scoreboard
function updateScoreboard() {
    playerXScoreDisplay.innerText = playerXScore;
    playerOScoreDisplay.innerText = playerOScore;
    roundDisplay.innerText = currentRound;
}

// Function to show the final popup when 5 rounds are complete
function showFinalPopup() {
    let message;
    if (playerXScore > playerOScore) {
        message = `Player X wins the series with ${playerXScore} rounds!`;
    } else if (playerOScore > playerXScore) {
        message = `Player O wins the series with ${playerOScore} rounds!`;
    } else {
        message = `It's a tie! Both players won ${playerXScore} rounds.`;
    }
    
    const popup = document.createElement('div');
    popup.id = 'finalPopup';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.padding = '20px';
    popup.style.backgroundColor = 'white';
    popup.style.border = '2px solid black';
    popup.style.textAlign = 'center';
    popup.style.zIndex = '1000';

    const winnerMessage = document.createElement('p');
    winnerMessage.innerText = message;
    winnerMessage.style.fontSize = '24px';
    popup.appendChild(winnerMessage);

    const restartButton = document.createElement('button');
    restartButton.innerText = 'Restart Game';
    restartButton.style.marginTop = '20px';
    restartButton.style.fontSize = '18px';
    restartButton.style.padding = '10px';
    restartButton.addEventListener('click', () => {
        document.body.removeChild(popup);
        resetSeries();
    });

    popup.appendChild(restartButton);
    document.body.appendChild(popup);
}

// Function to handle the end of a round
function handleRoundEnd(winner) {
    if (winner) {
        if (winner === PLAYER_X) {
            playerXScore++;
        } else if (winner === PLAYER_O) {
            playerOScore++;
        }
    }
    updateScoreboard();

    if (currentRound >= 5) {
        showFinalPopup();
    } else {
        currentRound++;
        resetGame();
    }
}

// Function to reset the game
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => {
        cell.innerText = '';
        cell.classList.remove('blink');
    });
    statusDisplay.innerText = "Player's Turn";
    currentPlayer = PLAYER_X;
}

// Function to reset the entire series
function resetSeries() {
    playerXScore = 0;
    playerOScore = 0;
    currentRound = 1;
    updateScoreboard();
    resetGame();
}

// Function to show a pop-up for the winner
function showWinnerPopup(winner) {
    setTimeout(() => {
        alert(`${winner} wins the match!`);
        handleRoundEnd(winner);
    }, 500); // delay to allow blink animation to be visible
}

// Minimax algorithm to determine the best move for AI
function minimax(newBoard, player) {
    const emptyIndexes = newBoard.reduce((acc, val, index) => 
        val === '' ? acc.concat(index) : acc, []);

    // Check for terminal states
    if (checkWin(newBoard, PLAYER_X)) return { score: -10 };
    if (checkWin(newBoard, PLAYER_O)) return { score: 10 };
    if (checkDraw(newBoard)) return { score: 0 };

    // Collect the scores from each potential move
    let moves = [];
    emptyIndexes.forEach(index => {
        let move = {};
        move.index = index;
        newBoard[index] = player;

        if (player === PLAYER_O) {
            let result = minimax(newBoard, PLAYER_X);
            move.score = result.score;
        } else {
            let result = minimax(newBoard, PLAYER_O);
            move.score = result.score;
        }

        newBoard[index] = '';
        moves.push(move);
    });

    // Choose the best move
    let bestMove;
    if (player === PLAYER_O) {
        let bestScore = -Infinity;
        moves.forEach(move => {
            if (move.score > bestScore) {
                bestScore = move.score;
                bestMove = move;
            }
        });
    } else {
        let bestScore = Infinity;
        moves.forEach(move => {
            if (move.score < bestScore) {
                bestScore = move.score;
                bestMove = move;
            }
        });
    }

    return bestMove;
}

// Function to handle the AI move
function aiMove() {
    let bestMove = minimax(board, PLAYER_O);
    makeMove(bestMove.index, PLAYER_O);
    const winningCondition = checkWin(board, PLAYER_O);
    if (winningCondition) {
        blinkWinningLine(winningCondition);
        showWinnerPopup(PLAYER_O);
        return true;
    }
    if (checkDraw(board)) {
        statusDisplay.innerText = "It's a Draw!";
        handleRoundEnd(null); // Move to next round on draw
        return true;
    }
    currentPlayer = PLAYER_X;
    return false;
}

// Function to handle the player's move
function handlePlayerMove(index) {
    if (makeMove(index, PLAYER_X)) {
        const winningCondition = checkWin(board, PLAYER_X);
        if (winningCondition) {
            blinkWinningLine(winningCondition);
            showWinnerPopup(PLAYER_X);
            return true;
        }
        if (checkDraw(board)) {
            statusDisplay.innerText = "It's a Draw!";
            handleRoundEnd(null); // Move to next round on draw
            return true;
        }
        currentPlayer = PLAYER_O;
        setTimeout(aiMove, 500); // Add slight delay for AI move
    }
}

// Function to handle cell clicks
function handleCellClick(event) {
    const index = Array.from(cells).indexOf(event.target);
    if (board[index] === '' && currentPlayer === PLAYER_X) {
        handlePlayerMove(index);
    }
}

// Attach event listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
document.querySelector('#reset').addEventListener('click', resetSeries);

// Start the game automatically after 2 seconds on page load
window.onload = () => {
    setTimeout(() => {
        statusDisplay.innerText = "Game Started!";
    }, 2000);
    updateScoreboard();
};
