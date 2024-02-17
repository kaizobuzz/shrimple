//@ts-check
/**@param {Number[]} event */
async function sendEvent(event){ 
    console.log(event);
}
async function receiveEvents(){
    const response=await fetch("/getevents");
    const player=await response.json();
    if (!player.hasUnrenderedEvents){
        return;
    }
    renderGuesses(player.newGuesses)
    renderEffects(player.newEffects);
}
