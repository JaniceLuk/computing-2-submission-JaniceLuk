import {
  createGame,
  getLegalMoves,
  hasLegalMove,
  isInCheck,
  isLegalMove,
  movePiece,
  pieceSymbol,
} from "../chess.js";

function clearBoard(game) {
  Object.keys(game.board).forEach(function (square) {
    game.board[square] = null;
  });
}

function checkEqual(result, expected, message) {
  if (result !== expected) {
    throw new Error(
      `${message}: ${result} was returned, when ${expected} was expected.`
    );
  }
}

function checkDeepEqual(result, expected, message) {
  if (JSON.stringify(result) !== JSON.stringify(expected)) {
    throw new Error(
      `${message}: ${JSON.stringify(result)} was returned, ` +
        `when ${JSON.stringify(expected)} was expected.`
    );
  }
}

describe("Creating a new chess game", function () {
  it("A new game starts with 32 pieces", function () {
    const game = createGame();
    const result = Object.values(game.board).filter(Boolean).length;
    const expected = 32;

    checkEqual(result, expected, "The number of pieces on the board");
  });

  it("A new game starts with white to move", function () {
    const game = createGame();

    checkEqual(game.turn, "white", "The first player to move");
  });

  it("A new game places the kings on e1 and e8", function () {
    const game = createGame();

    checkEqual(game.board.e1.type, "king", "The piece on e1");
    checkEqual(game.board.e8.type, "king", "The piece on e8");
  });
});

describe("Getting legal chess moves", function () {
  it("A pawn can move one or two squares from its starting square", function () {
    const game = createGame();
    const result = getLegalMoves(game, "e2").sort();
    const expected = ["e3", "e4"];

    checkDeepEqual(result, expected, "The legal moves for the pawn on e2");
  });

  it("A player cannot move an opponent's piece on the wrong turn", function () {
    const game = createGame();
    const result = getLegalMoves(game, "e7");
    const expected = [];

    checkDeepEqual(result, expected, "The legal moves for the black pawn on e7");
  });

  it("Invalid square input returns no legal moves", function () {
    const game = createGame();
    const result = getLegalMoves(game, "z9");
    const expected = [];

    checkDeepEqual(result, expected, "The legal moves for an invalid square");
  });
});

describe("Moving chess pieces", function () {
  it("A legal move changes the board, changes the turn, and records history", function () {
    const game = createGame();

    // When white moves a pawn from e2 to e4
    const result = movePiece(game, "e2", "e4");

    // Then the move is accepted and the board state changes
    checkEqual(result.ok, true, "Whether the move was accepted");
    checkEqual(result.game.board.e4.type, "pawn", "The piece on e4");
    checkEqual(result.game.board.e2, null, "The piece on e2");
    checkEqual(result.game.turn, "black", "The next player to move");
    checkEqual(result.game.history.length, 1, "The number of moves in history");
  });

  it("A rook cannot move through pieces", function () {
    const game = createGame();
    const result = movePiece(game, "a1", "a4");

    checkEqual(result.ok, false, "Whether a blocked rook move was accepted");
  });

  it("A bishop cannot move through pieces", function () {
    const game = createGame();
    const result = movePiece(game, "c1", "h6");

    checkEqual(result.ok, false, "Whether a blocked bishop move was accepted");
  });

  it("A queen cannot move through pieces", function () {
    const game = createGame();
    const result = movePiece(game, "d1", "h5");

    checkEqual(result.ok, false, "Whether a blocked queen move was accepted");
  });

  it("An invalid destination square is rejected", function () {
    const game = createGame();
    const result = movePiece(game, "e2", "z9");

    checkEqual(result.ok, false, "Whether the invalid move was accepted");
    checkEqual(result.message, "Illegal move.", "The invalid move message");
  });
});

