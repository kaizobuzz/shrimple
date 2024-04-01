// @ts-check
const MILLISECONDSPERDAY=1000*60*60*24;

function setLocalStorage(){
    localStorage.setItem("time"+mode, String(Date.now()));
    localStorage.setItem("game"+mode, JSON.stringify(Game));
    localStorage.setItem("guess_results"+mode, GuessResultsDiv.innerHTML); 
}
function checkLocalStorage(){
    let time=Number(localStorage.getItem("time"+mode));
    if (time!=null){
        if (Math.floor(Date.now()/MILLISECONDSPERDAY)!=Math.floor(time/MILLISECONDSPERDAY)){
            localStorage.removeItem("time"+mode);
            localStorage.removeItem("game"+mode);
            localStorage.removeItem("guess_results"+mode);
            return [null, null];
        }
    }
    let game=localStorage.getItem("game"+mode);
    let guess_results=localStorage.getItem("guess_results"+mode); 
    return [game, guess_results];
}
/**@param {number} num_guesses  */
function addToHistory(num_guesses){
    let history_string=localStorage.getItem("guess_history"+mode);
    let history=/**@type Number[]*/(history_string!=null ? JSON.parse(history_string) : Array(MAX_GUESSES).fill(0));
    if (num_guesses!=-1){
        history[num_guesses-1]+=1;
    }
    localStorage.setItem("guess_history"+mode, JSON.stringify(history));
    return history;
}
