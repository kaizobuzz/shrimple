//@ts-check
import { resetGuesses } from "../submitchange.js";
import { sendEvent, MessageType, CurrentEffect, GuessStatus } from "./events.js";
import { Game } from "../state.js";
import { LivesDiv } from "../../elements/effects.js";
import { joinAsSpectator } from "./spectator.js";
import { getPlayerIndex, Players } from "./start_game.js";
import { getGuessResultHtmlWithClasses, SubmitOverride, GameOverFunctions } from "../../shared/submit.js";
import { speedUpTimerPermanent, resetTimer } from "../timer.js";
import { Functions } from "../submitchange.js";
import { SubmitButton } from "../../elements/shrimple.js";
import { loseLife } from "./spectator.js";
/**@typedef {import('./start_game').Guess}Guess*/
/**@typedef {import('./../../shared/comparison').Comparisons}Comparisons*/

function guessedCorrectShrimp(){
    isCorrectGuess=true;
    resetGuesses();
    sendEvent(MessageType.NewEffect, CurrentEffect); 
}
function outOfLives(){
    sendEvent(MessageType.PlayerDied, "")
    joinAsSpectator();
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
/**@param {Guess} new_guess 
* @param {string} player_id*/
export function renderGuess(new_guess, player_id){
    let player_index=getPlayerIndex(player_id);
    if (player_index==-1){
        console.log(player_id+" not in game");
        return;
    }
    let target_player=Players[player_index];
    target_player.guesses.push(new_guess);
    let guess_div=target_player.guess_node;
    let row_div=getGuessResultHtmlWithClasses(new_guess.Results, "other-column");
    row_div.classList.add("other-row")
    guess_div.appendChild(row_div); 
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
    sendEvent(MessageType.NewGuess, /**@type Guess }*/({
        Results: Object.values(comparisons),
        Status: guess_status}));
}
function setup(){
    SubmitOverride.after_submit=eventOnSubmit;
    GameOverFunctions.win_function=guessedCorrectShrimp;
    GameOverFunctions.lose_function=outOfGuesses;
    Functions.OutOfGuess=outOfGuesses;
}
let isOutOfGuesses=false;
let isCorrectGuess=false;
