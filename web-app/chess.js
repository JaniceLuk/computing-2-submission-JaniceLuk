/**
 * Chess game-state module for the Computing 2 coursework.
 * It represents the board, validates legal chess moves, applies moves,
 * tracks turns, captures, check, checkmate, stalemate and pawn promotion.
 * @module chess
 */

/** Chess board file letters from a to h. */
export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

/** Chess board rank numbers from 1 to 8. */
export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8];

/** White player identifier. */
export const WHITE = 'white';

/** Black player identifier. */
export const BLACK = 'black';

const PIECE_ORDER = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
const PIECE_SYMBOLS = {
  white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
};

/**
 * A player colour.
 * @typedef {'white'|'black'} Colour
 */

/**
 * A chess piece type.
 * @typedef {'king'|'queen'|'rook'|'bishop'|'knight'|'pawn'} PieceType
 */

/**
 * A chess piece on the board.
 * @typedef {Object} Piece
 * @property {PieceType} type - The type of chess piece.
 * @property {Colour} colour - The colour that owns the piece.
 * @property {boolean} hasMoved - Whether the piece has moved before.
 */

/**
 * The complete state of a chess game.
 * @typedef {Object} GameState
 * @property {Object<string, Piece|null>} board - Board squares mapped to pieces or null.
 * @property {Colour} turn - The colour whose turn it is.
 * @property {string|null} selected - The currently selected square, or null.
 * @property {Piece[]} captured - Pieces captured so far.
 * @property {string} status - Current game status: playing, check, checkmate or stalemate.
 * @property {Colour|null} winner - Winning colour, or null if there is no winner.
 * @property {string[]} history - List of moves played.
 */

const clonePiece = piece => piece ? { ...piece } : null;
const other = colour => colour === WHITE ? BLACK : WHITE;
const fileIndex = square => FILES.indexOf(square[0]);
const rankNumber = square => Number(square[1]);
const squareName = (file, rank) => `${FILES[file]}${rank}`;

/**
 * Checks whether a square id such as `e4` is on the chess board.
 * @param {string} square
 * @returns {boolean}
 */
export function isValidSquare(square) {
  return typeof square === 'string' && /^[a-h][1-8]$/.test(square);
}

/**
 * Returns a display symbol for a chess piece.
 * @param {Piece|null} piece
 * @returns {string}
 */
export function pieceSymbol(piece) {
  return piece ? PIECE_SYMBOLS[piece.colour][piece.type] : '';
}

/**
 * Creates a new chess game in the standard starting position.
 * @returns {GameState}
 */
export function createGame() {
  const board = {};
  for (const file of FILES) {
    for (const rank of RANKS) board[`${file}${rank}`] = null;
  }
  FILES.forEach((file, index) => {
    board[`${file}1`] = { type: PIECE_ORDER[index], colour: WHITE, hasMoved: false };
    board[`${file}2`] = { type: 'pawn', colour: WHITE, hasMoved: false };
    board[`${file}7`] = { type: 'pawn', colour: BLACK, hasMoved: false };
    board[`${file}8`] = { type: PIECE_ORDER[index], colour: BLACK, hasMoved: false };
  });
  return { board, turn: WHITE, selected: null, captured: [], status: 'playing', winner: null, history: [] };
}

/**
 * Creates a deep copy of a game state.
 * @param {GameState} game
 * @returns {GameState}
 */
export function cloneGame(game) {
  const board = {};
  for (const [square, piece] of Object.entries(game.board)) board[square] = clonePiece(piece);
  return { ...game, board, captured: game.captured.map(clonePiece), history: [...game.history] };
}

function pathIsClear(board, from, to) {
  const df = Math.sign(fileIndex(to) - fileIndex(from));
  const dr = Math.sign(rankNumber(to) - rankNumber(from));
  let file = fileIndex(from) + df;
  let rank = rankNumber(from) + dr;
  while (squareName(file, rank) !== to) {
    if (board[squareName(file, rank)]) return false;
    file += df;
    rank += dr;
  }
  return true;
}

function canPieceReach(board, from, to, ignoreKingSafety = false) {
  if (!isValidSquare(from) || !isValidSquare(to) || from === to) return false;
  const piece = board[from];
  if (!piece) return false;
  const target = board[to];
  if (target && target.colour === piece.colour) return false;

  const df = fileIndex(to) - fileIndex(from);
  const dr = rankNumber(to) - rankNumber(from);
  const absF = Math.abs(df);
  const absR = Math.abs(dr);
  const direction = piece.colour === WHITE ? 1 : -1;

  switch (piece.type) {
    case 'pawn': {
      if (df === 0 && dr === direction && !target) return true;
      const startRank = piece.colour === WHITE ? 2 : 7;
      if (df === 0 && dr === 2 * direction && rankNumber(from) === startRank && !target) {
        return !board[squareName(fileIndex(from), rankNumber(from) + direction)];
      }
      return absF === 1 && dr === direction && Boolean(target);
    }
    case 'knight': return (absF === 1 && absR === 2) || (absF === 2 && absR === 1);
    case 'bishop': return absF === absR && pathIsClear(board, from, to);
    case 'rook': return (df === 0 || dr === 0) && pathIsClear(board, from, to);
    case 'queen': return (df === 0 || dr === 0 || absF === absR) && pathIsClear(board, from, to);
    case 'king': return ignoreKingSafety ? absF <= 1 && absR <= 1 : absF <= 1 && absR <= 1;
    default: return false;
  }
}

