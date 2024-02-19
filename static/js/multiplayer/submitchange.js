//@ts-check
function guessedCorrectShrimp(){
    isCorrectGuess=true;
    resetGuesses();
    sendEvent(false, [CurrentEffect]); 
}
function outOfGuesses(){
    isOutOfGuesses=true;
    resetGuesses();
    Game.lives-=1;
    LivesDiv.innerHTML="<p>Remaining lives: "+Game.lives+"</p>";
    if (Game.lives<=0){
        outOfLives();
    }
}
/**@param {Guess[]} new_guesses*/ 
function renderGuesses(new_guesses){
    console.log(new_guesses);
    for (const guess of new_guesses){
        let guessHtml="<div class='other-row'>";
        guessHtml+=getGuessResultHtmlWithClasses(guess.Results, "other-column")+"</div>";
        OtherGuessResultsDiv.innerHTML+=guessHtml; 
        if (guess.Status==CorrectGuess){ 
            speedUpTimerPermanent();
            OtherGuessResultsDiv.innerHTML="";
        } else if (guess.Status==OutOfGuesses){
            OtherGuessResultsDiv.innerHTML="";
            OtherPersonLives-=1;
            OtherLivesDiv.innerHTML="<p>Remaining lives: "+Game.lives+"</p>"
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
let OtherLivesDiv=assertNotNull(document.getElementById("other-lives"));
let OtherPersonLives=Game.lives;
OtherLivesDiv.innerHTML="<p>Remaining lives: "+OtherPersonLives+"</p>"
SubmitOverride.after_submit=eventOnSubmit;
GameOverFunctions.win_function=guessedCorrectShrimp;
GameOverFunctions.lose_function=outOfGuesses;
let isOutOfGuesses=false;
let isCorrectGuess=false;
