// @ts-check
async function getTextToCopy(){
    let result=Game.won ? Game.num_guesses : "X"; 
    let text_to_copy="Daily Shrimple "+result+"/"+MAX_GUESSES+"\n"+Game.guesses.join("\n");
    navigator.clipboard.writeText(text_to_copy);
    ClipboardMessage.style.opacity=String(1);
    await sleep(1);
    ClipboardMessage.style.opacity=String(0);
}

function renderEndPopup(){
    let html_to_render="";
    if (Game.won){ 
        html_to_render+="<p>You got today's shrimple in <strong>"+Game.num_guesses+"</strong> "; 
        if (Game.num_guesses==1){
            html_to_render+="guess"
        } else{
            html_to_render+="guesses";
        }
    } else{
        html_to_render+="<p>You didn't get today's shrimple"
    }
    html_to_render+="<br><br>Try again in ";
    renderTimer(html_to_render);
    FinalResultsText.innerHTML=html_to_render+getRemainingTime();
    FinalResults.hidden=false;
    ShareButton.disabled=false;
}
async function reloadPage(){
    await sleep(1);
    location.reload(); 
}
function getRemainingTime(){
    let SecondsInDay=86400;
    let secondsleft=SecondsInDay-(Math.floor(Date.now()/1000)%SecondsInDay);
    if (secondsleft==0){
        reloadPage();
    }
    return Math.floor((secondsleft/(60*60))%60)+"h "+Math.floor((secondsleft/60))%(60)+"m "+secondsleft%(60)+"s</p>"
}
/**@param {string} html_to_render  */
async function renderTimer(html_to_render){
    while (true){
        FinalResultsText.innerHTML=html_to_render+getRemainingTime();
        await sleep(1);
    }
}

let FinalResults=assertNotNull(document.getElementById("final-results"));
let FinalResultsText=assertNotNull(document.getElementById("final-results-text"));
let ShareButton=assertButtonElement(document.getElementById("share-results"));
let ClipboardMessage=assertNotNull(document.getElementById("clipboard-message"));
ShareButton.addEventListener("click", getTextToCopy);

