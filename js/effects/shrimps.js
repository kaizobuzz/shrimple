//@ts-check

import { Game } from "../shrimple/game.js";
import { SubmitOverride } from "../shared/submit.js";
import { getRandomIndex } from "./utils.js";

/**@typedef {import('./../shared/shrimp_type.js').Shrimp} Shrimp*/


export async function getShrimps() {
    const response = await fetch("/shrimple/data/shrimps.json");
    const shrimps = (await response.json()).shrimps;
    console.log(shrimps);
    return shrimps;
}

/**@returns {Shrimp}*/
export function getNewRandomShrimp(){
    return Game.shrimp_list[getRandomIndex(Game.shrimp_list)]; 
}
