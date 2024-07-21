//@ts-check

import { Game } from "./../state.js";
import { ClipboardMessage, FinalResultsText, FinalResults, ShareButton, Functions } from "./../../shared/results.js";
import { CorrectGuesses } from "./submitchange.js";
import { sleep, assertButtonElement } from "../../shared/utils.js";
async function copyToClipboard(){
    let text_to_copy="Shrimple endless: "+String(CorrectGuesses)+" correct guesses gotten";
    navigator.clipboard.writeText(text_to_copy);
    ClipboardMessage.style.opacity=String(1);
    await sleep(1);
    ClipboardMessage.style.opacity=String(0);
}

export function outOfLives(){
    Game.active=false;
    FinalResultsText.innerText="You got "+String(CorrectGuesses)+" correct guesses before losing all your lives"; 
    FinalResults.hidden=false;
    ShareButton.disabled=false;
}
export function setup(){
Functions.Clipboard=copyToClipboard;
let ReloadButton=assertButtonElement(document.getElementById("reload"));
ReloadButton.addEventListener("click", function(){
    window.location.reload();
});
}
