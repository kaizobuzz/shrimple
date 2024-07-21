//@ts-check
import { http, MessageType, redirectOut } from "./events.js";
import {Game} from "./../state.js";
import {Players} from "./start_game.js";
import {renderGuess} from "./submitchange.js";
import {sleep} from "./../../shared/utils.js";
import { getPlayerIndex } from "./start_game.js";
/**@typedef {import('./start_game.js').Guess} Guess */
/**@typedef {import('./start_game.js').Player} Player */
/**@typedef {import('./start_game.js').Message} Message */



/** @typedef PlayerWithoutNodes 
 * @property {Guess[]} Guesses 
 * @property {string} Name 
 * @property {boolean} IsReady
 * @property {number} Lives
 */
async function getGameState(){
    const state_response=await fetch("/api/v1/getfullstate");
    if (!state_response.ok){
        if (state_response.status==http.StatusGone){
            redirectOut(); 
        }
        return
    }
    const state=/**@type {Message}*/(await state_response.json());
    if (state.Type!=MessageType.FullGameState){
        return 
    }
    return /**@type PlayerWithoutNodes[]*/(JSON.parse(state.Jsondata));
}
/**@param {number} lives  
*  @param {string} player_name */
function updateLives(lives, player_name){
    let player_index=getPlayerIndex(player_name);
    if (player_index==-1){
        console.log("player with name "+player_index+" not in game");
        return;
    }
    let target_player=Players[player_index];
    for (;lives>target_player.lives; lives--){
        loseLife(target_player);
    }
}
/**@param {Player} player*/ 
export function loseLife(player){
    player.lives--;
    player.lives_node.innerText="Remaining lives: "+player.lives;

}

export async function joinAsSpectator(){
    while (Game.active==true){
        await sleep(1);
        let state=await getGameState();
        if (state==undefined){
            continue;
        }
        for (const player of state){
            for (const guess of player.Guesses){
                renderGuess(guess, player.Name);
            } 
            updateLives(player.Lives, player.Name)

        }
    }
}
