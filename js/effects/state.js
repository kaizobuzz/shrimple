//@ts-check

import { SubmitOverride } from '../shared/submit.js';
import { LivesDiv } from '../elements/effects.js';
import { getShrimps } from './shrimps.js';
import  {Game} from "./../shrimple/game.js";
import { getRandomIndex } from './utils.js';

/**@typedef {import('./../shared/shrimp_type.js').Shrimp} Shrimp
 * @typedef {import('./../shrimple/game.js').Guess} Guess


/**
 * @param {Promise<any>} promise 
 * @param {string} key 
*/
function fillInGameValueWithPromise(promise, key){
    Game.awaiting_promises.push(promise);
    promise.then((value) => {
        Game[key] = value;
    });
}

/**@callback AnonymousPromise
 *@returns {Promise<void>}
 */

/** 
 *@param {AnonymousPromise} startGameLoop  
 *@param {AnonymousPromise} waitForGameStart 
 * */
export function initializeGameVariablesFromServer(waitForGameStart, startGameLoop){
    fillInGameValueWithPromise(getShrimps(), "shrimp_list");
    Promise.all(Game.awaiting_promises).then(() => {
        Game.current_shrimp = Game.shrimp_list[getRandomIndex(Game.shrimp_list)];
        for (let index=0; index<Game.shrimp_list.length; index++) {
            const shrimp_lowercase = Game.shrimp_list[index].name.toLowerCase();
            Game.shrimp_index_by_name[shrimp_lowercase] = index;
            Game.shrimp_names_lowercase.push(shrimp_lowercase)
        }
        SubmitOverride.comparison_shrimp=Game.current_shrimp;
        console.log(Game.current_shrimp);
        //TODO listen for actual Game 
        const promise=waitForGameStart();
        promise.then(()=>{
            LivesDiv.innerText="Remaining lives: "+Game.lives;
            Game.active=true;
            startGameLoop();
        });
    });
}
