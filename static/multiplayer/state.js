//@ts-check

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
 * first_shrimp_name: string;
 * second_shrimp_name: string;
 * current_shrimp: ?Shrimp;
 * next_shrimp: ?Shrimp
 * shrimp_names_lowercase: string[];
 * shrimp_index_by_name: Object.<string, number> ;
 * lives: number
 * }}
 */

let Game={
    awaiting_promises: [],
    current_shrimp: null,
    next_shrimp: null,
    first_shrimp_name: "",
    guesses: [],
    second_shrimp_name: "",
    shrimp_list: [],
    shrimp_names_lowercase: [],
    shrimp_index_by_name: {},
    lives: 3,
    num_guesses: 0,
    active: false,
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

function initializeGameVariablesFromServer(){
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
            LivesDiv.innerHTML="<p>Remaining lives: "+Game.lives+"</p>";
            Game.active=true;
            startGameLoop();
        });
    });
}
initializeGameVariablesFromServer();
