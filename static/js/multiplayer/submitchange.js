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
    LivesDiv.innerText="Remaining lives: "+Game.lives;
    if (Game.lives<=0){
        outOfLives();
    }
}
/**@param {Player} player*/ 
function loseLife(player){
    player.lives--;
    player.lives_node.innerText="Remaining lives: "+player.lives;

}
/**@param {Guess} new_guess 
* @param {string} player_id*/
function renderGuess(new_guess, player_id){
    let player_index=getPlayerIndex(player_id);
    if (player_index==-1){
        console.log(player_id+" not in game");
        return;
    }
    let target_player=Players[player_index];
    target_player.guesses.push(new_guess);
    let guess_div=target_player.guess_node;
    let guessHtml="<div class='other-row'>";
    guessHtml+=getGuessResultHtmlWithClasses(new_guess.Results, "other-column")+"</div>";
    guess_div.innerHTML+=DOMPurify.sanitize(guessHtml); 
    if (new_guess.Status==GuessStatus.CorrectGuess){ 
        speedUpTimerPermanent();
        guess_div.innerHTML="";
    } else if (new_guess.Status==GuessStatus.OutOfGuesses){
        guess_div.innerHTML="";
        loseLife(target_player);
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
SubmitOverride.after_submit=eventOnSubmit;
GameOverFunctions.win_function=guessedCorrectShrimp;
GameOverFunctions.lose_function=outOfGuesses;
let isOutOfGuesses=false;
let isCorrectGuess=false;
