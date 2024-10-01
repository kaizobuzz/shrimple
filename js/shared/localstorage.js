//@ts-check

import { MAX_GUESSES } from "./utils.js";
/** @param {string} mode 
 * @returns {Promise<number[]|null>}*/
export async function getHistory(mode) {
    let history_string = localStorage.getItem("guess_history" + mode);
    let history =/**@type Number[]*/(history_string != null ? JSON.parse(history_string) : Array(MAX_GUESSES).fill(0));
    localStorage.setItem("guess_history" + mode, JSON.stringify(history));
    return history;

}



