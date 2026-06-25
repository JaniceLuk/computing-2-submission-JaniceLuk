import {
  createGame,
  getLegalMoves,
  hasLegalMove,
  isInCheck,
  isLegalMove,
  movePiece,
} from "../chess.js";

function clearBoard(game) {
  Object.keys(game.board).forEach(function (square) {
    game.board[square] = null;
  });
}

function checkEqual(result, expected, message) {
  if (result !== expected) {
    throw new Error(
      `${message}: ${result} was returned, when ${expected} was expected.`,
    );
  }
}

function checkDeepEqual(result, expected, message) {
  if (JSON.stringify(result) !== JSON.stringify(expected)) {
    throw new Error(
      `${message}: ${JSON.stringify(result)} was returned, ` +
        `when ${JSON.stringify(expected)} was expected.`,
    );
  }
}

function playMove(game, from, to, promotion) {
  const result = movePiece(game, from, to, promotion);

  if (!result.ok) {
    throw new Error(`Expected ${from}-${to} to be a legal move.`);
  }

  return result.game;
}

describe("Starting a chess game", function () {
  it("A new game begins with all 32 pieces on the board", function () {
    // Given a new chess game
    const game = createGame();

    // When the pieces on the board are counted
    const result = Object.values(game.board).filter(Boolean).length;

    // Then all 32 chess pieces are present
    checkEqual(result, 32, "The number of pieces on the board");
  });

  it("White always has the first move", function () {
    // Given a new chess game
    const game = createGame();

    // Then white is the first player to move
    checkEqual(game.turn, "white", "The first player to move");
  });

  it("Both kings start on their correct starting squares", function () {
    // Given a new chess game
    const game = createGame();

    // Then the white king starts on e1 and the black king starts on e8
    checkEqual(game.board.e1.type, "king", "The piece on e1");
    checkEqual(game.board.e1.colour, "white", "The colour of the king on e1");
    checkEqual(game.board.e8.type, "king", "The piece on e8");
    checkEqual(game.board.e8.colour, "black", "The colour of the king on e8");
  });
});

describe("Understanding legal moves", function () {
  it("A pawn can move one or two squares forward from its starting square", function () {
    // Given a new game where the white pawn is still on e2
    const game = createGame();

    // When the legal moves for that pawn are requested
    const result = getLegalMoves(game, "e2").sort();

    // Then the pawn may move to e3 or e4
    checkDeepEqual(
      result,
      ["e3", "e4"],
      "The legal moves for the white pawn on e2",
    );
  });

  it("A player cannot move an opponent's piece", function () {
    // Given a new game where it is white's turn
    const game = createGame();

    // When legal moves are requested for a black pawn
    const result = getLegalMoves(game, "e7");

    // Then the black pawn has no legal moves because it is not black's turn
    checkDeepEqual(result, [], "The legal moves for the black pawn on e7");
  });

  it("Invalid square names are rejected safely", function () {
    // Given a new game
    const game = createGame();

    // When an invalid board square is used
    const result = getLegalMoves(game, "z9");

    // Then no legal moves are returned
    checkDeepEqual(result, [], "The legal moves for an invalid square");
  });
});

describe("Moving pieces during a game", function () {
  it("A legal move updates the board, changes the turn, and records the move", function () {
    // Given a new game
    const game = createGame();

    // When white moves the pawn from e2 to e4
    const result = movePiece(game, "e2", "e4");

    // Then the move is accepted
    checkEqual(result.ok, true, "Whether the move was accepted");

    // And the pawn has moved to e4
    checkEqual(result.game.board.e4.type, "pawn", "The piece on e4");
    checkEqual(result.game.board.e2, null, "The piece on e2");

    // And the turn changes to black
    checkEqual(result.game.turn, "black", "The next player to move");

    // And the move is recorded in the history
    checkEqual(result.game.history[0], "e2-e4", "The first move in history");
  });

  it("A rook cannot move through another piece", function () {
    // Given a new game where the rook on a1 is blocked by the pawn on a2
    const game = createGame();

    // When the rook tries to move up the file
    const result = movePiece(game, "a1", "a4");

    // Then the move is rejected
    checkEqual(result.ok, false, "Whether the blocked rook move was accepted");
  });

  it("A bishop cannot move through another piece", function () {
    // Given a new game where the bishop on c1 is blocked
    const game = createGame();

    // When the bishop tries to move along its diagonal
    const result = movePiece(game, "c1", "h6");

    // Then the move is rejected
    checkEqual(
      result.ok,
      false,
      "Whether the blocked bishop move was accepted",
    );
  });

  it("A queen cannot move through another piece", function () {
    // Given a new game where the queen on d1 is blocked
    const game = createGame();

    // When the queen tries to move diagonally to h5
    const result = movePiece(game, "d1", "h5");

    // Then the move is rejected
    checkEqual(result.ok, false, "Whether the blocked queen move was accepted");
  });

  it("A move to a square outside the board is rejected", function () {
    // Given a new game
    const game = createGame();

    // When a pawn tries to move to an invalid square
    const result = movePiece(game, "e2", "z9");

    // Then the move is rejected with an illegal move message
    checkEqual(result.ok, false, "Whether the invalid move was accepted");
    checkEqual(result.message, "Illegal move.", "The invalid move message");
  });
});