/**
 * Finds all board squares containing pieces for the requested colour.
 * @param {GameState} game
 * @param {Colour} colour
 * @returns {string[]}
 */
export function squaresForColour(game, colour) {
  return Object.entries(game.board)
    .filter(([, piece]) => piece?.colour === colour)
    .map(([square]) => square);
}

/**
 * Finds the square occupied by a colour's king.
 * @param {GameState} game
 * @param {Colour} colour
 * @returns {string|null}
 */
export function findKing(game, colour) {
  return Object.entries(game.board).find(([, piece]) => piece?.type === 'king' && piece.colour === colour)?.[0] ?? null;
}

/**
 * Checks whether a square is attacked by any piece of the requested colour.
 * @param {GameState} game
 * @param {string} square
 * @param {Colour} byColour
 * @returns {boolean}
 */
export function isSquareAttacked(game, square, byColour) {
  return squaresForColour(game, byColour).some(from => canPieceReach(game.board, from, square, true));
}

/**
 * Checks whether a colour's king is currently in check.
 * @param {GameState} game
 * @param {Colour} colour
 * @returns {boolean}
 */
export function isInCheck(game, colour) {
  const kingSquare = findKing(game, colour);
  return kingSquare ? isSquareAttacked(game, kingSquare, other(colour)) : false;
}

function applyMoveToBoard(game, from, to, promotion = 'queen') {
  const movingPiece = clonePiece(game.board[from]);
  const captured = clonePiece(game.board[to]);
  game.board[to] = { ...movingPiece, hasMoved: true };
  game.board[from] = null;
  if (game.board[to].type === 'pawn' && (rankNumber(to) === 1 || rankNumber(to) === 8)) {
    game.board[to].type = ['queen', 'rook', 'bishop', 'knight'].includes(promotion) ? promotion : 'queen';
  }
  return captured;
}

/**
 * Returns legal destination squares for a piece at the chosen square.
 * @param {GameState} game
 * @param {string} from
 * @returns {string[]}
 */
export function getLegalMoves(game, from) {
  if (!isValidSquare(from) || !game.board[from]) return [];
  const piece = game.board[from];
  if (piece.colour !== game.turn || game.status !== 'playing') return [];
  return Object.keys(game.board).filter(to => {
    if (!canPieceReach(game.board, from, to)) return false;
    const trial = cloneGame(game);
    applyMoveToBoard(trial, from, to);
    if (piece.type === 'king' && isSquareAttacked(trial, to, other(piece.colour))) return false;
    return !isInCheck(trial, piece.colour);
  });
}

/**
 * Returns true if a move is legal in the current game state.
 * @param {GameState} game
 * @param {string} from
 * @param {string} to
 * @returns {boolean}
 */
export function isLegalMove(game, from, to) {
  return getLegalMoves(game, from).includes(to);
}

/**
 * Returns true if the requested colour has at least one legal move.
 * @param {GameState} game
 * @param {Colour} colour
 * @returns {boolean}
 */
export function hasLegalMove(game, colour) {
  const oldTurn = game.turn;
  game.turn = colour;
  const result = squaresForColour(game, colour).some(square => getLegalMoves(game, square).length > 0);
  game.turn = oldTurn;
  return result;
}

/**
 * Moves a piece if the move is legal and returns a new game state.
 * @param {GameState} game
 * @param {string} from
 * @param {string} to
 * @param {PieceType} [promotion='queen']
 * @returns {{ok: boolean, game: GameState, message: string}}
 */
export function movePiece(game, from, to, promotion = 'queen') {
  if (!isLegalMove(game, from, to)) return { ok: false, game, message: 'Illegal move.' };
  const next = cloneGame(game);
  const piece = next.board[from];
  const captured = applyMoveToBoard(next, from, to, promotion);
  if (captured) next.captured.push(captured);
  next.history.push(`${pieceSymbol(piece)} ${from}-${to}`);
  next.turn = other(next.turn);
  next.selected = null;

  const opponent = next.turn;
  if (!hasLegalMove(next, opponent)) {
    if (isInCheck(next, opponent)) {
      next.status = 'checkmate';
      next.winner = other(opponent);
    } else {
      next.status = 'stalemate';
    }
  } else if (isInCheck(next, opponent)) {
    next.status = 'check';
  } else {
    next.status = 'playing';
  }
  return { ok: true, game: next, message: 'Move played.' };
}

/**
 * Selects a square in the game state. Selecting an own piece returns its legal moves.
 * @param {GameState} game
 * @param {string} square
 * @returns {{game: GameState, legalMoves: string[]}}
 */
export function selectSquare(game, square) {
  const next = cloneGame(game);
  const piece = next.board[square];
  next.selected = piece?.colour === next.turn ? square : null;
  return { game: next, legalMoves: next.selected ? getLegalMoves(next, next.selected) : [] };
}

/**
 * Resets a game state back to the standard starting position.
 * @returns {GameState}
 */
export function resetGame() {
  return createGame();
}
