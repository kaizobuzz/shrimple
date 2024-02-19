//@ts-check
function submitEmptyGuess(){
    Game.guesses.push("Skipped")
    GuessResultsDiv.innerHTML+="<p>Skipped</p>"
    addGuesses(1);
    //TODO will have to change later
}
/**@param {Guess[]} new_guesses */
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

//submitting has to reset timer
/**@param {Comparisons} comparisons  */
function eventOnSubmit(comparisons){
    if (!SubmitButton.disabled){     
        resetTimer();
    }
    sendEvent(true, Object.values(comparisons));
}
function outOfLives(){ 
    alert("damn 3:");
    Game.active=false;
}
function outOfGuesses(){
    isOutOfGuesses=true;
    getNewRandomShrimp();
    Game.guesses=[];
    GuessResultsDiv.innerHTML="";
    Game.num_guesses=0;
    Game.lives-=1;
    LivesDiv.innerHTML="<p>Remaining lives: "+Game.lives+"</p>";
    if (Game.lives<=0){
        outOfLives();
    }
}
function setLocalStorage(){
}
function guessedCorrectShrimp(){
    isCorrectGuess=true;
    CorrectGuesses+=1;
    ShrimpsGuessedDiv.innerHTML="<p>Correct guesses: "+CorrectGuesses+"</p>";
    getNewRandomShrimp();
    Game.guesses=[];
    GuessResultsDiv.innerHTML="";
    Game.num_guesses=0;
    speedUpTimerPermanent();
    /**@type number[]*/
    let effects=[];
    let random_effect=Math.floor(Math.random()*6);
    effects.push(random_effect);
    console.log(effects);
    renderEffects(effects); 
    sendEvent(false, CurrentEffect); //? 
}

GameOverFunctions.win_function=guessedCorrectShrimp;
GameOverFunctions.lose_function=outOfGuesses;
SubmitOverride.after_submit=eventOnSubmit;
let OtherGuessResultsDiv=assertNotNull(document.getElementById("other-guesses"));
let LivesDiv=assertNotNull(document.getElementById("lives"));
let ShrimpsGuessedDiv=assertNotNull(document.getElementById("correct-guesses"));
let CorrectGuesses=0;
let isOutOfGuesses=false;
let isCorrectGuess=false;
