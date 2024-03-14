//@ts-check
function sendChat(e){
    if (e.key=='Enter'){
        let input=ChatInput.value;
        sendEvent(MessageType.SendChat, input);
        addChat(DisplayName, input)
        ChatInput.value="";
    }
}
/**@param {string} player_name  
 * @param {string} message_content */
function addChat(player_name, message_content){
    ChatDiv.innerText+=player_name+": "+message_content;
    ChatDiv.innerHTML+="<br>"
}
let ChatDiv=assertNotNull(document.getElementById("chat-messages"));
let ChatInput=assertInputElement(document.getElementById("chat-form"));
ChatInput.addEventListener("keydown", sendChat);

