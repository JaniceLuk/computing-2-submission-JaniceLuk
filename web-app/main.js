// Contains rendering and interaction.

import {
  createGame,
  getLegalMoves,
  isInCheck,
  movePiece,
  selectSquare,
} from "./chess.js";

const CHECKMATE_MESSAGE_DELAY = 700;

// Board
const boardElement = document.querySelector("#board");

// Game controls
const resetButton = document.querySelector("#reset");
const turnIndicator = document.getElementById("turn-indicator");

// Messages
const messageArea = document.getElementById("message-area");
const messageText = document.getElementById("message-text");
const gameOverElement = document.querySelector("#game-over");

// Hidden game information (used internally)
const statusElement = document.querySelector("#status");
const historyElement = document.querySelector("#history");

let game = createGame();
let legalMoves = [];

function isGameFinished() {
  return ["checkmate", "stalemate", "gameover"].includes(game.status);
}

function showMessage(text) {
  messageText.textContent = text;
  messageArea.classList.remove("hidden");
}

function hideMessage() {
  messageArea.classList.add("hidden");
}

function showCheckmateMessages() {
  showMessage("Nice");

  setTimeout(() => {
    showMessage("Checkmate!");
  }, CHECKMATE_MESSAGE_DELAY);
}

/* ---------- Rendering ---------- */

function render() {
  renderBoard();
  renderGameInfo();
  renderCapturedPieces();
}

function renderBoard() {
  boardElement.innerHTML = "";

  for (let rank = 8; rank >= 1; rank--) {
    for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
      const file = "abcdefgh"[fileIndex];
      const square = `${file}${rank}`;
      const piece = game.board[square];
      const cell = document.createElement("button");

      cell.className = `square ${(fileIndex + rank) % 2 === 0 ? "dark" : "light"}`;
      cell.dataset.square = square;
      cell.disabled = isGameFinished();

      cell.setAttribute(
        "aria-label",
        piece
          ? `${piece.colour} ${piece.type} on ${square}`
          : `empty ${square}`,
      );

      if (game.selected === square) {
        cell.classList.add("selected");
      }

      if (
        piece?.type === "king" &&
        piece.colour === game.turn &&
        isInCheck(game, game.turn)
      ) {
        cell.classList.add(game.status === "checkmate" ? "checkmate" : "check");
      }

      if (legalMoves.includes(square)) {
        cell.classList.add(piece ? "capture-hint" : "move-hint");
      }

      if (piece) {
        const img = document.createElement("img");
        img.src = `pieces/${piece.colour}/${piece.type}.png`;
        img.alt = `${piece.colour} ${piece.type}`;
        img.className = "piece";
        cell.appendChild(img);
      }

      cell.addEventListener("click", () => handleSquareClick(square));
      boardElement.appendChild(cell);
    }
  }
}

function renderGameInfo() {
  renderStatus();
  renderGameOver();
  renderTurnIndicator();
}

function renderStatus() {
  const turn = game.turn[0].toUpperCase() + game.turn.slice(1);
  const checkText = isInCheck(game, game.turn) ? " — in check" : "";

  statusElement.textContent =
    game.status === "checkmate"
      ? `Checkmate. ${game.winner} wins!`
      : game.status === "stalemate"
        ? "Stalemate. Draw."
        : `${turn} to move${checkText}`;

  historyElement.innerHTML = game.history
    .map((entry, index) => `<li>${index + 1}. ${entry}</li>`)
    .join("");
}

function renderGameOver() {
  if (game.status === "checkmate" || game.status === "gameover") {
    const winner =
      game.winner.charAt(0).toUpperCase() +
      game.winner.slice(1);

    gameOverElement.textContent = `Game Over\n${winner} Wins!`;
    gameOverElement.classList.remove("hidden");
  } else {
    gameOverElement.classList.add("hidden");
  }
}

function renderTurnIndicator() {
  turnIndicator.textContent =
    game.turn === "white" ? "White" : "Black";

  turnIndicator.classList.remove("turn-white", "turn-black");

  if (game.turn === "white") {
    turnIndicator.classList.add("turn-white");
  } else {
    turnIndicator.classList.add("turn-black");
  }
}

function renderCapturedPieces() {
  const whiteCaptured = document.getElementById("captured-white");
  const blackCaptured = document.getElementById("captured-black");

  if (!whiteCaptured || !blackCaptured) return;

  whiteCaptured.innerHTML = "";
  blackCaptured.innerHTML = "";

  game.captured.forEach((piece) => {
    const img = document.createElement("img");
    img.src = `pieces/${piece.colour}/${piece.type}.png`;
    img.alt = `${piece.colour} ${piece.type}`;
    img.className = "captured-piece";

    if (piece.colour === "white") {
      whiteCaptured.appendChild(img);
    } else {
      blackCaptured.appendChild(img);
    }
  });
}

/* ---------- User interaction ---------- */

function handleSquareClick(square) {
  if (isGameFinished()) return;

  if (game.selected && legalMoves.includes(square)) {
    moveSelectedPiece(square);
    return;
  }

  selectBoardSquare(square);
}

function moveSelectedPiece(square) {
  const result = movePiece(game, game.selected, square);

  if (!result.ok) return;

  game = result.game;
  legalMoves = [];
  render();

  if (game.status === "checkmate") {
    showCheckmateMessages();
  } else if (game.status === "check") {
    showMessage("Check!");
  } else {
    hideMessage();
  }
}

function selectBoardSquare(square) {
  const selection = selectSquare(game, square);

  game = selection.game;
  legalMoves = selection.legalMoves;
  render();
}

function resetGame() {
  game = createGame();
  legalMoves = [];
  render();
  showMessage("White goes first!");
}

resetButton.addEventListener("click", resetGame);

render();
showMessage("White goes first!");