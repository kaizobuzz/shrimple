//@ts-check

import { CurrentKeyObject } from "./start_game";
import { renderEffects, displayEffectName, EffectType } from  "./../effects.js";
import { Game } from "./../state.js";
import {renderGuess} from "./submitchange.js";
import {DisconnectPlayer} from "./player_leave.js";
import { addPlayer } from "./start_game.js";
import { addChat } from "./chat.js";

/**@typedef Message
 * @property {number} Type 
 * @property {string} Id
 * @property {string} Jsondata
*/
export const JsonContentHeaderValue="application/json; charset=UFT-8"
/**
 * @readonly 
 * @enum {string}
 */ 
export const ConflictReasons={
    DisplayNameTaken: "Display name taken",
    GameAlreadyStarted: "Game already started",
    GameNotStarted: "Game not started",
}
Object.freeze(ConflictReasons)
/**
 * @readonly 
 * @enum {number}
 */
export const GuessStatus={ 
    Normal: 0,
    CorrectGuess: 1,
    OutOfGuesses: 2,
};
Object.freeze(GuessStatus)
/**
 * @readonly 
 * @enum {number}
 */
export const MessageType={
    NewGuess: 0,
	NewEffect: 1,      
	PlayerList: 2,     
	PlayerDied: 3,     
	Join: 4,           
	Disconnect: 5,     
	Ready: 6,          
	Unready: 7,        
	GameStart: 8,      
	GetEvents: 9,      
	GetStartState: 10,       
	NoContent: 11,      
	RawText: 12,        
	NestedMessages: 13, 
    GetGameState: 14, 
    FullGameState: 15,
    VoteKick: 16,
    Kick: 17,
    SendChat: 18,

};
Object.freeze(MessageType);
export const http={
    StatusConflict: 409,
    StatusGone: 410,
    StatusNoContent: 204,
}
Object.freeze(http)
/**@typedef Guess 
 * @property {Number[]} Results
 * @property {Number} Status 
*/
/**@param {any} event 
 * @param {Number} message_type */
export async function sendEvent(message_type, event){ 
    const message=/**@type Message */({
        Type: message_type,
        Id: CurrentKeyObject.playerkey,
        Jsondata: JSON.stringify(event),
    })
    console.log(message);
    const response=await fetch("/api/v1/sendevents", {
        method: "POST",
        body: JSON.stringify(message), 
        headers: {
           "Content-type": "application/json; charset=UFT-8" 
        } 
    })
    if (!response.ok){
        if (response.status==http.StatusConflict){

        } else if (response.status==http.StatusGone){
            
        } else{

        }
    }
    if (response.status==http.StatusNoContent){
        return
    }
    let response_message=/**@type Message*/(JSON.parse(await response.text()))
    return response_message 
}
export async function receiveEvents(){
    const message=/**@type Message */({
        Type: MessageType.GetEvents,
        Id: CurrentKeyObject.playerkey,
        Jsondata: "",
    })
    const response=await fetch("/api/v1/getevents",{
        method: "POST",
        body: JSON.stringify(message),
        headers: {
            "Content-type": JsonContentHeaderValue 
        }
    })
    if (!response.ok){ 
        if (response.status==http.StatusGone){
            redirectOut();
        } else if (response.status==http.StatusConflict){
        } 
        return;
    }
    const response_string=await response.text();
    if (response_string!="[]"){
        console.log(response_string);
    }
    const messages=/**@type Message[]*/(JSON.parse(response_string));   
    if (messages==null){
        return;
    }
    for (const message of messages){
        switch (message.Type){
            case MessageType.NewGuess:
                renderGuess(JSON.parse(message.Jsondata), message.Id);
                break;
            case MessageType.NewEffect:
                renderEffects([JSON.parse(message.Jsondata)]);
                break;
            case MessageType.GameStart:
                Game.active=true;
                //TODO more ?
                break;
            case MessageType.Ready:
                break;
            case MessageType.Unready:
                break;
            case MessageType.PlayerDied:
                break;
            case MessageType.Disconnect:
                DisconnectPlayer(message.Jsondata, "disconnected");
                //TODO
                break;
            case MessageType.Kick:
                DisconnectPlayer(message.Jsondata, "kicked");
                break;
            case MessageType.Join:
                addPlayer({Name: message.Id, IsReady: false});
                break;
            case MessageType.SendChat:
                addChat(message.Id, message.Jsondata);
                break;
            default:
                console.error("Invalid effect number ", message.Type)
        }
    }
}
export function redirectOut(){
    console.log("you would be redirected here")
    //window.location.replace("/timeout.html")
}
const startthing="Current effect set to "
addEventListener("keydown", function(e){
    switch (e.key){
        case "0":
            CurrentEffect=EffectType.GuessStatHide;
            displayEffectName(startthing+"Guess Field Hide");
            break;
        case "1":
            CurrentEffect=EffectType.TimeLimitMinus;
            displayEffectName(startthing+"Reduced Time Limit");
            break;
        case "2":
            CurrentEffect=EffectType.NoAutofill;
            displayEffectName(startthing+"No Autofill");
            break;
        case "3":
            CurrentEffect=EffectType.ShrimpGarbage;
            displayEffectName(startthing+"Shrimp Garbage");
            break;
        case "4":
            CurrentEffect=EffectType.BombParty;
            displayEffectName(startthing+"Bomb Party");
            break;
        default:
            break;
    }
})

export let CurrentEffect=EffectType.GuessStatHide;

