const arrayofPawn = [];

for (const i of filesNameArray) {
    arrayofPawn.push(document.getElementById(i + 2));
}
for (const i of filesNameArray) {
    arrayofPawn.push(document.getElementById(i + 7));
}

for(const i of arrayofPawn){
    i.addEventListener("click", () => {
        const currentId = i.getAttribute("id");
        console.log(currentId);
        let change = parseInt(currentId[1]);
        const stepsSquare = [];
        for (let i = 0; i < 2; i++) {
            change++
            stepsSquare.push(
                document.getElementById(currentId[0] + change));
        }
        console.log(stepsSquare);
    });
}

// function to add highlighting

const highlightCircle = function ([first, second]) {
    let circle = document.createElement("div");
    let circle2 = document.createElement("div");
    circle.setAttribute("class", "circle");
    circle2.setAttribute("class", "circle");
    first.appendChild(circle);
    second.appendChild(circle2);
    console.log(first, second);
    first.classList.add("flex");
    second.classList.add("flex");
};