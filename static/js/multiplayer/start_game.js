//@ts-check
async function waitForGameStart(){
    let CurrentKey=localStorage.getItem("multiplayer-key")
    if (CurrentKey==null){
        CurrentKey=String(Date.now()); 
        localStorage.setItem("multiplayer-key", CurrentKey); 
    }
    let response=await fetch("/api/v1/sendplayerkey", {
        method: "POST",
        body: "key="+CurrentKey,
        headers: {
            "Content-type": "application/x-www-form-urlencoded"
        }
    })
    let response_string=await response.text();
    checkTimeout(response_string);
    await sleep(1); 
}

let Player1Accepted=false;
assertButtonElement(document.getElementById("start-button")).addEventListener("click", function(){
    Player1Accepted=true;
});


