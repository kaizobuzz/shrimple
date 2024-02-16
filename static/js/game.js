// @ts-check

/**
 * @typedef {Object} Shrimp
 * @property {string} name
 * @property {string} habitat
 * @property {number} length
 * @property {string[]} coloration
 * @property {number} weight 
 * @property {number} max_depth
 */
/**
 * @type {{
 * awaiting_promises: Promise<any>[];
 * active: boolean; 
 * num_guesses: number;
 * guesses: string[];
 * shrimp_list: Shrimp[];
 * daily_shrimp_name: string;
 * daily_shrimp: ?Shrimp;
 * shrimp_names_lowercase: string[];
 * shrimp_index_by_name: Object.<string, number> ;
 * won: boolean;
 * }}
 */
let Game = {
    awaiting_promises: [],
    active: false,
    num_guesses: 0,
    guesses: [],
    shrimp_list: [], 
    daily_shrimp_name: "",
    daily_shrimp: null,
    shrimp_names_lowercase: [],
    shrimp_index_by_name: {},
    won: false,
}
/**
 * @template T
 * @param {Promise<T>} promise
 * @param {string} key 
*/
function fillInGameValueWithPromise(promise, key){
    Game.awaiting_promises.push(promise);
    promise.then((value) => {
        Game[key] = value;
    });
}


function initializeGameVariablesFromServer(){
    const cached_vals=checkLocalStorage();
    const cached_game=cached_vals[0];
    const cached_guess_results=cached_vals[1];
    if (cached_guess_results!=null){
        GuessResultsDiv.innerHTML=cached_guess_results;
    }
    if (cached_game!=null){
        Game=JSON.parse(cached_game);
        if (Game.num_guesses>0&&Game.active==false){
            renderEndPopup();
        }
        return;
    }
    fillInGameValueWithPromise(getShrimps(), "shrimp_list");
    fillInGameValueWithPromise(getDailyShrimp(), "daily_shrimp_name")

    Promise.all(Game.awaiting_promises).then(() => {
        for (let index=0; index<Game.shrimp_list.length; index++) {
            const shrimp_lowercase = Game.shrimp_list[index].name.toLowerCase();
            Game.shrimp_index_by_name[shrimp_lowercase] = index;
            Game.shrimp_names_lowercase.push(shrimp_lowercase)
        }
        Game.daily_shrimp = Game.shrimp_list[Game.shrimp_index_by_name[Game.daily_shrimp_name.toLowerCase()]];
        console.log("DAILY SHRIMP")
        console.log(Game.daily_shrimp)
        SubmitOverride.comparison_shrimp=Game.daily_shrimp;
        Game.active = true;
    });
}

initializeGameVariablesFromServer();

