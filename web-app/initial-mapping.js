// importing square class from class folder
import { Square } from "./square-class.js";
import { addPiecesToObject } from "./pawn-function.js";

const mainMap = [];

for (Let i = 8; i > 0; i--) {

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

mainMap.forEach(function (insiderarray) {
    insiderarray.forEach(function(obj){
        addPiecesToObject(obj);
    });
});
// addPiecesToObject(mainMap);
export { mainMap };