//@ts-check
//
import { Game } from "../state.js";
import { NewEffects, CurrentEffects } from "../effects.js";
import { sleep } from "../../shared/utils.js";
import { decrementTimerRTA, TimerStats} from "../timer.js";
import { FRAME_TIME, checkForGuesses, OffsetCheckingStats } from "../utils.js";
import { getTimeOffset } from "./localstorage.js";
import { receiveEvents } from "./events.js";
import { StartButton } from "./start_game.js";
export async function startGameLoop(){
    StartButton.hidden=true;
    let iterator=0;
    OffsetCheckingStats.Lives=Game.lives;
    OffsetCheckingStats.Guesses=Game.num_guesses;
    let [offset, timer_width]=getTimeOffset();
    let current_time=performance.now()+offset;
    TimerStats.width=timer_width
    while (Game.active){
        await sleep(FRAME_TIME)
        iterator+=1;
        if (iterator>(1/FRAME_TIME)){
            iterator=0;
            receiveEvents();
        }
        current_time=decrementTimerRTA(current_time, offset);
        checkForGuesses()       
        for (const effect of NewEffects){
            effect.start_function();
            CurrentEffects.push(effect);
        }
        NewEffects.length=0;
    }
}


