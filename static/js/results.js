async function getTextToCopy(){
    let text_to_copy="Daily Shrimple "+Game.num_guesses+"/"+MAX_GUESSES+"\n"+Game.guesses.join("\n");
    navigator.clipboard.writeText(text_to_copy);
    ClipboardMessage.style.opacity=1;
    await sleep(1);
    ClipboardMessage.style.opacity=0;
}

function renderEndPopup(){
    let html_to_render="<p>You got today's shrimple in <strong>"+Game.num_guesses+"</strong> "; 
    if (Game.num_guesses==1){
        html_to_render+="guess"
    } else{
        html_to_render+="guesses";
    }
    html_to_render+="<br><br>Try again in ";
    renderTimer(html_to_render);
    FinalResultsText.innerHTML=html_to_render+getRemainingTime();
    FinalResults.hidden=false;
    ShareButton.disabled=false;
}
function getRemainingTime(){
    let SecondsInDay=86400;
    let secondsleft=SecondsInDay-(Math.floor(new Date()/1000)%SecondsInDay);
    return Math.floor((secondsleft/(60*60))%60)+"h "+Math.floor((secondsleft/60))%(60)+"m "+secondsleft%(60)+"s"
}
async function renderTimer(html_to_render){
    while (true){
        FinalResultsText.innerHTML=html_to_render+getRemainingTime();
        await sleep(1);
    }
}

let FinalResults=document.getElementById("final-results");
let FinalResultsText=document.getElementById("final-results-text");
let ShareButton=document.getElementById("share-results");
let ClipboardMessage=document.getElementById("clipboard-message");
ShareButton.addEventListener("click", getTextToCopy);

