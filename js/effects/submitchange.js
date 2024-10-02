//@ts-check
import { ComparisonTypes } from "../shared/comparison.js";
import { Game } from "../shrimple/game.js";
import { getGuessResultHtmlWithClasses, FLEX_ROW_CLASS, FLEX_COL_CLASS, addGuesses, SubmitOverride, renderKeys } from "../shared/submit.js";
import { GuessResultsDiv } from "../elements/shrimple.js";
import { getNewRandomShrimp } from "./shrimps.js";
/**@returns Comparisons */
function setAllHiddenComparison(){
    return {
        name: ComparisonTypes.HiddenComparison, 
        habitat: ComparisonTypes.HiddenComparison,
        length: ComparisonTypes.HiddenComparison,
        coloration: ComparisonTypes.HiddenComparison,
        weight: ComparisonTypes.HiddenComparison,
        max_depth: ComparisonTypes.HiddenComparison,
    }
}
export function submitEmptyGuess(){
    const comparisons=setAllHiddenComparison();
    Game.guesses.push({shrimp_name: "", comparisons: Object.values(comparisons)});
    if (Game.num_guesses==0){
        GuessResultsDiv.appendChild(renderKeys(Game.shrimp_list[0])); 
    }
    let guess_row=getGuessResultHtmlWithClasses(Object.values(comparisons));
    guess_row.classList.add(FLEX_ROW_CLASS);
    let skip_text_col=document.createElement("div");
    guess_row.appendChild(skip_text_col);
    skip_text_col.classList.add(FLEX_COL_CLASS)
    skip_text_col.innerText="Skipped"
    GuessResultsDiv.appendChild(guess_row);
    addGuesses(1);
    SubmitOverride.after_submit(setAllHiddenComparison())
    //TODO will have to change later
}
export function resetGuesses(){
    Game.current_shrimp=getNewRandomShrimp();
    SubmitOverride.comparison_shrimp = Game.current_shrimp;
    Game.guesses=[];
    GuessResultsDiv.innerHTML="";
    Game.num_guesses=0;
}

export function setLocalStorage(){
}

