//@ts-check
const GARBAGE_GUESSES_ADDED=2; 

function getShrimpGarbage(){
    let comparison_html="";
    for (let i=0; i<GARBAGE_GUESSES_ADDED; i++){
        const new_shrimp=Game.shrimp_list[getRandomIndex(Game.shrimp_list)];
        const comparisons=checkAgainstShrimp(new_shrimp, assertNotNull(Game.current_shrimp));
        const comparison_keys=Object.keys(comparisons)
        for (let i=0; i<comparison_keys.length-2; i++){
            comparisons[comparison_keys[getRandomIndex(comparison_keys)]]=HiddenComparison;
        }
        comparison_html+=getGuessResultHtml(new_shrimp, comparisons);
    }
    GuessResultsDiv.innerHTML+=comparison_html;
    addGuesses(GARBAGE_GUESSES_ADDED);
}
