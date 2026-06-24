import assert from 'node:assert/strict';
import { createGame, getLegalMoves, movePiece, isInCheck, pieceSymbol, isLegalMove, hasLegalMove } from '../chess.js';

describe('Chess game module', () => {
  it('creates a standard board with 32 pieces and white to move', () => {
    const game = createGame();
    const pieces = Object.values(game.board).filter(Boolean);
    assert.equal(pieces.length, 32);
    assert.equal(game.turn, 'white');
    assert.equal(game.board.e1.type, 'king');
    assert.equal(game.board.e8.type, 'king');
  });

  it('allows a pawn to move one or two squares from its starting square', () => {
    const game = createGame();
    assert.deepEqual(getLegalMoves(game, 'e2').sort(), ['e3', 'e4']);
  });

  it('prevents moving an opponent piece on the wrong turn', () => {
    const game = createGame();
    assert.deepEqual(getLegalMoves(game, 'e7'), []);
  });

  it('moves a piece, changes turns and records history', () => {
    const game = createGame();
    const result = movePiece(game, 'e2', 'e4');
    assert.equal(result.ok, true);
    assert.equal(result.game.board.e4.type, 'pawn');
    assert.equal(result.game.board.e2, null);
    assert.equal(result.game.turn, 'black');
    assert.equal(result.game.history.length, 1);
  });

  it('blocks illegal rook movement through pieces', () => {
    const game = createGame();
    const result = movePiece(game, 'a1', 'a4');
    assert.equal(result.ok, false);
  });

  it('detects check in a simple attacking position', () => {
    let game = createGame();
    game = movePiece(game, 'e2', 'e4').game;
    game = movePiece(game, 'f7', 'f5').game;
    game = movePiece(game, 'd1', 'h5').game;
    assert.equal(isInCheck(game, 'black'), true);
  });

  it('uses readable symbols for the UI', () => {
    assert.equal(pieceSymbol({ type: 'queen', colour: 'white', hasMoved: false }), '♕');
  });

  it('prevents any piece from capturing a king directly', () => {
    const game = createGame();

    // Clear the board
    for (const square of Object.keys(game.board)) {
      game.board[square] = null;
    }

    // Put kings on the board and a white queen next to the black king
    game.board.e1 = { type: 'king', colour: 'white', hasMoved: false };
    game.board.e8 = { type: 'king', colour: 'black', hasMoved: false };
    game.board.e7 = { type: 'queen', colour: 'white', hasMoved: false };
    game.turn = 'white';

    assert.equal(isLegalMove(game, 'e7', 'e8'), false);

    const result = movePiece(game, 'e7', 'e8');
    assert.equal(result.ok, false);
    assert.equal(result.message, 'Illegal move.');
    assert.equal(result.game.board.e8.type, 'king');
  });

  it('records captured pieces when a capture is made', () => {
    let game = createGame();

  game = movePiece(game, 'e2', 'e4').game;
  game = movePiece(game, 'd7', 'd5').game;

  const result = movePiece(game, 'e4', 'd5');

  assert.equal(result.ok, true);
  assert.equal(result.game.captured.length, 1);
  assert.equal(result.game.captured[0].type, 'pawn');
  assert.equal(result.game.captured[0].colour, 'black');
  });

  it('promotes a pawn to a queen by default', () => {
    const game = createGame();

    for (const square of Object.keys(game.board)) {
      game.board[square] = null;
    }

    game.board.e1 = { type: 'king', colour: 'white', hasMoved: false };
    game.board.e8 = { type: 'king', colour: 'black', hasMoved: false };
    game.board.a7 = { type: 'pawn', colour: 'white', hasMoved: false };
    game.turn = 'white';

    const result = movePiece(game, 'a7', 'a8');

    assert.equal(result.ok, true);
    assert.equal(result.game.board.a8.type, 'queen');
    assert.equal(result.game.board.a8.colour, 'white');
  });

  it('prevents a move that leaves own king in check', () => {
    const game = createGame();

    for (const square of Object.keys(game.board)) {
      game.board[square] = null;
    }

    game.board.e1 = { type: 'king', colour: 'white', hasMoved: false };
    game.board.e8 = { type: 'king', colour: 'black', hasMoved: false };
    game.board.e2 = { type: 'rook', colour: 'white', hasMoved: false };
    game.board.e7 = { type: 'rook', colour: 'black', hasMoved: false };
    game.turn = 'white';

    assert.equal(isLegalMove(game, 'e2', 'a2'), false);
  });

  it('rejects invalid square input', () => {
    const game = createGame();

    assert.deepEqual(getLegalMoves(game, 'z9'), []);
    assert.equal(isLegalMove(game, 'e2', 'z9'), false);

    const result = movePiece(game, 'e2', 'z9');
    assert.equal(result.ok, false);
    assert.equal(result.message, 'Illegal move.');
  });

  it('blocks bishop movement through pieces', () => {
    const game = createGame();

    const result = movePiece(game, 'c1', 'h6');

    assert.equal(result.ok, false);
  });

  it('blocks queen movement through pieces', () => {
    const game = createGame();

    const result = movePiece(game, 'd1', 'h5');

    assert.equal(result.ok, false);
  });

  it('detects checkmate using fools mate', () => {
    let game = createGame();

    game = movePiece(game, 'f2', 'f3').game;
    game = movePiece(game, 'e7', 'e5').game;
    game = movePiece(game, 'g2', 'g4').game;

    const result = movePiece(game, 'd8', 'h4');

    assert.equal(result.ok, true);
    assert.equal(result.game.status, 'checkmate');
    assert.equal(result.game.winner, 'black');
  });

  it('detects stalemate in a simple position', () => {
    const game = createGame();

    for (const square of Object.keys(game.board)) {
      game.board[square] = null;
    }

    game.board.h8 = { type: 'king', colour: 'black', hasMoved: false };
    game.board.f7 = { type: 'king', colour: 'white', hasMoved: false };
    game.board.g6 = { type: 'queen', colour: 'white', hasMoved: false };
    game.turn = 'black';

    assert.equal(isInCheck(game, 'black'), false);
    assert.equal(hasLegalMove(game, 'black'), false);
  });
});
