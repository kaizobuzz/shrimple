//@ts-check
const GARBAGE_GUESSES_ADDED=2; 

import { Game } from "./state.js";
import { getRandomIndex } from "./utils.js";
import { checkAgainstShrimp, ComparisonTypes } from "../shared/comparison.js";
import { assertNotNull } from "../shared/utils.js";
import { GuessResultsDiv } from "../elements/shrimple.js";
import { addGuesses, getGuessResultHtml } from "../shared/submit.js";

export function getShrimpGarbage(){
    let comparison_html=/**@type {HTMLDivElement[]} */([]);
    for (let i=0; i<GARBAGE_GUESSES_ADDED; i++){
        const new_shrimp=Game.shrimp_list[getRandomIndex(Game.shrimp_list)];
        const comparisons=checkAgainstShrimp(new_shrimp, assertNotNull(Game.current_shrimp));
        const comparison_keys=Object.keys(comparisons)
        for (let i=0; i<comparison_keys.length-2; i++){
            comparisons[comparison_keys[getRandomIndex(comparison_keys)]]=ComparisonTypes.HiddenComparison;
        }
        comparison_html=comparison_html.concat(getGuessResultHtml(new_shrimp, comparisons, Game.num_guesses));
    }
    for (const node of comparison_html){
        GuessResultsDiv.appendChild(node);
    }
    addGuesses(GARBAGE_GUESSES_ADDED);
}
