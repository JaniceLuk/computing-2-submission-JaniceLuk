// this file contains all functions that we can export

export function addPawnPieceToObject(obj) {
    const rank = obj.id[1];

    // attaching a function to object of pawn
    obj.movement = function () {

    };

    if (rank == 2) {
        return "../pieces/black/pawn.png";
    }   else if (rank == 7) {
        return "../pieces/black/pawn.png";
    }   else {
        return false;
    }
    }
}