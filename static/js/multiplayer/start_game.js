//@ts-check

/**@typedef  PlayerListItem
 *@property {string} Name 
 *@property {boolean} IsReady
 * */
async function waitForGameStart(){ 
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
    let response_message=await sendEvent(MessageType.GetState, "")
    if (response_message.Type!=MessageType.PlayerList){
        console.error("wrong message type ?")
    }
    let player_list=/**@type PlayerListItem[]*/(JSON.parse(response_message.Jsondata)) 
    for (const player of player_list){
        addPlayer(player);
    }
}
/**@param {PlayerListItem} player */
function addPlayer(player){

}
async function getPlayerId(e){
    let display_name=/**@type string*/(e.target.value) 
    const join_message=/**@type Message*/({
        Type: MessageType.Join,
        Id: "",
        Jsondata: display_name,
        });
    const join_response=await fetch("/api/v1/newjoin", {
            method: "POST",
            body: JSON.stringify(join_message),
            headers: {
            "Content-type": JsonContentHeaderValue 
            }
        })
    if (join_response.status==http.StatusGone){
        redirectOut();
    }
    if (join_response.status==http.StatusConflict){
        const err=await join_response.text();
        if (err==ConflictReasons.GameAlreadyStarted){
            return
        } else if (err==ConflictReasons.DisplayNameTaken){
            DisplayNameInputResult.innerText="Display Name Taken"
            return
        }
    }
    let CurrentKey=await join_response.text(); 
    CurrentKeyObject={
        game: GameId,
        playerkey: CurrentKey 
    }
    localStorage.setItem("multiplayer-key", JSON.stringify(CurrentKeyObject));
    DisplayNameInput.hidden=true;
}
let PlayerAccepted=false;
assertButtonElement(document.getElementById("start-button")).addEventListener("click", function(){
    PlayerAccepted=true;
    sendEvent(MessageType.Ready, "")
});

let DisplayNameInput=assertInputElement(document.getElementById("display-name-input"));
let DisplayNameInputResult=assertNotNull(document.getElementById("display-name-input-result"));
DisplayNameInput.addEventListener("submit", getPlayerId);
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
        DisplayNameInput.hidden=true;
    }
}
let Players=[]
