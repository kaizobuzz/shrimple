//@ts-check
import { assertButtonElement } from "../shared/utils.js"

async function redirectToMultiplayer(){
    let game_id_promise=await fetch("/api/v1/getgameid") 
    let game_id=await game_id_promise.text() 
    window.location.replace("/multiplayer.html?id="+game_id)
}

assertButtonElement(document.getElementById("start-multiplayer")).addEventListener("click", redirectToMultiplayer)
