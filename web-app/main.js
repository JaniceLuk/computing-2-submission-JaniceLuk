// contains rendering and interaction

import {
  createGame,
  getLegalMoves,
  movePiece,
  pieceSymbol,
  selectSquare,
  isInCheck,
} from "./chess.js";

let game = createGame();
let legalMoves = [];
const boardElement = document.querySelector("#board");
const statusElement = document.querySelector("#status");
const historyElement = document.querySelector("#history");
const capturedElement = document.querySelector("#captured");
const resetButton = document.querySelector("#reset");
const gameOverElement = document.querySelector("#game-over");
const messageArea = document.getElementById("message-area");
const turnIndicator = document.getElementById("turn-indicator");

function showMessage(text) {
  messageArea.textContent = text;
  messageArea.classList.remove("hidden");
}

function hideMessage() {
  messageArea.classList.add("hidden");
}

function showCheckmateMessages() {
  showMessage("Nice");

  setTimeout(() => {
    showMessage("Checkmate!");
  }, 700);
}

function renderBoard() {
  boardElement.innerHTML = "";
  for (let rank = 8; rank >= 1; rank--) {
    for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
      const file = "abcdefgh"[fileIndex];
      const square = `${file}${rank}`;
      const cell = document.createElement("button");
      const piece = game.board[square];
      cell.className = `square ${(fileIndex + rank) % 2 === 0 ? "dark" : "light"}`;
      cell.dataset.square = square;
      cell.setAttribute(
        "aria-label",
        piece
          ? `${piece.colour} ${piece.type} on ${square}`
          : `empty ${square}`,
      );
      if (game.selected === square) cell.classList.add("selected");
      if (
        piece?.type === "king" &&
        piece.colour === game.turn &&
        isInCheck(game, game.turn)
      ) {
        cell.classList.add(game.status === "checkmate" ? "checkmate" : "check");
      }
      if (legalMoves.includes(square))
        cell.classList.add(piece ? "capture-hint" : "move-hint");
      if (piece) {
        const img = document.createElement("img");
        img.src = `pieces/${piece.colour}/${piece.type}.png`;
        img.alt = `${piece.colour} ${piece.type}`;
        img.className = "piece";
        cell.appendChild(img);
      }
      cell.disabled = isGameFinished();
      cell.addEventListener("click", () => handleSquareClick(square));
      boardElement.appendChild(cell);
    }
  }
}

function renderSidebar() {
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
  capturedElement.textContent = game.captured.map(pieceSymbol).join(" ");
  if (game.status === "checkmate" || game.status === "gameover") {
    const winner =
      game.winner.charAt(0).toUpperCase() +
      game.winner.slice(1);

    gameOverElement.textContent = `Game Over\n${winner} Wins!`;
    gameOverElement.classList.remove("hidden");
  } else {
    gameOverElement.classList.add("hidden");
  }
  turnIndicator.textContent =
    game.turn === "white" ? "White" : "Black";

  turnIndicator.classList.remove("turn-white", "turn-black");

  if (game.turn === "white") {
    turnIndicator.classList.add("turn-white");
  } else {
    turnIndicator.classList.add("turn-black");
  }
}

function render() {
  renderBoard();
  renderSidebar();
  renderCapturedPieces();
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

function isGameFinished() {
  return ["checkmate", "stalemate", "gameover"].includes(game.status);
}

function handleSquareClick(square) {
  if (isGameFinished()) return;
  if (game.selected && legalMoves.includes(square)) {
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

    return;
  }
  const selection = selectSquare(game, square);
  game = selection.game;
  legalMoves = selection.legalMoves;
  render();
}

resetButton.addEventListener("click", () => {
  game = createGame();
  legalMoves = [];
  render();
  showMessage("White goes first!");
});

render();
showMessage("White goes first!");
