
"use strict";

// ========================================
// TIC TAC TOE — SMART AI EDITION
// ========================================

let play_board = Array(9).fill("");
let player = "O";
let computer = "X";
let gameMode = 1; // 1 = vs AI, 2 = two players
let board_full = false;
let ai_level = "normal";
let lastMove = null;
let moveHistory = [];
let gameOver = false;
let gameStarted = false;
let endMusic = null;

const scores = { X: 1, O: -1, tie: 0 };

const stats = {
    playerWins: 0,
    computerWins: 0,
    playerLosses: 0,
    computerLosses: 0,
    playerDraws: 0,
    computerDraws: 0
};

let audioElement = null;
let soundEnabled = true;
let aiSelectHandler = null;

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener("DOMContentLoaded", initializeGame);

function initializeGame() {
    audioElement = document.getElementById("myAudio");

    configure_ai();
    render_board();
    updateScoreboard();
    updateMoveMessage("Ready to play!");

    // Facebook Instant Games support is optional.
    if (typeof FBInstant !== "undefined") {
        FBInstant.initializeAsync()
            .then(() => {
                let progress = 0;

                const interval = setInterval(() => {
                    progress = Math.min(progress + 10, 100);

                    FBInstant.setLoadingProgress(progress);

                    if (progress >= 100) {
                        clearInterval(interval);

                        FBInstant.startGameAsync()
                            .then(() => console.log("Game loaded"))
                            .catch(console.error);
                    }
                }, 50);
            })
            .catch(console.error);
    }
}

// ========================================
// BOARD
// ========================================

function render_board() {
    const container = document.querySelector(".play-area");
    if (!container) return;

    container.innerHTML = "";

    play_board.forEach((value, index) => {
        const block = document.createElement("button");

        block.type = "button";
        block.id = `block_${index}`;
        block.className = "block";
        block.textContent = value;
        block.setAttribute("aria-label",
            value ? `Square ${index + 1}: ${value}` :
                    `Empty square ${index + 1}`);
        block.disabled = gameOver || value !== "";

        if (value !== "") {
            block.classList.add("occupied");
        }

        block.addEventListener("click", () => addPlayerMove(index));
        container.appendChild(block);
    });

    // Reapply winning-line highlighting after rendering.
    const result = getWinner(play_board);

    if (result.winningLine) {
        result.winningLine.forEach(index => {
            document.getElementById(`block_${index}`)
                ?.classList.add("won");
        });
    }
}

function configure_ai() {
    const select = document.getElementById("ai_level");
    if (!select) return;

    ai_level = select.value || "normal";

    if (aiSelectHandler) {
        select.removeEventListener("change", aiSelectHandler);
    }

    aiSelectHandler = event => {
        ai_level = event.target.value;
    };

    select.addEventListener("change", aiSelectHandler);
}

// ========================================
// GAME STATE
// ========================================

function getWinner(board) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const line of lines) {
        const [a, b, c] = line;

        if (
            board[a] !== "" &&
            board[a] === board[b] &&
            board[b] === board[c]
        ) {
            return { winner: board[a], winningLine: line };
        }
    }

    if (board.every(cell => cell !== "")) {
        return { winner: "tie", winningLine: null };
    }

    return { winner: "", winningLine: null };
}

function checkBoardComplete() {
    board_full = play_board.every(cell => cell !== "");
    return board_full;
}

function game_loop() {
    render_board();
    checkBoardComplete();
    checkWinner();
}

function updateMoveMessage(message) {
    const element = document.getElementById("move");
    if (element) element.textContent = message;
}

// ========================================
// PLAYER MOVES
// ========================================

function addPlayerMove(index) {
    if (gameOver || play_board[index] !== "") return;

    // Save the entire state for Undo.
    moveHistory.push({
        board: [...play_board],
        player,
        gameOver,
        board_full
    });

    lastMove = [...play_board];
    play_board[index] = player;

    game_loop();

    if (gameOver) return;

    if (gameMode === 1) {
        updateMoveMessage("Computer is thinking...");
        setTimeout(() => {
            if (!gameOver) addComputerMove(ai_level);
        }, 250);
    } else {
        player = player === "O" ? "X" : "O";
        updateMoveMessage(
            player === "O" ? "Player 1 (O) Move!" : "Player 2 (X) Move!"
        );
        render_board();
    }
}

// ========================================
// SMART AI
// ========================================

