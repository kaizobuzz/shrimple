//@ts-check
import { Game } from "../shrimple/game.js";
import { ClipboardMessage } from "../shared/results.js";
import { get_guess_result_emojis } from "../shrimple/results.js";
import { sleep, MAX_GUESSES } from "../shared/utils.js";
export async function copyClamplicatedResults(){
    let result=Game.won ? Game.num_guesses : "X"; 
    let text_to_copy="Daily Shrimple: Clamplicated mode "+result+"/"+MAX_GUESSES+"\n"+get_guess_result_emojis();
    navigator.clipboard.writeText(text_to_copy);
    ClipboardMessage.style.opacity=String(1);
    await sleep(1);
    ClipboardMessage.style.opacity=String(0);
}
