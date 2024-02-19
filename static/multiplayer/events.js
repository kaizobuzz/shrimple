//@ts-check
const 
Normal=0,
CorrectGuess=1,
OutOfGuesses=2;
/**@typedef Guess 
 * @property {Number[]} results
 * @property {Number} status 
*/
/**@param {Number[]} event 
 * @param {boolean} isguess */
async function sendEvent(isguess, event){ 
    console.log(event);
    let html_to_render="<input hx-swap='delete' hx-trigger='load' hx-include='this' "
    html_to_render+="name="+isguess ? "guess":"event"+" type='hidden' value=\""+event.join(" "); 
    if (isguess){
        let guess_status=0;
        if (isCorrectGuess){
            isCorrectGuess=false;
            guess_status=1;
        } else if (isOutOfGuesses){
            isOutOfGuesses=false;
            guess_status=2;
        }
        html_to_render+=","+guess_status+"\"";
    }
    html_to_render+="/>";
}
/**@typedef Player 
 * @property {Guess[]} newGuesses
 * @property {Number[]} newEffects
*/
async function receiveEvents(){
    const response=await fetch("/api/v1/getevents");
    const player=/**@type Player*/(await response.json());   
    renderGuesses(player.newGuesses)
    renderEffects(player.newEffects);
}
