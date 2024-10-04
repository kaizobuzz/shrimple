//@ts-check

import { Game } from '../shrimple/game.js';
import { SubmitOverride, getGuessResultHtml, checkAnswer } from '../shared/submit.js';
import { Functions } from '../shared/results.js';
import { checkAgainstShrimp, ComparisonTypes } from '../shared/comparison.js';
import { assertNotNull } from '../shared/utils.js';
import { GuessResultsDiv, PlayerInput, SubmitButton  } from '../elements/shrimple.js';
import { getCurrentDate, setLocalStorage } from '../shrimple/localstorage.js';
import { copyClamplicatedResults } from './results.js';
import { checkIfUseClamplicatedInfo } from './info.js';
import { hashCurrentDate } from '../shrimple/selectors.js';


/**@typedef {import('./../shared/comparison.js').Comparisons}  Comparisons*/
/**@param {string} input  */
function clampicatedSubmit(input){
    let input_shrimp=Game.shrimp_list[Game.shrimp_index_by_name[input]];
    /** @type Comparisons*/
    let comparisons=checkAgainstShrimp(input_shrimp, assertNotNull(SubmitOverride.comparison_shrimp));
    if (comparisons.name!=ComparisonTypes.Equal){
        const kinda_random_number=hashCurrentDate(JSON.stringify(Game.guesses));
        if (kinda_random_number%17<9){
            comparisons.length=ComparisonTypes.HiddenComparison;
        } 
        if (kinda_random_number%17>6){
            comparisons.max_depth=ComparisonTypes.HiddenComparison;
        }
        if (kinda_random_number%21<14){
            comparisons.weight=ComparisonTypes.HiddenComparison;
        } 
        if (kinda_random_number%39<19){
            comparisons.habitat=ComparisonTypes.HiddenComparison;
        } else if (kinda_random_number%41<9){
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

