// @ts-check
function get_guess_result_emojis(){
    let guess_html="";
    for (const guess of Game.guesses){
        guess_html+=getComparisonHtmlByArray(guess).join("")+"\n"
    }
    return guess_html;
}
async function getTextToCopy(){
    let result=Game.won ? Game.num_guesses : "X"; 
    let text_to_copy="Daily Shrimple "+result+"/"+MAX_GUESSES+"\n"+get_guess_result_emojis();
    navigator.clipboard.writeText(text_to_copy);
    ClipboardMessage.style.opacity=String(1);
    await sleep(1);
    ClipboardMessage.style.opacity=String(0);
}
function winGame(){
    Game.won=true;
    Game.active=false;
    setLocalStorage();
    renderEndPopup();
}
function loseGame(){
    Game.won=false;
    Game.active=false;
    setLocalStorage();
    renderEndPopup();
}
function renderEndPopup(){
    let main_text_node=document.createElement("div");
    if (Game.won){ 
        main_text_node.appendChild(document.createTextNode("You got today's shrimple in "));
        let strong=document.createElement("strong");
        strong.innerText=String(Game.num_guesses)
        main_text_node.appendChild(strong);
        if (Game.num_guesses==1){
            main_text_node.appendChild(document.createTextNode(" guess"));
        } else{
            main_text_node.appendChild(document.createTextNode(" guesses"));
        }
    } else{
        main_text_node.appendChild(document.createTextNode("You didn't get today's shrimple"));
    }
    for (let i=0; i<2; i++){ 
        main_text_node.appendChild(document.createElement("br"));
    }
    main_text_node.appendChild(document.createTextNode("Try again in "));
    FinalResultsText.appendChild(main_text_node);
    renderTimer(main_text_node);
}
async function reloadPage(){
    await sleep(5);
    location.reload(); 
}
async function getRemainingTime(){
    let SecondsInDay=86400;
    let secondsleft=SecondsInDay-(Math.floor(Date.now()/1000)%SecondsInDay);
    if (secondsleft<1){
        await reloadPage();
    }
    return Math.floor((secondsleft/(60*60))%60)+"h "+Math.floor((secondsleft/60))%(60)+"m "+secondsleft%(60)+"s";
}
/**@param {HTMLElement} result_node  */
async function renderTimer(result_node){
    let time_node=document.createTextNode("");
    result_node.appendChild(time_node);
    let time=await getRemainingTime();
    time_node.nodeValue=time;
    FinalResults.hidden=false;
    FinalResults.style.opacity=String(1);
    ShareButton.disabled=false;
    while (true){
        time_node.nodeValue=await getRemainingTime();
        await sleep(1);
    }
}
GameOverFunctions.win_function=winGame;
GameOverFunctions.lose_function=loseGame;
ClipboardFunction=getTextToCopy;
