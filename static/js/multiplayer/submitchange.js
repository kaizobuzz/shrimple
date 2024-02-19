//@ts-check
function guessedCorrectShrimp(){
    isCorrectGuess=true;
    resetGuesses();
    sendEvent(false, CurrentEffect); 
}
function outOfGuesses(){
    isOutOfGuesses=true;
    resetGuesses();
    Game.lives-=1;
    if (Game.lives<=0){
        outOfLives();
    }
}
/**@param {Guess[]} new_guesses*/ 
function renderGuesses(new_guesses){
    console.log(new_guesses);
    for (const guess of new_guesses){
        let guessHtml="<div class='other-row'>"
        guessHtml+=getGuessResultHtmlWithClasses(guess.results, "other-column")+"</div>"
        OtherGuessResultsDiv.innerHTML+=guessHtml 
        if (guess.status==CorrectGuesses){ 
            OtherGuessResultsDiv.innerHTML=""
        } else if (guess.status==OutOfGuesses){
            OtherGuessResultsDiv.innerHTML=""
        }
    }
}
/**@param {Comparisons} comparisons  */
function eventOnSubmit(comparisons){
    if (!SubmitButton.disabled){     
        resetTimer();
    }
    sendEvent(true, Object.values(comparisons));
}
let OtherGuessResultsDiv=assertNotNull(document.getElementById("other-guesses"));
SubmitOverride.after_submit=eventOnSubmit;
GameOverFunctions.win_function=guessedCorrectShrimp;
GameOverFunctions.lose_function=outOfGuesses;
let isOutOfGuesses=false;
let isCorrectGuess=false;
