//@ts-check
import { OffsetCheckingStats, checkForGuesses } from "../utils.js";
import { Game, initializeGameVariablesFromServer } from "./../state.js";
import { sleep } from "./../../shared/utils.js";
import { FRAME_TIME } from "./../utils.js";
import { decrementTimer } from "./../timer.js";
import { CurrentEffects, NewEffects} from "../effects.js";
import { StartInfo } from "../../shared/info.js"
import {setup as results_setup } from "./results.js";
import {setup as submit_change_setup} from "./submitchange.js";
import {setup} from "./../../shared/setup.js";
import { info_setup } from "../../shared/info.js";


async function waitForGameStart(){
    return
}
async function startGameLoop(){
    OffsetCheckingStats.Lives=Game.lives;
    OffsetCheckingStats.Guesses=Game.num_guesses;
    while (Game.active){
        await sleep(FRAME_TIME) 
        if (StartInfo.hidden){
            decrementTimer()
        }
        checkForGuesses()       
        for (const effect of NewEffects){
            effect.start_function();
            CurrentEffects.push(effect);
        }
        NewEffects.length=0;
    }
}
setup(true);
info_setup();
results_setup();
submit_change_setup();

initializeGameVariablesFromServer(waitForGameStart, startGameLoop);