describe("Capturing pieces", function () {
  it("A legal capture removes the enemy piece and records it as captured", function () {
    // Given a position where a white pawn can capture a black pawn
    let game = createGame();
    game = playMove(game, "e2", "e4");
    game = playMove(game, "d7", "d5");

    // When the white pawn captures from e4 to d5
    const result = movePiece(game, "e4", "d5");

    // Then the move is accepted
    checkEqual(result.ok, true, "Whether the capture was accepted");

    // And the white pawn now occupies d5
    checkEqual(result.game.board.d5.type, "pawn", "The piece on d5");
    checkEqual(
      result.game.board.d5.colour,
      "white",
      "The colour of the piece on d5",
    );

    // And the black pawn is recorded as captured
    checkEqual(result.game.captured.length, 1, "The number of captured pieces");
    checkEqual(result.game.captured[0].type, "pawn", "The captured piece type");
    checkEqual(
      result.game.captured[0].colour,
      "black",
      "The captured piece colour",
    );
  });

  it("A king is never captured directly in legal chess", function () {
    // Given a position where a white queen is next to the black king
    const game = createGame();
    clearBoard(game);

    game.board.e1 = { type: "king", colour: "white", hasMoved: false };
    game.board.e8 = { type: "king", colour: "black", hasMoved: false };
    game.board.e7 = { type: "queen", colour: "white", hasMoved: false };
    game.turn = "white";

    // When white tries to move the queen onto the black king's square
    const legalMove = isLegalMove(game, "e7", "e8");
    const result = movePiece(game, "e7", "e8");

    // Then the move is not legal
    checkEqual(
      legalMove,
      false,
      "Whether a piece may move onto the enemy king's square",
    );

    // And the black king remains on e8
    checkEqual(result.ok, false, "Whether the king capture was accepted");
    checkEqual(result.game.board.e8.type, "king", "The piece remaining on e8");
  });
});

describe("Promoting pawns", function () {
  it("A pawn promotes to a queen by default when it reaches the final rank", function () {
    // Given a white pawn on a7 ready to promote
    const game = createGame();
    clearBoard(game);

    game.board.e1 = { type: "king", colour: "white", hasMoved: false };
    game.board.e8 = { type: "king", colour: "black", hasMoved: false };
    game.board.a7 = { type: "pawn", colour: "white", hasMoved: false };
    game.turn = "white";

    // When the pawn moves to a8
    const result = movePiece(game, "a7", "a8");

    // Then the pawn promotes to a queen
    checkEqual(result.ok, true, "Whether the promotion move was accepted");
    checkEqual(result.game.board.a8.type, "queen", "The promoted piece type");
    checkEqual(
      result.game.board.a8.colour,
      "white",
      "The promoted piece colour",
    );
  });

  it("A pawn can promote to a chosen legal piece", function () {
    // Given a white pawn on a7 ready to promote
    const game = createGame();
    clearBoard(game);

    game.board.e1 = { type: "king", colour: "white", hasMoved: false };
    game.board.e8 = { type: "king", colour: "black", hasMoved: false };
    game.board.a7 = { type: "pawn", colour: "white", hasMoved: false };
    game.turn = "white";

    // When the pawn moves to a8 and chooses a rook
    const result = movePiece(game, "a7", "a8", "rook");

    // Then the promoted piece is a rook
    checkEqual(result.ok, true, "Whether the promotion move was accepted");
    checkEqual(result.game.board.a8.type, "rook", "The promoted piece type");
  });
});

