// @ts-check
export const FLEX_COL_CLASS="column"
export const FLEX_ROW_CLASS="row"
export const IMGCLASS="comparison"
import {getComparisonImagesByArray, ComparisonTypes, checkAgainstShrimp} from "./comparison.js";
import {SubmitButton, GuessResultsDiv, PlayerInput} from "./../elements/shrimple.js";
import { Game } from "../shrimple/game.js";
import { getShrimpStat } from "./autofill.js";
import { MAX_GUESSES, assertNotNull } from "./utils.js";
import { setLocalStorage } from "../shrimple/localstorage.js";
/**
 * @typedef {import('./comparison.js').Comparisons} Comparisons
 * @typedef {import('./shrimp_type.js').Shrimp} Shrimp
 */
/**@param {Number[]} comparison_array 
 * @param {string} column_class 
 * @returns {HTMLDivElement}
 */
export function getGuessResultHtmlWithClasses(comparison_array, column_class=FLEX_COL_CLASS){
    const image_links=getComparisonImagesByArray(comparison_array);
    let row_node=document.createElement("div");
    for (const image_link of image_links){
        let img=new Image();
        img.src=image_link
        img.classList.add(IMGCLASS);
        let column_node=document.createElement("div");
        column_node.classList.add(column_class)
        column_node.appendChild(img);
        row_node.appendChild(column_node)
    }
    return row_node
}
/** @param {Shrimp} input_shrimp
* @param {number[]} comparison_array 
* @param {Number} num_guesses 
* @returns {HTMLDivElement[]}
*/
export function getGuessResultHtmlWithArray(input_shrimp, comparison_array, num_guesses){
    let nodes=[];
    if (num_guesses==0){
        nodes.push(renderKeys(input_shrimp));
    }
    let row_div=getGuessResultHtmlWithClasses(comparison_array, 'column');
    nodes.push(row_div);
    row_div.classList.add(FLEX_ROW_CLASS);
    let tooltip_col=document.createElement("div");
    row_div.appendChild(tooltip_col);
    tooltip_col.classList.add("tooltip", FLEX_COL_CLASS);
    tooltip_col.innerText+=input_shrimp.name;
    let tooltip_text=document.createElement("span");
    tooltip_text.classList.add("tooltip_text");
    tooltip_col.append(tooltip_text);
    for (const key of Object.keys(input_shrimp)){
        let strong=document.createElement("strong");
        strong.innerText=key+": ";
        tooltip_text.appendChild(strong); 
        tooltip_text.appendChild(document.createTextNode(getShrimpStat(input_shrimp, key))); 
        tooltip_text.appendChild(document.createElement("br"));
    }
    return nodes;

}
/** @param {Shrimp} input_shrimp
* @param {Comparisons} comparisons 
* @param {Number} num_guesses 
* @returns {HTMLDivElement[]}
*/
export function getGuessResultHtml(input_shrimp, comparisons, num_guesses){
    Game.guesses.push({
        shrimp_name: input_shrimp.name, 
        comparisons: Object.values(comparisons)
    });
    return getGuessResultHtmlWithArray(input_shrimp, Object.values(comparisons), num_guesses);
}
/** @param {Shrimp} input_shrimp 
 * @returns {HTMLDivElement}
 */
export function renderKeys(input_shrimp){
    let row_node=document.createElement("div");
    row_node.classList.add(FLEX_ROW_CLASS);
    for (const key of Object.keys(input_shrimp)){
        let column_node=document.createElement("div");
        column_node.classList.add(FLEX_COL_CLASS);
        row_node.appendChild(column_node)
        column_node.innerText=key;
    }
    return row_node;
}
/** @param {string} input
 */
function submitInput(input){
    let input_shrimp=Game.shrimp_list[Game.shrimp_index_by_name[input]];
    /** @type Comparisons*/
    let comparisons=checkAgainstShrimp(input_shrimp, assertNotNull(SubmitOverride.comparison_shrimp)); 
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
function submitAnswer(){
    if(!Game.active){
        return;
    }
    const input=PlayerInput.value.toLowerCase();
    //console.log(input);
    if (!isInputShrimpValid(input)){
        return;
    } 
    SubmitOverride.submit_function(input);
}
/**@param {string} input*/
export function isInputShrimpValid(input){ 
    if (Game.shrimp_index_by_name[input.toLowerCase()]==undefined){
        return false;
    }
    return true;
}
/** @param {string} input*/
export function updateSubmitButton(input){
    SubmitButton.disabled=SubmitOverride.can_submit_function(input)==false;
}
/**@param {Comparisons} comparisons*/
export function checkAnswer(comparisons){
    if (comparisons.name==ComparisonTypes.Equal){
        Game.num_guesses+=1;
        GameOverFunctions.win_function();
        return;
    }
    addGuesses(1); 
}
/** @param {number} num_new_guesses */
export function addGuesses(num_new_guesses){
    Game.num_guesses+=num_new_guesses;
    if (Game.num_guesses>=MAX_GUESSES){
        GameOverFunctions.lose_function(); 
        return;
    }
}
/**@callback NeedsComparison 
 *@param {Comparisons} comparisons 
 *@returns {void}
 */
export let SubmitOverride={
    /**@type NeedsComparison */
    after_submit: function(_){},
    /**@type Shrimp|null*/
    comparison_shrimp: null,
    submit_function: submitInput,
    can_submit_function: isInputShrimpValid,
};
export let GameOverFunctions={
    win_function: function(){},
    lose_function: function(){},
}
export function disableSubmitFunctionOverride(){
    SubmitOverride.submit_function=submitInput;
    SubmitOverride.can_submit_function=isInputShrimpValid;
}
export function setup(){
    SubmitButton.addEventListener("click", submitAnswer);
    addEventListener("keydown", function(e){
    if (e.key=="Enter"){
        if (!SubmitButton.disabled){
            submitAnswer();
        }
    }
    });
}
