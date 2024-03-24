//@ts-check
function guessedCorrectShrimp(){
    CorrectGuesses+=1;
    ShrimpsGuessedDiv.innerText="Correct guesses: "+CorrectGuesses;
    resetGuesses();    
    speedUpTimerPermanent();
    /**@type number[]*/
    let effects=[];
    let random_effect=Math.floor(Math.random()*6);
    effects.push(random_effect);
    renderEffects(effects); 
}
function outOfGuesses(){
    resetGuesses();
    Game.lives-=1;
    LivesDiv.innerText="Remaining lives: "+Game.lives;
    if (Game.lives<=0){
        outOfLives();
    }
}

function eventOnSubmit(){
    if (!SubmitButton.disabled){     
        resetTimer();
    }
}

GameOverFunctions.win_function=guessedCorrectShrimp;
GameOverFunctions.lose_function=outOfGuesses;
SubmitOverride.after_submit=eventOnSubmit;
let ShrimpsGuessedDiv=assertNotNull(document.getElementById("correct-guesses"));
let CorrectGuesses=0;

