import { createGame, getLegalMoves, movePiece, pieceSymbol, selectSquare, isInCheck } from './chess.js';

let game = createGame();
let legalMoves = [];
const boardElement = document.querySelector('#board');
const statusElement = document.querySelector('#status');
const historyElement = document.querySelector('#history');
const capturedElement = document.querySelector('#captured');
const resetButton = document.querySelector('#reset');

function renderBoard() {
  boardElement.innerHTML = '';
  for (let rank = 8; rank >= 1; rank--) {
    for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
      const file = 'abcdefgh'[fileIndex];
      const square = `${file}${rank}`;
      const cell = document.createElement('button');
      const piece = game.board[square];
      cell.className = `square ${(fileIndex + rank) % 2 === 0 ? 'dark' : 'light'}`;
      cell.dataset.square = square;
      cell.setAttribute('aria-label', piece ? `${piece.colour} ${piece.type} on ${square}` : `empty ${square}`);
      if (game.selected === square) cell.classList.add('selected');
      if (legalMoves.includes(square)) cell.classList.add(piece ? 'capture-hint' : 'move-hint');
      cell.textContent = pieceSymbol(piece);
      cell.addEventListener('click', () => handleSquareClick(square));
      boardElement.appendChild(cell);
    }
  }
}

function renderSidebar() {
  const turn = game.turn[0].toUpperCase() + game.turn.slice(1);
  const checkText = isInCheck(game, game.turn) ? ' — in check' : '';
  statusElement.textContent = game.status === 'checkmate'
    ? `Checkmate. ${game.winner} wins!`
    : game.status === 'stalemate'
      ? 'Stalemate. Draw.'
      : `${turn} to move${checkText}`;
  historyElement.innerHTML = game.history.map((entry, index) => `<li>${index + 1}. ${entry}</li>`).join('');
  capturedElement.textContent = game.captured.map(pieceSymbol).join(' ');
}

function render() {
  renderBoard();
  renderSidebar();
}

function handleSquareClick(square) {
  if (game.selected && legalMoves.includes(square)) {
    const result = movePiece(game, game.selected, square);
    game = result.game;
    legalMoves = [];
    render();
    return;
  }
  const selection = selectSquare(game, square);
  game = selection.game;
  legalMoves = selection.legalMoves;
  render();
}

resetButton.addEventListener('click', () => {
  game = createGame();
  legalMoves = [];
  render();
});

render();