function addComputerMove(level = "normal") {
    if (gameOver) return;

    const empty = play_board
        .map((value, index) => value === "" ? index : -1)
        .filter(index => index !== -1);

    if (!empty.length) {
        game_loop();
        return;
    }

    let move;

    switch (level) {
        case "easy":
            // Easy: random valid move.
            move = empty[Math.floor(Math.random() * empty.length)];
            break;

        case "hard":
            // Hard: optimal play using Minimax.
            move = findBestMove();
            break;

        case "normal":
        default:
            // Normal: prioritize winning and blocking.
            move = findImmediateMove(computer);

            if (move === undefined) {
                move = findImmediateMove(player);
            }

            if (move === undefined && Math.random() < 0.75) {
                move = findBestMove();
            }

            if (move === undefined) {
                move = empty[Math.floor(Math.random() * empty.length)];
            }
            break;
    }

    if (move === undefined || play_board[move] !== "") return;

    moveHistory.push({
        board: [...play_board],
        player,
        gameOver,
        board_full
    });

    lastMove = [...play_board];
    play_board[move] = computer;

    game_loop();

    if (!gameOver) {
        updateMoveMessage("Your turn!");
    }
}

function findImmediateMove(symbol) {
    for (let i = 0; i < 9; i++) {
        if (play_board[i] !== "") continue;

        const test = [...play_board];
        test[i] = symbol;

        if (getWinner(test).winner === symbol) {
            return i;
        }
    }

    return undefined;
}

function findBestMove() {
    let bestScore = -Infinity;
    let bestMove;
    const board = [...play_board];

    for (let i = 0; i < 9; i++) {
        if (board[i] !== "") continue;

        board[i] = computer;
        const score = minimax(board, 0, false);
        board[i] = "";

        if (score > bestScore) {
            bestScore = score;
            bestMove = i;
        }
    }

    return bestMove;
}

function minimax(board, depth, maximizing) {
    const result = getWinner(board).winner;

    if (result === computer) return 10 - depth;
    if (result === player) return depth - 10;
    if (result === "tie") return 0;

    if (maximizing) {
        let best = -Infinity;

        for (let i = 0; i < 9; i++) {
            if (board[i] !== "") continue;

            board[i] = computer;
            best = Math.max(best, minimax(board, depth + 1, false));
            board[i] = "";
        }

        return best;
    }

    let best = Infinity;

    for (let i = 0; i < 9; i++) {
        if (board[i] !== "") continue;

        board[i] = player;
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = "";
    }

    return best;
}

// ========================================
// WINNER & SCORE
// ========================================

function checkWinner() {
    const result = getWinner(play_board);
    const element = document.getElementById("winner");

    if (!result.winner) return;

    if (gameOver) return;

    gameOver = true;
    board_full = true;

    if (element) {
        element.classList.remove("playerWin", "computerWin", "draw");
    }

    if (result.winner === "O") {
        if (gameMode === 1) {
            stats.playerWins++;
            stats.computerLosses++;
            if (element) {
                element.textContent = "You Won!";
                element.classList.add("playerWin");
            }
        } else {
            if (element) {
                element.textContent = "Player 1 Won!";
                element.classList.add("playerWin");
            }
        }

        playEndSound("audio/win.wav");
    } else if (result.winner === "X") {
        if (gameMode === 1) {
            stats.computerWins++;
            stats.playerLosses++;
            if (element) {
                element.textContent = "Computer Won!";
                element.classList.add("computerWin");
            }
        } else {
            if (element) {
                element.textContent = "Player 2 Won!";
                element.classList.add("computerWin");
            }
        }

        playEndSound("audio/gameover.wav");
    } else {
        stats.playerDraws++;
        stats.computerDraws++;

        if (element) {
            element.textContent = "It's a Draw!";
            element.classList.add("draw");
        }

        playEndSound("audio/gameover.wav");
    }

    updateScoreboard();
    updateMoveMessage("Game over — start a new round!");
    render_board();
}

function updateScoreboard() {
    const values = {
        playerstat1: stats.playerWins,
        computerstat1: stats.computerWins,
        loss1: stats.playerLosses,
        loss2: stats.computerLosses,
        draw1: stats.playerDraws,
        draw2: stats.computerDraws
    };

    for (const [id, value] of Object.entries(values)) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
}

// ========================================
// AUDIO
// ========================================

function playEndSound(path) {
    if (!soundEnabled) return;

    if (audioElement) {
        audioElement.pause();
    }

    if (endMusic) {
        endMusic.pause();
        endMusic.currentTime = 0;
    }

    endMusic = new Audio(path);
    endMusic.play().catch(() => {
        // Browsers may block autoplay until the user interacts.
    });
}

