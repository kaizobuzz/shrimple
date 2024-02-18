//@ts-check
function submitEmptyGuess(){
    Game.guesses.push("Skipped")
    GuessResultsDiv.innerHTML+="<p>Skipped</p>"
    addGuesses(1);
    //TODO will have to change later
}
/**@param {number[]} new_guesses */
function renderGuesses(new_guesses){
    console.log(new_guesses);
}

//submitting has to reset timer

function eventOnSubmit(){
    if (!SubmitButton.disabled){     
        resetTimer();
    }
    //sendEvent ??
}
function outOfLives(){
    alert("damn 3:");
    Game.active=false;
}
function outOfGuesses(){
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
