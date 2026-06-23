import assert from 'node:assert/strict';
import { createGame, getLegalMoves, movePiece, isInCheck, pieceSymbol } from '../chess.js';

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
});