describe("Capturing chess pieces", function () {
  it("A captured piece is added to the captured pieces list", function () {
    let game = createGame();

    // Given a position where a white pawn can capture a black pawn
    game = movePiece(game, "e2", "e4").game;
    game = movePiece(game, "d7", "d5").game;

    // When the white pawn captures the black pawn
    const result = movePiece(game, "e4", "d5");

    // Then the captured pawn is recorded
    checkEqual(result.ok, true, "Whether the capture was accepted");
    checkEqual(result.game.captured.length, 1, "The number of captured pieces");
    checkEqual(result.game.captured[0].type, "pawn", "The captured piece type");
    checkEqual(
      result.game.captured[0].colour,
      "black",
      "The captured piece colour"
    );
  });

  it("A king cannot be captured directly", function () {
    const game = createGame();

    clearBoard(game);

    game.board.e1 = { type: "king", colour: "white", hasMoved: false };
    game.board.e8 = { type: "king", colour: "black", hasMoved: false };
    game.board.e7 = { type: "queen", colour: "white", hasMoved: false };
    game.turn = "white";

    const legalMove = isLegalMove(game, "e7", "e8");
    const result = movePiece(game, "e7", "e8");

    checkEqual(
      legalMove,
      false,
      "Whether moving onto the enemy king's square is legal"
    );
    checkEqual(result.ok, false, "Whether the king capture was accepted");
    checkEqual(result.game.board.e8.type, "king", "The piece remaining on e8");
  });
});

describe("Promoting pawns", function () {
  it("A pawn promotes to a queen by default", function () {
    const game = createGame();

    clearBoard(game);

    game.board.e1 = { type: "king", colour: "white", hasMoved: false };
    game.board.e8 = { type: "king", colour: "black", hasMoved: false };
    game.board.a7 = { type: "pawn", colour: "white", hasMoved: false };
    game.turn = "white";

    const result = movePiece(game, "a7", "a8");

    checkEqual(result.ok, true, "Whether the promotion move was accepted");
    checkEqual(result.game.board.a8.type, "queen", "The promoted piece type");
    checkEqual(
      result.game.board.a8.colour,
      "white",
      "The promoted piece colour"
    );
  });
});

describe("Check, checkmate, stalemate and king safety", function () {
  it("A king is in check when it is attacked by an opponent piece", function () {
    let game = createGame();

    game = movePiece(game, "e2", "e4").game;
    game = movePiece(game, "f7", "f5").game;
    game = movePiece(game, "d1", "h5").game;

    checkEqual(isInCheck(game, "black"), true, "Whether black is in check");
  });

  it("A piece cannot move if that leaves its own king in check", function () {
    const game = createGame();

    clearBoard(game);

    game.board.e1 = { type: "king", colour: "white", hasMoved: false };
    game.board.e8 = { type: "king", colour: "black", hasMoved: false };
    game.board.e2 = { type: "rook", colour: "white", hasMoved: false };
    game.board.e7 = { type: "rook", colour: "black", hasMoved: false };
    game.turn = "white";

    const result = isLegalMove(game, "e2", "a2");
    const expected = false;

    checkEqual(
      result,
      expected,
      "Whether a pinned rook can move away from its king"
    );
  });

  it("Fool's mate is detected as checkmate", function () {
    let game = createGame();

    game = movePiece(game, "f2", "f3").game;
    game = movePiece(game, "e7", "e5").game;
    game = movePiece(game, "g2", "g4").game;

    const result = movePiece(game, "d8", "h4");

    checkEqual(result.ok, true, "Whether the checkmate move was accepted");
    checkEqual(
      result.game.status,
      "checkmate",
      "The game status after Fool's mate"
    );
    checkEqual(result.game.winner, "black", "The winner after Fool's mate");
  });

  it("A stalemate position has no legal moves but is not check", function () {
    const game = createGame();

    clearBoard(game);

    game.board.h8 = { type: "king", colour: "black", hasMoved: false };
    game.board.f7 = { type: "king", colour: "white", hasMoved: false };
    game.board.g6 = { type: "queen", colour: "white", hasMoved: false };
    game.turn = "black";

    checkEqual(isInCheck(game, "black"), false, "Whether black is in check");
    checkEqual(
      hasLegalMove(game, "black"),
      false,
      "Whether black has any legal moves"
    );
  });
});

describe("User interface helper functions", function () {
  it("A white queen has a readable display symbol", function () {
    const result = pieceSymbol({
      type: "queen",
      colour: "white",
      hasMoved: false,
    });
    const expected = "♕";

    checkEqual(result, expected, "The display symbol for a white queen");
  });
});