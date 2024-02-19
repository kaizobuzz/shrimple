//@ts-check
const 
Normal=0,
CorrectGuess=1,
OutOfGuesses=2;
/**@typedef Guess 
 * @property {Number[]} Results
 * @property {Number} Status 
*/
/**@param {Number[]} event 
 * @param {boolean} isguess */
async function sendEvent(isguess, event){ 
    console.log(event);
    let name=(isguess ? "guess":"event") 
    let value=event.join(" "); 
    if (isguess){
        let guess_status=0;
        if (isCorrectGuess){
            isCorrectGuess=false;
            guess_status=1;
        } else if (isOutOfGuesses){
            isOutOfGuesses=false;
            guess_status=2;
        }
        value+=","+guess_status;
    }
    let thing="{'"+name+"': '"+value+"'}"
    console.log(thing)
    htmx.ajax('POST', "/api/v1/sendevents", {values: [name, value], swap: 'none'})
}
/**@typedef Player 
 * @property {Guess[]} NewGuesses
 * @property {Number[]} NewEffects
*/
async function receiveEvents(){
    const response=await fetch("/api/v1/getevents");
    const player=/**@type Player*/(await response.json());   
    renderGuesses(player.NewGuesses)
    renderEffects(player.NewEffects);
}
let HtmxDiv=assertNotNull(document.getElementById("htmx-things"))
