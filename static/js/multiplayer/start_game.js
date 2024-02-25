//@ts-check
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
        //TODO getevents
    }
}
async function getState(){
    const get_state_message=/**@type Message*/({
        Type: MessageType.GetState,
        Id: CurrentKeyObject.playerkey,
        Jsondata: "",
    });
    const get_state_response=await fetch("/api/v1/sendevent", {
        method: "POST",
        body: JSON.stringify(get_state_message), 
        headers: {
            "Content-type": JsonContentHeaderValue,
        }
    })
}
async function getPlayerId(e){
    let display_name=e.target.value 
    const join_message=/**@type Message*/({
        Type: MessageType.Join,
        Id: "",
        Jsondata: display_name,
        });
    const join_response=await fetch("/api/v1/getplayerkey", {
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
let GameId=window.location.href.split("?id=")[1] ;
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
