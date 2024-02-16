// @ts-check
const MILLISECONDSPERDAY=1000*60*60*24;

function setLocalStorage(){
    localStorage.setItem("time", String(Date.now()));
    localStorage.setItem("game", JSON.stringify(Game));
    localStorage.setItem("guess_results", GuessResultsDiv.innerHTML); 
}
function checkLocalStorage(){
    let time=Number(localStorage.getItem("time"));
    if (time!=null){
        if (Math.floor(Date.now()/MILLISECONDSPERDAY)!=Math.floor(time/MILLISECONDSPERDAY)){
            localStorage.clear();
            return [null, null];
        }
    }
    let game=localStorage.getItem("game");
    let guess_results=localStorage.getItem("guess_results"); 
    return [game, guess_results];
}
