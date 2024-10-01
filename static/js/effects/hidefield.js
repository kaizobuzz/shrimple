//@ts-check

import { disableSubmitFunctionOverride, getGuessResultHtml, SubmitOverride, checkAnswer } from "../shared/submit.js";
import { checkAgainstShrimp, ComparisonTypes } from "../shared/comparison.js";
import { assertNotNull } from "../shared/utils.js";
import { Game } from "../shrimple/game.js";
import { GuessResultsDiv, PlayerInput, SubmitButton } from "../elements/shrimple.js";
/**@param {string} input */
export function submitwithHiddenFields(input){
    let input_shrimp=Game.shrimp_list[Game.shrimp_index_by_name[input]];
    let comparisons=checkAgainstShrimp(input_shrimp, assertNotNull(Game.current_shrimp));
    console.log(comparisons);
    if (comparisons.name!=ComparisonTypes.Equal){
        for (const key of Object.keys(comparisons)){
            if (Math.random()<0.4){
                comparisons[key]=ComparisonTypes.HiddenComparison;
            }
        }    
    }
    let guess_html=getGuessResultHtml(input_shrimp, comparisons, Game.num_guesses);
    for (const node of guess_html){
        GuessResultsDiv.appendChild(node);
    }
    checkAnswer(comparisons);
    SubmitOverride.after_submit(comparisons);
    PlayerInput.value="";
    SubmitButton.disabled=true;
}
export function hideRandomFieldsOn(){
    HideFieldCount+=1
    SubmitOverride.submit_function=submitwithHiddenFields;
}
export function hideRandomFieldsOff(){
    HideFieldCount-=1
    if (HideFieldCount<1){ 
        disableSubmitFunctionOverride();
    }
}
let HideFieldCount=0
