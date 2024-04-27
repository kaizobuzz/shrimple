//@ts-check
/**@param {string} player_name  
 * @param {string} message */
function DisconnectPlayer(player_name, message){
    let player_index=getPlayerIndex(player_name);
    if (player_index==-1){
        console.error("cant disconnect player: "+player_name+" not in player list");
        return
    }
    let target_player=Players[player_index];
    Players.splice(player_index);
    target_player.node.classList.add("disconnected");
    target_player.node.innerHTML=""
    target_player.node.append(document.createTextNode(message));
    SchedulePlayerNodeRemoval(target_player);
}
/**@param {Player} target_player  */
async function SchedulePlayerNodeRemoval(target_player){
    await sleep(1);
    target_player.node.remove();
}
