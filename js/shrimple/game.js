// @ts-check
import { getCurrentDate, checkLocalStorage } from "./localstorage.js";
import { getShrimps, getDailyShrimp } from "./selectors.js";
import { SubmitOverride, getGuessResultHtmlWithArray } from "../shared/submit.js";
import { renderEndPopup } from "./results.js";
import { GuessResultsDiv } from "../elements/shrimple.js";
import { getMode, assertNotNull } from "../shared/utils.js";
import { StartInfo } from "../shared/info.js";
/**
 * @typedef Guess
 * @property {number[]} comparisons
 * @property {string} shrimp_name
 * @typedef {import ('./../shared/shrimp_type.js').Shrimp} Shrimp
 * @type {{
 * awaiting_promises: Promise<any>[];
 * active: boolean; 
 * num_guesses: number;
 * guesses: Guess[];
 * shrimp_list: Shrimp[];
 * current_shrimp: ?Shrimp;
 * shrimp_names_lowercase: string[];
 * shrimp_index_by_name: Object.<string, number> ;
 * lives: number;
 * won: boolean; 
 * }}
 */
export let Game = {
    awaiting_promises: [],
    active: false,
    num_guesses: 0,
    guesses: [],
    shrimp_list: [],
    current_shrimp: null,
    shrimp_names_lowercase: [],
    shrimp_index_by_name: {},
    lives: 3,
    won: false,
}
/**
 * @template T
 * @param {Promise<T>} promise
 * @param {string} key 
*/
function fillInGameValueWithPromise(promise, key) {
    Game.awaiting_promises.push(promise);
    promise.then((value) => {
        Game[key] = value;
    });
}


export function initializeGameVariablesFromServer() {
    const cached_game = checkLocalStorage();
    if (cached_game != null) {
        Game = JSON.parse(cached_game);
        StartInfo.hidden = true;
        StartInfo.style.opacity = "0%";
        for (let i = 0; i < Game.num_guesses; i++) {
            const input_shrimp = Game.shrimp_list[Game.shrimp_index_by_name[Game.guesses[i].shrimp_name.toLowerCase()]];
            for (const node of getGuessResultHtmlWithArray(input_shrimp, Game.guesses[i].comparisons, i)) {
                GuessResultsDiv.append(node);
            };
        }
        SubmitOverride.comparison_shrimp = Game.current_shrimp;
        if (Game.num_guesses > 0 && Game.active == false) {
            renderEndPopup(false);
        }
        return;
    }
    fillInGameValueWithPromise(getShrimps(), "shrimp_list");
    Promise.all(Game.awaiting_promises).then(() => {
        Game.current_shrimp = getDailyShrimp(assertNotNull(getMode()));
        for (let index = 0; index < Game.shrimp_list.length; index++) {
            const shrimp_lowercase = Game.shrimp_list[index].name.toLowerCase();
            Game.shrimp_index_by_name[shrimp_lowercase] = index;
            Game.shrimp_names_lowercase.push(shrimp_lowercase)
        }
        SubmitOverride.comparison_shrimp = Game.current_shrimp;
        Game.active = true;
    });
}

