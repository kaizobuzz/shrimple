//@ts-check
/**@param {Number[]} event 
 * @param {boolean} isguess */
async function sendEvent(isguess, event){ 
    console.log(event);
    let html_to_render="<input hx-swap='delete' hx-trigger='load' hx-include='this' "
    html_to_render+="name="+isguess ? "guess":"event"+" type='hidden' value="+event.join(" ")+"/>";
}
async function receiveEvents(){
    const response=await fetch("/api/v1/getevents");
    const player=await response.json();
    if (!player.hasUnrenderedEvents){
        return;
    }
    renderGuesses(player.newGuesses)
    renderEffects(player.newEffects);
}
