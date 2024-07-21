//@ts-check
import { assertInputElement, assertNotNull } from "../../shared/utils.js";
import { sendEvent, MessageType } from "./events.js";
import { DisplayName} from "./start_game.js";
/**@param {KeyboardEvent} e  */
export function sendChat(e){
    if (e.key=='Enter'){
        let input=ChatInput.value;
        sendEvent(MessageType.SendChat, input);
        addChat(DisplayName, " "+input+" ");
        ChatInput.value="";
    }
}
/**@param {string} player_name  
 * @param {string} message_content */
export function addChat(player_name, message_content){
    let message=message_content.slice(1, message_content.length-1)
    ChatDiv.appendChild(document.createTextNode(player_name+": "+message));
    ChatDiv.appendChild(document.createElement("br"));
}
let ChatDiv=assertNotNull(document.getElementById("chat-messages"));
let ChatInput=assertInputElement(document.getElementById("chat-form"));
export function chat_setup(){
    ChatInput.addEventListener("keydown", sendChat);
}

