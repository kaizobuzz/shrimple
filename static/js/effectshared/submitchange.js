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
    Game.guesses.push("Skipped")
    GuessResultsDiv.innerHTML+="<p>Skipped</p>"
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
function outOfLives(){ 
    alert("damn 3:");
    Game.active=false;
}
function setLocalStorage(){
}

let LivesDiv=assertNotNull(document.getElementById("lives"));

