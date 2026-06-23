"use strict";

// push all pawn elements inside this array
const arrayofPawn = [];

// push my black pawn elements
for (const i of filesNameArray) {
    arrayofPawn.push(document.getElementById(i + 2));
}

// push my white pawn elements
for (const i of filesNameArray) {
    arrayofPawn.push(document.getElementById(i + 7));
}

// add eventlistner on all pawn elements(arrayOfPawn)
for(const i of arrayofPawn){
    i.addEventListener("click", () => {
        // print clicked pawn element
        // console.log(i);

        // store clicked element
        const clickedElement = i;

        // find id of clicked element
        const currentId = i.getAttribute("id");

        // print id of clicked pawn element
        console.log(currentId);

        // get the number from id
        let change = parseInt(currentId[1]);
        console.log(change);

        // array of elements that we want to add circles
        const addCircleToElements = [];

        // push elements in array (to which we want to add circles)
        for (let i = 0; i < 2; i++) {
            change++
            addCircleToElements.push(
                document.getElementById(currentId[0] + change));
        }
        // add circle to each elements of passed array
        highlightCircle(addCircleToElements);
    });
}

// array to track circles
const trackCircleArray = [];

// add circle to each element of passed array
const highlightCircle = function (attachCircles) {

    if(trackCircleArray.length != 0){
        undoCircle(trackCircleArray);

    }

    // create child element
    const child = `<div class="circle"></div>`

    attachCircles.forEach((el) => {
        el.innerHTML = child;
        el.classlist.add("flex");
        trackCircleArray.push(el);
    });
    console.log(trackCircleArray);
};

// remove circles from elements
const undoCircle = function(circlesArray){
    circlesArray.forEach((cur)=>{
        cur.innerHTML = "";
        cur.classList.remove("circle");
    });
};