function muteAudio() {
    soundEnabled = !soundEnabled;

    if (audioElement) {
        audioElement.muted = !soundEnabled;
    }

    if (endMusic) {
        endMusic.muted = !soundEnabled;

        if (!soundEnabled) {
            endMusic.pause();
        }
    }

    const button = document.getElementById("btn-sound");

    if (button) {
        button.innerHTML = soundEnabled
            ? '<i class="fa fa-volume-up" aria-hidden="true"></i>'
            : '<i class="fa fa-volume-down" aria-hidden="true"></i>';

        button.setAttribute(
            "aria-label",
            soundEnabled ? "Mute sound" : "Enable sound"
        );
    }
}

// ========================================
// UNDO
// ========================================

function undoLastMove() {
    if (!moveHistory.length) return;

    if (endMusic) {
        endMusic.pause();
        endMusic.currentTime = 0;
    }

    // In single-player mode, undo both the computer move
    // and the preceding player move when possible.
    const steps = gameMode === 1 && moveHistory.length >= 2 ? 2 : 1;

    for (let i = 0; i < steps; i++) {
        const previous = moveHistory.pop();
        if (!previous) break;

        play_board = [...previous.board];
        player = previous.player;
        gameOver = false;
        board_full = false;
    }

    lastMove = moveHistory.length
        ? [...moveHistory[moveHistory.length - 1].board]
        : null;

    const winner = document.getElementById("winner");

    if (winner) {
        winner.textContent = "";
        winner.classList.remove("playerWin", "computerWin", "draw");
    }

    updateMoveMessage("Your turn!");
    game_loop();
}

// ========================================
// GAME MODES
// ========================================

function twoPlayer() {
    gameMode = 2;
    player = "O";
    computer = "X";

    const p1 = document.getElementById("Player1");
    const p2 = document.getElementById("Player2");

    if (p1) p1.textContent = "Player 1 (O)";
    if (p2) p2.textContent = "Player 2 (X)";

    reset_board();
}

function singlePlayer() {
    gameMode = 1;
    player = "O";
    computer = "X";

    const p1 = document.getElementById("Player1");
    const p2 = document.getElementById("Player2");

    if (p1) p1.textContent = "Player";
    if (p2) p2.textContent = "Computer";

    reset_board();
}

// ========================================
// RESET & STARTING PLAYER
// ========================================

function reset_board() {
    play_board = Array(9).fill("");
    board_full = false;
    gameOver = false;
    moveHistory = [];
    lastMove = null;

    const winner = document.getElementById("winner");

    if (winner) {
        winner.textContent = "";
        winner.classList.remove("playerWin", "computerWin", "draw");
    }

    const select = document.getElementById("ai_level");
    if (select) select.disabled = false;

    if (endMusic) {
        endMusic.pause();
        endMusic.currentTime = 0;
    }

    render_board();
    randomizeStart();
}

function reset_board1(firstPlayer) {
    play_board = Array(9).fill("");
    board_full = false;
    gameOver = false;
    moveHistory = [];
    lastMove = null;

    const winner = document.getElementById("winner");

    if (winner) {
        winner.textContent = "";
        winner.classList.remove("playerWin", "computerWin", "draw");
    }

    const select = document.getElementById("ai_level");
    if (select) select.disabled = false;

    if (endMusic) {
        endMusic.pause();
        endMusic.currentTime = 0;
    }

    render_board();
    setStartingPlayer(firstPlayer);
}

function selectFirstPlayer(symbol) {
    reset_board1(symbol);
}

function randomizeStart() {
    if (gameMode === 1) {
        // Player always uses O; computer always uses X.
        if (Math.random() < 0.5) {
            updateMoveMessage("Your turn!");
        } else {
            updateMoveMessage("Computer starts...");
            setTimeout(() => {
                if (!gameOver && play_board.every(cell => cell === "")) {
                    addComputerMove(ai_level);
                }
            }, 250);
        }
    } else {
        player = "O";
        updateMoveMessage("Player 1 (O) Move!");
    }
}

function setStartingPlayer(firstPlayer) {
    if (firstPlayer === "X") {
        if (gameMode === 1) {
            // The human uses O, so selecting X means the computer starts.
            updateMoveMessage("Computer starts...");
            setTimeout(() => addComputerMove(ai_level), 250);
        } else {
            player = "X";
            updateMoveMessage("Player 2 (X) Move!");
        }
    } else {
        player = "O";
        updateMoveMessage(
            gameMode === 1 ? "Your turn!" : "Player 1 (O) Move!"
        );
    }
}

// Initial setup for scripts loaded after DOMContentLoaded.
if (document.readyState !== "loading") {
    initializeGame();
}
