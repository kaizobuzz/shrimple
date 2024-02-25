//@ts-check
async function waitForGameStart(){
    let CurrentKey=localStorage.getItem("multiplayer-key")
    if (CurrentKey==null){
        const join_message=/**@type Message*/({
        Type: MessageType.Join,
        Id: "",
        Jsondata: "",
        //TODO jsondata needs to be displayname
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
            if (err==ConflictReasons.DisplayNameTaken){
                //TODO
            }
        }
        CurrentKey=await join_response.text(); 
        localStorage.setItem("multiplayer-key", CurrentKey);
    }
    const get_state_message=/**@type Message*/({
        Type: MessageType.GetState,
        Id: CurrentKey,
        Jsondata: "",
    });
    const get_state_response=await fetch("/api/v1/sendevent", {
        method: "POST",
        body: JSON.stringify(get_state_message), 
        headers: {
            "Content-type": JsonContentHeaderValue,
        }
    })

    await sleep(1); 
}

let Player1Accepted=false;
assertButtonElement(document.getElementById("start-button")).addEventListener("click", function(){
    Player1Accepted=true;
});


