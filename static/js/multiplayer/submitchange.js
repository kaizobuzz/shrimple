//@ts-check
function guessedCorrectShrimp(){
    isCorrectGuess=true;
    resetGuesses();
    sendEvent(MessageType.NewEffect, CurrentEffect); 
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
/**@param {Guess} new_guess 
* @param {string} player_id*/
function renderGuess(new_guess, player_id){
    console.log(new_guess);
    let guessHtml="<div class='other-row'>";
    guessHtml+=getGuessResultHtmlWithClasses(new_guess.Results, "other-column")+"</div>";
    OtherGuessResultsDiv.innerHTML+=guessHtml; 
    if (new_guess.Status==GuessStatus.CorrectGuess){ 
        speedUpTimerPermanent();
        OtherGuessResultsDiv.innerHTML="";
    } else if (new_guess.Status==GuessStatus.OutOfGuesses){
        OtherGuessResultsDiv.innerHTML="";
        OtherPersonLives-=1;
        OtherLivesDiv.innerHTML="<p>Remaining lives: "+Game.lives+"</p>"
    }
}
/**@param {Comparisons} comparisons  */
function eventOnSubmit(comparisons){
    if (!SubmitButton.disabled){     
        resetTimer();
    }
    let guess_status=GuessStatus.Normal;
    if (isOutOfGuesses){
        isOutOfGuesses=false;
        guess_status=GuessStatus.OutOfGuesses;
    }
    if (isCorrectGuess){
        isCorrectGuess=false;
        guess_status=GuessStatus.CorrectGuess;
    }
    sendEvent(MessageType.NewGuess, /**@type Guess*/({
        Results: Object.values(comparisons),
        Status: guess_status}));
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
