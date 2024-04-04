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
    renderEndPopup(true);
}
function loseGame(){
    Game.won=false;
    Game.num_guesses=-1;
    Game.active=false;
    setLocalStorage();
    renderEndPopup(true);
}
/**@param {boolean} from_end*/
function renderEndPopup(from_end){
    let main_text_node=document.createElement("div");
    FinalResultsText.appendChild(main_text_node);
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
    renderObjectsOriginally(main_text_node, from_end);
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
/**@param {HTMLElement} result_node*
 @param {boolean} from_end*/
async function renderObjectsOriginally(result_node, from_end){
    let history=from_end ? await addToHistory(Game.num_guesses) : await getHistory();
    let sum=history.reduce(function(sum, number){return sum+number}, 0) 
    let lengths=history.map(function(number){return Math.floor((number/sum)*80)})
    let history_bar_nodes=/**@type HTMLDivElement[]*/([])
    for (let i=0; i<history.length; i++){
        let history_node=document.createElement("div");
        history_node.classList.add("row-no-wrap");
        result_node.appendChild(history_node);
        let history_num_node=document.createElement("p"); 
        history_num_node.classList.add("main-flex");
        history_num_node.innerText=String(i+1);
        history_node.appendChild(history_num_node)
        let history_bar_node_container=document.createElement("div");
        history_bar_node_container.classList.add("container-size");
        history_bar_node_container.classList.add("main-flex");
        history_node.appendChild(history_bar_node_container);
        let history_bar_node=document.createElement("div");
        history_bar_nodes.push(history_bar_node);
        history_bar_node_container.appendChild(history_bar_node);
        history_bar_node.classList.add("history-item");
        let count_history_node=document.createElement("p");
        history_node.appendChild(count_history_node);
        count_history_node.classList.add("float-right");
        count_history_node.classList.add("main-flex");
        count_history_node.innerText=String(history[i]);
    }
    result_node.appendChild(document.createTextNode("Try again in "));
    let time_node=document.createTextNode("");
    result_node.appendChild(time_node);
    let time=await getRemainingTime();
    time_node.nodeValue=time;
    FinalResults.hidden=false;
    FinalResults.style.opacity=String(1);
    ShareButton.disabled=false;
    renderBarNodes(history_bar_nodes, lengths)
    renderTimer(time_node)
}
/**@param {HTMLDivElement[]} history_bar_nodes 
 * @param {Number[]} lengths  */
async function renderBarNodes(history_bar_nodes, lengths){
    await sleep(0.1);
    for (let i=0; i<history_bar_nodes.length; i++)
        history_bar_nodes[i].style.width=String(lengths[i])+"%";{
    }
}
/**@param {Text} time_node  */
async function renderTimer(time_node){
        while (true){
        time_node.nodeValue=await getRemainingTime();
        await sleep(1);
    }
}
GameOverFunctions.win_function=winGame;
GameOverFunctions.lose_function=loseGame;
ClipboardFunction=getTextToCopy;
