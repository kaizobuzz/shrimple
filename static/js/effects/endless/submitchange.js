//@ts-check
import { speedUpTimerPermanent, resetTimer } from "./../timer.js";
import { renderEffects } from "./../effects.js";
import { resetGuesses } from "../submitchange.js";

import { Game } from "../../shrimple/game.js";
import { LivesDiv } from "../../elements/effects.js";
import { outOfLives } from "./results.js";
import { SubmitButton } from "../../elements/shrimple.js";
import { assertNotNull } from "../../shared/utils.js";
import { GameOverFunctions, SubmitOverride } from "../../shared/submit.js";

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

export function setup(){
    GameOverFunctions.win_function=guessedCorrectShrimp;
    GameOverFunctions.lose_function=outOfGuesses;
    SubmitOverride.after_submit=eventOnSubmit;
}
let ShrimpsGuessedDiv=assertNotNull(document.getElementById("correct-guesses"));
export let CorrectGuesses=0;

