//@ts-check
/**@typedef Player 
 * @property {Guess[]} guesses 
 * @property {string} name
 * @property {boolean} is_ready
 * @property {HTMLDivElement} node
 * @property {HTMLDivElement} guess_node 
 * @property {HTMLDivElement} lives_node
 * @property {Number} lives
 * */
/**@typedef  PlayerListItem
 *@property {string} Name 
 *@property {boolean} IsReady
 * */

async function waitForGameStart(){ 
    await sleep(1);
    while (true){
        await sleep(1); 
        if (CurrentKeyObject.playerkey!=""){
            getState();
            break;
        }
    }
    while (true){
        await sleep(1); 
        receiveEvents();
        if (Game.active==true){
           return 
        }
    }
}
async function getState(){
    let response_message=await sendEvent(MessageType.GetStartState, "")
    if (response_message==undefined){
        return;
    }
    if (response_message.Type!=MessageType.PlayerList){
        console.error("wrong message type ?")
        return;
    }
    let player_list=/**@type PlayerListItem[]*/(JSON.parse(response_message.Jsondata)) 
    for (const player of player_list){
        addPlayer(player);
    }
}
/**@param {PlayerListItem} player */
function addPlayer(player){
    let node=document.createElement("div");
    node.classList.add("other-player");
    node.style.transform=("translate:(0, 50%)")
    node.innerText=player.Name;
    let guess_node=document.createElement("div");
    let lives_node=document.createElement("div");
    node.appendChild(guess_node);
    node.appendChild(lives_node);
    document.body.appendChild(node);
    Players.push({
        name: player.Name,
        is_ready: player.IsReady,
        node: node,
        guess_node: guess_node,
        lives_node: lives_node,
        guesses: [],
        lives: 3,
    })
}

/**@param {string} player_name*/
function getPlayerIndex(player_name){
    console.log(player_name);
    console.log(Players);
    return Players.findIndex((element)=>{
        return element.name==player_name;
    })
}
async function getPlayerId(){
    DisplayName=/**@type string*/DisplayNameInput.value; 
    const join_message=/**@type Message*/({
        Type: MessageType.Join,
        Id: "",
        Jsondata: DisplayName,
        });
    console.log(join_message);
    const join_response=await fetch("/api/v1/newjoin", {
            method: "POST",
            body: JSON.stringify(join_message),
            headers: {
            "Content-type": JsonContentHeaderValue 
            }
        })
    if (!join_response.ok){
        if (join_response.status==http.StatusGone){
            redirectOut();
        }
        if (join_response.status==http.StatusConflict){
            const err=await join_response.text();
            if (err==ConflictReasons.GameAlreadyStarted){
            } else if (err==ConflictReasons.DisplayNameTaken){
                DisplayNameInputResult.innerText="Display Name Taken"
            }
        }
        return
    }
    let CurrentKey=await join_response.text(); 
    CurrentKeyObject={
        game: GameId,
        playerkey: CurrentKey 
    }
    //localStorage.setItem("multiplayer-key", JSON.stringify(CurrentKeyObject));
    MainDiv.style.filter="";
    DisplayNameInputDiv.hidden=true;
    getState();
}
let MainDiv=assertNotNull(document.getElementById("main-game"));
MainDiv.style.filter="blur(3em)";
let PlayerAccepted=false;
let DisplayName="";
let DisplayNameInputDiv=assertNotNull(document.getElementById("display-name-input-div"));
let DisplayNameInput=assertInputElement(document.getElementById("display-name-input"));
let DisplayNameInputResult=assertNotNull(document.getElementById("display-name-input-result"));
assertButtonElement(document.getElementById("name-submit"))?.addEventListener("click", getPlayerId)
let GameId=window.location.href.split("?id=")[1];
let CurrentKeyObject={
    game: "",
    playerkey: "",
};
let CurrentKeyString=localStorage.getItem("multiplayer-key");
if (CurrentKeyString!=null){
    CurrentKeyObject=JSON.parse(CurrentKeyString);
    if (CurrentKeyObject.game!=GameId){
        CurrentKeyObject={
            game: "",
            playerkey: ""
        }; 
        localStorage.removeItem("multiplayer-key");
    } else{
        DisplayNameInputDiv.hidden=true;
        MainDiv.style.filter="";
    }
}
let Players=/**@type Player[]*/([]);
let StartButton=assertButtonElement(document.getElementById("start-button")) 
StartButton.addEventListener("click", function(){
    if (StartButton.innerText=="ready"){
        PlayerAccepted=true;
        sendEvent(MessageType.Ready, "");
        StartButton.innerText="unready";
    } else{
        PlayerAccepted=false;
        sendEvent(MessageType.Unready, "");
        StartButton.innerText="ready";
    }
});


