// chess square
// propery -> 2 colours(color == white ? 0 : 1)(white = 0 && black = 1)
// propery -> 2 isHighlighted(true or false)
// propery -> 2 isHint(true or false)
// propery -> 2 isPiece(true or false){
}
// propery -> 2 id(string) 

const mainMap = [];
class Square {
    color;
    isHighlighted;
    isHint;
    isPiece;
    id;
}

for (let i = 8; i > 0; i--) {

    const isRowEven = i % 2 == 0 ? true : false;
    const rowArray = [];
    for (let j = 97; j < 105; j++) {
        const fileName = String.fromCharCode(j);
        const id = fileName + i;
        // create object of squares
        const square = new Square();

        // set properties
        square.id = id;

        // color
        // odd row ==> odd element
        if(!isRowEven && !isElementEven){
            square.color = 'dark'
        }

        // even row ==> odd element
        if(!isRowEven && !isElementEven){
            square.color = 'light'
        }

        // odd row ==> even element
        if(!isRowEven && !isElementEven){
            square.color = 'light'
        }

        // even row ==> even element
        if(!isRowEven && !isElementEven){
            square.color = 'dark'
        }

        // push array
        rowArray.push(square);
    }
    mainMap.push(rowArray);
}

import * as silicon from './renderHTML.js';
silicon.renderUI(mainMap);