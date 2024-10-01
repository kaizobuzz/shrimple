//@ts-check

import { Game } from "../shrimple/game.js";
import { CurrentEffects, filterCurrentEffects } from "./effects.js";
export const FRAME_TIME=0.02;

export function checkForGuesses(){
    if (OffsetCheckingStats.Lives!=Game.lives){
        OffsetCheckingStats.Lives=Game.lives;
        for (const effect of CurrentEffects){
            effect.end_function();
        }
        CurrentEffects.length=0;
        return;
    }
    if (OffsetCheckingStats.Guesses!=Game.num_guesses){ 
        OffsetCheckingStats.Guesses=Game.num_guesses;
        for (const effect of CurrentEffects){
            effect.duration_guesses-=1;
            if (effect.duration_guesses==0){
                effect.end_function();
            }
        }
        filterCurrentEffects((effect) => effect.duration_guesses>0);
    }
}

export function getRandomIndex(array){
    return Math.floor(Math.random()*array.length);
}


export let OffsetCheckingStats = {
    Guesses: 0,
    Lives: 0,
};
