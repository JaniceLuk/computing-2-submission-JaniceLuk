// this file contains all functions that we can export

export function addPawnPieceToObject(obj) {
    const rank = obj.id[1];

    // attaching a function to object of pawn
    obj.movement = function () {

    };

    // black pawn
    if (rank == 7) {
        obj.isPiece = "./pieces/black/pawn.png";
    }   

    // black rook
    if (obj.id == "h8" || obj.id == "a8"){
        obj.isPiece = "./pieces/black/rook.png";
    }

    // black bishop
    if (obj.id == "c8" || obj.id == "f8"){
        obj.isPiece = "./pieces/black/bishop.png";
    }

    // black knight
    if (obj.id == "b8" || obj.id == "g8"){
        obj.isPiece = "./pieces/black/knight.png";
    }

    // black queen
    if (obj.id == "d8" {
        obj.isPiece = "./pieces/black/queen.png";
    }

    // black king
    if (obj.id == "e8" {
        obj.isPiece = "./pieces/black/king.png";
    }



    // white rook
    if (obj.id == "a1" || obj.id == "h1"){
        obj.isPiece = "./pieces/white/rook.png";
    }

    // white knight
    if (obj.id == "b1" || obj.id == "g1"){
        obj.isPiece = "./pieces/white/knight.png";
    }

    // white bishop
    if (obj.id == "c1" || obj.id == "f1"){
        obj.isPiece = "./pieces/white/bishop.png";
    }

    // white pawn
    if (rank == 2) {
        obj.isPiece = "./pieces/white/pawn.png";
    }  

    // white queen
    if (obj.id == "d1" {
        obj.isPiece = "./pieces/white/queen.png";
    }

    // white king
    if (obj.id == "e1" {
        obj.isPiece = "./pieces/white/king.png";
    }


    }
}