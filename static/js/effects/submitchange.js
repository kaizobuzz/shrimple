//@ts-check
/**@returns Comparisons */
function setAllHiddenComparison(){
    return {
        name: HiddenComparison, 
        habitat: HiddenComparison,
        length: HiddenComparison,
        coloration: HiddenComparison,
        weight: HiddenComparison,
        max_depth: HiddenComparison,
    }
}
function submitEmptyGuess(){
    const comparisons=setAllHiddenComparison();
    Game.guesses.push(getComparisonHtml(comparisons).join(""));
    let guess_row=getGuessResultHtmlWithClasses(Object.values(comparisons));
    guess_row.classList.add(FLEX_ROW_CLASS);
    let skip_text_col=document.createElement("div");
    guess_row.appendChild(skip_text_col);
    skip_text_col.classList.add(FLEX_COL_CLASS)
    skip_text_col.innerText="Skipped"
    GuessResultsDiv.appendChild(guess_row);
    addGuesses(1);
    SubmitOverride.after_submit(setAllHiddenComparison())
    //TODO will have to change later
}
function resetGuesses(){
    getNewRandomShrimp();
    Game.guesses=[];
    GuessResultsDiv.innerHTML="";
    Game.num_guesses=0;
}

function setLocalStorage(){
}

let LivesDiv=assertNotNull(document.getElementById("lives"));
let OutOfGuessFunction=function(){}

