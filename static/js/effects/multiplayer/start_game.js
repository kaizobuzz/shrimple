//@ts-check
import {sleep, assertNotNull, assertButtonElement, assertInputElement} from "./../../shared/utils.js";
import {Game, initializeGameVariablesFromServer} from "./../state.js";
import {startGameLoop} from "./game_loop.js";
import { redirectOut, sendEvent, ConflictReasons, receiveEvents, MessageType, http, JsonContentHeaderValue } from "./events.js";
import { setup } from "../../shared/setup.js";
import { submit_change_setup } from "./submitchange.js"; 
import { chat_setup } from "./chat.js";

/**@typedef {import('./events.js').Guess} Guess 
 * @typedef {import('./events.js').Message} Message
 */
 
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
export function addPlayer(player){
    let node=document.createElement("div");
    node.classList.add("other-player");
    node.style.transform=("translate:(0, 50%)")
    node.innerText=player.Name;
    let guess_node=document.createElement("div");
    let lives_node=document.createElement("div");
    node.appendChild(guess_node);
    node.appendChild(lives_node);
    OtherPlayersDiv.appendChild(node);
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
export function getPlayerIndex(player_name){
    console.log(player_name);
    console.log(Players);
    return Players.findIndex((element)=>{
        return element.name==player_name;
    })
}
function nameChosenFilter(){
    MainDiv.style.filter="";
    DisplayNameInputDiv.hidden=true;
    StartButton.hidden=false;
}
async function getPlayerId(){
    DisplayName=/**@type string*/DisplayNameInput.value; 
    const join_message=/**@type Message*/({
        Type: MessageType.Join,
        Id: "",
        Jsondata: DisplayName,
        });
    console.log(join_message);
    const message_string=JSON.stringify(join_message);
    const join_response=await fetch("/api/v1/newjoin", {
            method: "POST",
            body: message_string,
            headers: {
            "Content-type": JsonContentHeaderValue,
            //"Content-length": String(message_string.length),
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
    nameChosenFilter();
}
const DisplayNameInputDiv=assertNotNull(document.getElementById("display-name-input-div"));
const DisplayNameInput=assertInputElement(document.getElementById("display-name-input"));
const DisplayNameInputResult=assertNotNull(document.getElementById("display-name-input-result"));
const OtherPlayersDiv=assertNotNull(document.getElementById("other-players"));
const MainDiv=assertNotNull(document.getElementById("main-game"));
const urlParams = new URLSearchParams(window.location.search);
export let DisplayName="";
export const GameId=assertNotNull(urlParams.get("id"));
export let CurrentKeyObject={
    game: "",
    playerkey: "",
};

setup(false);
chat_setup();
submit_change_setup();
MainDiv.style.filter="blur(3em)";
let PlayerAccepted=false;
assertButtonElement(document.getElementById("name-submit"))?.addEventListener("click", getPlayerId)
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
        nameChosenFilter();
    }
}
export let Players=/**@type Player[]*/([]);
export let StartButton=assertButtonElement(document.getElementById("start-button")) 
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

initializeGameVariablesFromServer(waitForGameStart, startGameLoop);


