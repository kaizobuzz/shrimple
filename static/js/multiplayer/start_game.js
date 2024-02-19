async function waitForGameStart(){
    await sleep(1);
    
}

let Player1Accepted=false;
assertButtonElement(document.getElementById("start-button")).addEventListener("click", function(){
    Player1Accepted=true;
});
