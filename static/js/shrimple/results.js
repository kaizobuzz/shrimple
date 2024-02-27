// @ts-check
async function getTextToCopy(){
    let result=Game.won ? Game.num_guesses : "X"; 
    let text_to_copy="Daily Shrimple "+result+"/"+MAX_GUESSES+"\n"+Game.guesses.join("\n");
    navigator.clipboard.writeText(text_to_copy);
    ClipboardMessage.style.opacity=String(1);
    await sleep(1);
    ClipboardMessage.style.opacity=String(0);
}
function winGame(){
    Game.won=true;
    renderEndPopup();
}
function loseGame(){
    Game.won=false;
    renderEndPopup();
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
    let promise=getRemainingTime()
    promise.then((remainingtime)=>{
        FinalResultsText.innerHTML=html_to_render+remainingtime;
    });
    FinalResults.hidden=false;
    ShareButton.disabled=false;
    Game.active=false;
}
async function reloadPage(){
    await sleep(5);
    location.reload(); 
}
async function getRemainingTime(){
    let SecondsInDay=86400;
    let secondsleft=SecondsInDay-(Math.floor(Date.now()/1000)%SecondsInDay);
    if (secondsleft==0){
        await reloadPage();
    }
    return Math.floor((secondsleft/(60*60))%60)+"h "+Math.floor((secondsleft/60))%(60)+"m "+secondsleft%(60)+"s</p>"
}
/**@param {string} html_to_render  */
async function renderTimer(html_to_render){
    while (true){
        FinalResultsText.innerHTML=DOMPurify.sanitize(html_to_render)+await getRemainingTime();
        await sleep(1);
    }
}
GameOverFunctions.win_function=winGame;
GameOverFunctions.lose_function=loseGame;
let FinalResults=assertNotNull(document.getElementById("final-results"));
let FinalResultsText=assertNotNull(document.getElementById("final-results-text"));
let ShareButton=assertButtonElement(document.getElementById("share-results"));
let ClipboardMessage=assertNotNull(document.getElementById("clipboard-message"));
let CloseButton=assertButtonElement(document.getElementById("results-close"));
let OpenButton=assertButtonElement(document.getElementById("results-open"));
OpenButton.addEventListener("click", function(){
    OpenButton.hidden=true;
    FinalResults.hidden=false;
});
CloseButton.addEventListener("click", function(){
    OpenButton.hidden=false;
    FinalResults.hidden=true;
});
ShareButton.addEventListener("click", getTextToCopy);

