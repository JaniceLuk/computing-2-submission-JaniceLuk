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
        console.log(addCircleToElements);
        highlightCircle(addCircleToElements, clickedElement);
    });
}

// track in which squares we added circles
const insertedCircle = [];

// add circle to each element of passed array
const highlightCircle = function (attachCircles, clickedElement) {
    // check the inserted circle
    if(insertedCircle.length != 0) removeMyCircle(insertedCircle);

    // attach the created childs to parent
    attachCircles.forEach((i) => {
        // add class to square in which we want to add circle
        i.classList.add("flex");

        // movement here
        i.addEventListener('click', function(){
            i.innerHTML = clickedElement
            const removeCircleFromThis = attachCircles.filter(el => el !== i);
         //   console.log(removeCircleFromThis);
            removeMyCircle(removeCircleFromThis);
            clickedElement.innerHTML = "";
        });
        // add circle to square 
        i.innerHTML = `<div class="circle"></div>`;

        // add all element in array which we have inserted circles
        insertedCircle.push(i);
    });

    // Remove My Circle
    const removeMyCircle = function (removalArray) {
        removalArray.forEach((i) => {
            i.innerHTML = "";
            i.classList.remove("flex");

        });
    };

    // remove circle from square

