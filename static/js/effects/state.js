//@ts-check

import { SubmitOverride } from '../shared/submit.js';
import { LivesDiv } from '../elements/effects.js';
import { getShrimps, getRandomShrimpServer } from './shrimps.js';
import  {Game as base_game} from "./../shrimple/game.js";

/**@typedef {import('./../shared/shrimp_type.js').Shrimp} Shrimp
 * @typedef {import('./../shrimple/game.js').Guess} Guess
/**
 * @type {{
 * awaiting_promises: Promise<any>[];
 * active: boolean; 
 * num_guesses: number;
 * guesses: Guess[];
 * shrimp_list: Shrimp[];
 * first_shrimp_name: string;
 * second_shrimp_name: string;
 * current_shrimp: ?Shrimp;
 * next_shrimp: ?Shrimp
 * shrimp_names_lowercase: string[];
 * shrimp_index_by_name: Object.<string, number> ;
 * lives: number
 * }}
 */
export let Game=addFunction(base_game);
/*    {
    awaiting_promises: [],
    current_shrimp: null,
    next_shrimp: null,
    first_shrimp_name: "",
    guesses: [[]],
    second_shrimp_name: "",
    shrimp_list: [],
    shrimp_names_lowercase: [],
    shrimp_index_by_name: {},
    lives: 3,
    num_guesses: 0,
    active: false,
}*/
function addFunction(game){
    game["next_shrimp"]=null;
    game["second_shrimp_name"]=""; 
    game["lives"]=3;
    return game;
}

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
    fillInGameValueWithPromise(getRandomShrimpServer(), "first_shrimp_name");
    fillInGameValueWithPromise(getRandomShrimpServer(), "second_shrimp_name");
    Promise.all(Game.awaiting_promises).then(() => {
        for (let index=0; index<Game.shrimp_list.length; index++) {
            const shrimp_lowercase = Game.shrimp_list[index].name.toLowerCase();
            Game.shrimp_index_by_name[shrimp_lowercase] = index;
            Game.shrimp_names_lowercase.push(shrimp_lowercase)
        }
        Game.current_shrimp=Game.shrimp_list[Game.shrimp_index_by_name[Game.first_shrimp_name.toLowerCase()]];
        Game.next_shrimp=Game.shrimp_list[Game.shrimp_index_by_name[Game.second_shrimp_name.toLowerCase()]];
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
