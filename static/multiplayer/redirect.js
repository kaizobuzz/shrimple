//@ts-check
const BaseLink="http://localhost:17212/multiplayer.html"

async function redirectToMultiplayer(){
    let game_id_promise=await fetch("/api/v1/getgameid") 
    let game_id=await game_id_promise.text() 
    window.location.replace(BaseLink+"?id="+game_id+"&p=1")
}

assertButtonElement(document.getElementById("start-multiplayer")).addEventListener("click", redirectToMultiplayer)
