//@ts-check

import { Game } from '../shrimple/game.js';
import { SubmitOverride, getGuessResultHtml, checkAnswer } from '../shared/submit.js';
import { Functions } from '../shared/results.js';
import { checkAgainstShrimp, ComparisonTypes } from '../shared/comparison.js';
import { assertNotNull } from '../shared/utils.js';
import { GuessResultsDiv, PlayerInput, SubmitButton  } from '../elements/shrimple.js';
import { setLocalStorage } from '../shrimple/localstorage.js';
import { copyClamplicatedResults } from './results.js';
import { checkIfUseClamplicatedInfo } from './info.js';


/**@typedef {import('./../shared/comparison.js').Comparisons}  Comparisons*/
/**@param {string} input  */
function clampicatedSubmit(input){
    let input_shrimp=Game.shrimp_list[Game.shrimp_index_by_name[input]];
    /** @type Comparisons*/
    let comparisons=checkAgainstShrimp(input_shrimp, assertNotNull(SubmitOverride.comparison_shrimp));
    if (comparisons.name!=ComparisonTypes.Equal){
        let unique_enough_seed=Math.floor(Date.now()/(1000*60*60*24));
        let kinda_random_number=refreshRandom(unique_enough_seed);
        for (let i=0; i<Game.num_guesses; i++){
            kinda_random_number=refreshRandom(kinda_random_number);
        }
        if (kinda_random_number<3){
            comparisons.length=ComparisonTypes.HiddenComparison;
        } else if (kinda_random_number<6){
            comparisons.weight=ComparisonTypes.HiddenComparison;
        } else {
            comparisons.max_depth=ComparisonTypes.HiddenComparison;
        }
        if (kinda_random_number<4){
            comparisons.habitat=ComparisonTypes.HiddenComparison;
        } else if (kinda_random_number<7){
            comparisons.coloration=ComparisonTypes.HiddenComparison;
        }
    }
    const guess_html=getGuessResultHtml(input_shrimp, comparisons, Game.num_guesses);
    for (const node of guess_html){
        GuessResultsDiv.appendChild(node);
    }
    checkAnswer(comparisons);
    setLocalStorage();
    SubmitOverride.after_submit(comparisons);
    PlayerInput.value="";
    SubmitButton.disabled=true;
    
}
export function changeSubmitFunction(){
    SubmitOverride.submit_function=clampicatedSubmit
    Functions.Clipboard=copyClamplicatedResults;
    checkIfUseClamplicatedInfo();
}
/**@param {number} seed  */
function refreshRandom(seed){
    return (seed*171717)%10;
}
