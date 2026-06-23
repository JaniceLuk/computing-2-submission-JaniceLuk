// chess square
// propery -> 2 colours(color == white ? 0 : 1)(white = 0 && black = 1)
// propery -> 2 isHighlighted(true or false)
// propery -> 2 isHint(true or false)
// propery -> 2 isPiece(true or false){
}
// propery -> 2 id(string) 

// each square
export class Square {
    color; // only 2 colours
    isHighlighted; // highlighted with yellow colour or not
    isHint; // small circle in middle square
    isPiece; // if exists a peice then we will return location for image otherwise we will return false
    id; // unique id to recognise the square
    movement; // movement
}