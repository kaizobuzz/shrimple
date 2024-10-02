// @ts-check
//

import { Game } from "../shrimple/game.js";
import { getRandomIndex, FRAME_TIME } from "./utils.js";
import { isInputShrimpValid, SubmitOverride, disableSubmitFunctionOverride, GameOverFunctions } from "../shared/submit.js";
import { PlayerInput, SubmitButton, GuessResultsDiv } from "../elements/shrimple.js";
import { sleep } from "../shared/utils.js";
import { TimerStats } from "./timer.js";
import { AutofillDisabled } from "../shared/autofill.js";

const PROMPT_LENGTH=3;
const BOMB_TIMER_SECONDS=15;

function getBombPartyPrompt(){
    const index=getRandomIndex(Game.shrimp_list);
    const shrimp_words=Game.shrimp_list[index].name.split(" ").join("");
    let prompt_index=getRandomIndex(shrimp_words)-(PROMPT_LENGTH);
    if (prompt_index<0){
        prompt_index=0;
    }
    console.log(shrimp_words);
    console.log(prompt_index);
    let next_prompt=shrimp_words.slice(prompt_index, prompt_index+PROMPT_LENGTH).toLowerCase();
    return next_prompt;
    //const wordindex=Math.floor(Math.random()*shrimp_words.length);
    //const shrimp_word=shrimp_words[wordindex];
}
/**@param {string} input*/
function canSubmitForBomb(input){
    if (isInputShrimpValid(input)){
        let stripped_input=input.toLowerCase().split(" ").join("");
        return stripped_input.includes(CurrentPrompts[0]);
    }
    return false;
}
function submitShrimpForBomb(){
    CurrentPrompts.shift();
    PlayerInput.value="";
    SubmitButton.disabled=true;
    if (CurrentPrompts.length<=0){
        return
    }
    //TODO need to update the bomb visuals
}
async function useBomb(){
    const current_prompt=CurrentPrompts[0];
    //TODO render bomb
    let time_remaining=BOMB_TIMER_SECONDS;
    while (current_prompt===CurrentPrompts[0]){
        console.log(current_prompt, CurrentPrompts[0]);
        GuessResultsDiv.innerText="Bomb party prompt:"+current_prompt+
            ", Remaining time: "+Math.floor(time_remaining)+"s";
        await sleep(FRAME_TIME);
        time_remaining-=FRAME_TIME;
        if (time_remaining<=0){
           //TODO explode bomb 
            submitShrimpForBomb();
            GameOverFunctions.lose_function();
            break;
        }
    }
}
async function checkForBombs(){
    if (BombPartyActive===true){
        return;
    }
    let timer_duration=TimerStats.duration;
    TimerStats.duration=1000000;
    const guesshtml=GuessResultsDiv.innerHTML;
    AutofillDisabled.disabled_stacks+=1;
    BombPartyActive=true;
    SubmitOverride.submit_function=submitShrimpForBomb;
    SubmitOverride.can_submit_function=canSubmitForBomb;
    while (CurrentPrompts.length>0){
        await useBomb();
    }
    TimerStats.duration=timer_duration;
    AutofillDisabled.disabled_stacks-=1;
    BombPartyActive=false;
    disableSubmitFunctionOverride();
    GuessResultsDiv.innerHTML=guesshtml;
}
export function startBombParty(){
    CurrentPrompts.push(getBombPartyPrompt());
    checkForBombs();
}

let BombPartyActive=false;
export let BombDisabled=true;
/** @type {string[]}*/
let CurrentPrompts=[];