describe("Playing throuhg check and king safety", function () {
  it("A real game sequence can lead to check", function () {
    // Given a real game sequence
    let game = createGame();
    game = playMove(game, "e2", "e4");
    game = playMove(game, "f7", "f5");

    // When White moves the queen to h5
    const result = movePiece(game, "d1", "h5");

    // Then the move is accepted
    checkEqual(result.ok, true, "Whether the checking move was accepted");

    // And Black is in check
    checkEqual(
      isInCheck(result.game, "black"),
      true,
      "Whether black is in check",
    );

    // And the game status records check
    checkEqual(result.game.status, "check", "The game status after check");

    // And Black must now respond to the check
    checkEqual(
      result.game.turn,
      "black",
      "The player who must respond to check",
    );
  });

  it("A player in check cannot ignore the check with an unrelated move", function () {
    // Given a position where the white king is in check from a black rook
    const game = createGame();
    clearBoard(game);

    game.board.e1 = { type: "king", colour: "white", hasMoved: false };
    game.board.h8 = { type: "king", colour: "black", hasMoved: false };
    game.board.e8 = { type: "rook", colour: "black", hasMoved: false };
    game.board.a1 = { type: "rook", colour: "white", hasMoved: false };
    game.turn = "white";

    // When White tries to move a rook instead of dealing with the check
    const result = isLegalMove(game, "a1", "a2");

    // Then the move is illegal because the white king would still be in check
    checkEqual(
      result,
      false,
      "Whether White can ignore check with an unrelated rook move",
    );
  });

  it("A pinned piece cannot move away if that exposes its own king", function () {
    // Given a white rook shielding the white king from a black rook
    const game = createGame();
    clearBoard(game);

    game.board.e1 = { type: "king", colour: "white", hasMoved: false };
    game.board.e8 = { type: "king", colour: "black", hasMoved: false };
    game.board.e2 = { type: "rook", colour: "white", hasMoved: false };
    game.board.e7 = { type: "rook", colour: "black", hasMoved: false };
    game.turn = "white";

    // When the pinned rook tries to move away
    const result = isLegalMove(game, "e2", "a2");

    // Then the move is illegal because it exposes the king
    checkEqual(
      result,
      false,
      "Whether a pinned rook may move away from its king",
    );
  });

  it("A king cannot move onto a square attacked by an enemy piece", function () {
    // Given a white king facing a black rook on the same file
    const game = createGame();
    clearBoard(game);

    game.board.e1 = { type: "king", colour: "white", hasMoved: false };
    game.board.h8 = { type: "king", colour: "black", hasMoved: false };
    game.board.e8 = { type: "rook", colour: "black", hasMoved: false };
    game.turn = "white";

    // When the white king tries to move to e2
    const result = isLegalMove(game, "e1", "e2");

    // Then the move is illegal because e2 is still attacked by the rook
    checkEqual(
      result,
      false,
      "Whether the king may move onto an attacked square",
    );
  });
});

describe("Ending a game by checkmate or stalemate", function () {
  it("A real game can end in checkmate using Fool's Mate", function () {
    // Given the opening moves of Fool's Mate
    let game = createGame();
    game = playMove(game, "f2", "f3");
    game = playMove(game, "e7", "e5");
    game = playMove(game, "g2", "g4");

    // When Black moves the queen to h4
    const result = movePiece(game, "d8", "h4");

    // Then the move is accepted
    checkEqual(result.ok, true, "Whether the checkmate move was accepted");

    // And the game is checkmate
    checkEqual(result.game.status, "checkmate", "The game status");

    // And Black is the winner
    checkEqual(result.game.winner, "black", "The winning player");

    // And White is in check with no legal escape
    checkEqual(
      isInCheck(result.game, "white"),
      true,
      "Whether white is in check",
    );
    checkEqual(
      hasLegalMove(result.game, "white"),
      false,
      "Whether white can escape",
    );
    checkEqual(result.game.turn, "white", "The player who has no legal move");
  });

  it("No further moves can be played after checkmate", function () {
    // Given a game that has ended in Fool's Mate
    let game = createGame();
    game = playMove(game, "f2", "f3");
    game = playMove(game, "e7", "e5");
    game = playMove(game, "g2", "g4");
    game = playMove(game, "d8", "h4");

    // When White tries to keep playing after checkmate
    const result = movePiece(game, "e2", "e4");

    // Then the move is rejected because the game is finished
    checkEqual(result.ok, false, "Whether a move after checkmate is accepted");
    checkEqual(result.message, "Illegal move.", "The message after checkmate");
  });

  it("A stalemate position has no legal moves but the king is not in check", function () {
    // Given a known stalemate position
    const game = createGame();
    clearBoard(game);

    game.board.h8 = { type: "king", colour: "black", hasMoved: false };
    game.board.f7 = { type: "king", colour: "white", hasMoved: false };
    game.board.g6 = { type: "queen", colour: "white", hasMoved: false };
    game.turn = "black";

    // Then Black is not in check
    checkEqual(isInCheck(game, "black"), false, "Whether black is in check");

    // But Black has no legal moves
    checkEqual(hasLegalMove(game, "black"), false, "Whether black can move");
  });
});
