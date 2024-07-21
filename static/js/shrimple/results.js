// @ts-check
import { MAX_GUESSES } from "../shared/utils.js";
import { Game } from "./game.js";
import { sleep, assertNotNull, getMode } from "../shared/utils.js";
import { getComparisonHtmlByArray } from "../shared/comparison.js";
import { setLocalStorage, addToHistory } from "./localstorage.js";
import { Functions, FinalResultsText, FinalResults, ShareButton, ClipboardMessage } from "./../shared/results.js"
import { renderBarNodes, renderBarNodeAnimation } from "../shared/display.js";
import { getHistory } from "../shared/localstorage.js";
import { GameOverFunctions } from "../shared/submit.js";

export function get_guess_result_emojis(){
    let guess_html="";
    for (const guess of Game.guesses){
        guess_html+=getComparisonHtmlByArray(guess.comparisons).join("")+"\n"
    }
    return guess_html;
}
async function getTextToCopy(){
    let result=Game.won ? Game.num_guesses : "X"; 
    let text_to_copy="Daily Shrimple "+result+"/"+MAX_GUESSES+"\n"+get_guess_result_emojis();
    navigator.clipboard.writeText(text_to_copy);
    ClipboardMessage.style.opacity=String(1);
    await sleep(1);
    ClipboardMessage.style.opacity=String(0);
}
function winGame(){
    Game.won=true;
    Game.active=false;
    setLocalStorage();
    renderEndPopup(true);
}
function loseGame(){
    Game.won=false;
    Game.num_guesses=-1;
    Game.active=false;
    setLocalStorage();
    renderEndPopup(true);
}
/**@param {boolean} from_end*/
export function renderEndPopup(from_end){
    let main_text_node=document.createElement("div");
    FinalResultsText.appendChild(main_text_node);
    if (Game.won){ 
        main_text_node.appendChild(document.createTextNode("You got today's shrimple in "));
        let strong=document.createElement("strong");
        strong.innerText=String(Game.num_guesses)
        main_text_node.appendChild(strong);
        if (Game.num_guesses==1){
            main_text_node.appendChild(document.createTextNode(" guess"));
        } else{
            main_text_node.appendChild(document.createTextNode(" guesses"));
        }
    } else{
        main_text_node.appendChild(document.createTextNode("You didn't get today's shrimple"));
    }
    for (let i=0; i<2; i++){ 
        main_text_node.appendChild(document.createElement("br"));
    }
    renderObjectsOriginally(main_text_node, from_end);
}
async function reloadPage(){
    await sleep(5);
    location.reload(); 
}
async function getRemainingTime(){
    let SecondsInDay=86400;
    let secondsleft=SecondsInDay-(Math.floor(Date.now()/1000)%SecondsInDay);
    if (secondsleft<1){
        await reloadPage();
    }
    return Math.floor((secondsleft/(60*60))%60)+"h "+Math.floor((secondsleft/60))%(60)+"m "+secondsleft%(60)+"s";
}
/**@param {HTMLElement} result_node*
 @param {boolean} from_end*/
async function renderObjectsOriginally(result_node, from_end){
    let history=from_end ? await addToHistory(Game.num_guesses) : assertNotNull(await getHistory(assertNotNull(getMode()), null));
    let result=renderBarNodes(history, result_node)
    let [history_bar_nodes, lengths]=[result.nodes, result.lengths];
    result_node.appendChild(document.createTextNode("Try again in "));
    let time_node=document.createTextNode("");
    result_node.appendChild(time_node);
    let time=await getRemainingTime();
    time_node.nodeValue=time;
    FinalResults.hidden=false;
    FinalResults.style.opacity=String(1);
    ShareButton.disabled=false;
    renderBarNodeAnimation(history_bar_nodes, lengths)
    renderTimer(time_node)
}
/**@param {Text} time_node  */
async function renderTimer(time_node){
    while (true){
        time_node.nodeValue=await getRemainingTime();
        await sleep(1);
    }
}
export function results_setup(){
    GameOverFunctions.win_function=winGame;
    GameOverFunctions.lose_function=loseGame;
    Functions.Clipboard=getTextToCopy;
}
