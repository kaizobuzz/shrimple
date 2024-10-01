// @ts-check
import { getMode, MAX_GUESSES } from "../shared/utils.js";
import { Game } from "./game.js";
import { GuessResultsDiv } from "../elements/shrimple.js";

export const MILLISECONDSPERDAY=1000*60*60*24;

export function getCurrentDate(){
    return Math.floor(Date.now()/MILLISECONDSPERDAY);
}

export function setLocalStorage(){
    const mode = getMode();
    localStorage.setItem("game"+mode, JSON.stringify(Game));
    localStorage.setItem("guess_results"+mode, GuessResultsDiv.innerHTML); 
    localStorage.setItem("date"+mode, String(getCurrentDate()));
}
export function checkLocalStorage(){
    const mode = getMode();
    let game=localStorage.getItem("game"+mode);
    let time=localStorage.getItem("date"+mode);
    if (time!=null&&time!=String(getCurrentDate())){
        localStorage.removeItem("game"+mode);
        localStorage.removeItem("date"+mode);
        return null;
    }
    return game;
}
/**@param {number} num_guesses  
 * @returns {Promise<number[]>}*/
export async function addToHistory(num_guesses){ 
    const mode = getMode();
    let history_string=localStorage.getItem("guess_history"+mode);
    let history=/**@type Number[]*/(history_string!=null ? JSON.parse(history_string) : Array(MAX_GUESSES).fill(0));
    if (num_guesses!=-1){
        history[num_guesses-1]+=1;
    }
    localStorage.setItem("guess_history"+mode, JSON.stringify(history));
    return history;
}

