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
    let html_to_render_dirty=FLEX_ROW
    html_to_render_dirty+=getGuessResultHtmlWithClasses(Object.values(comparisons));
    html_to_render_dirty+="<div class='column'> Skipped </div> </div>"
    GuessResultsDiv.innerHTML+=DOMPurify.sanitize(html_to_render_dirty);
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

