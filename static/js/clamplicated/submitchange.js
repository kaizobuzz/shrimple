//@ts-check

/**@param {string} input  */
function clampicatedSubmit(input){
    let input_shrimp=Game.shrimp_list[Game.shrimp_index_by_name[input]];
    /** @type Comparisons*/
    let comparisons=checkAgainstShrimp(input_shrimp, assertNotNull(SubmitOverride.comparison_shrimp));
    if (comparisons.name!=Equal){
        let unique_enough_seed=Math.floor(Date.now()/(1000*60*60*24));
        let kinda_random_number=refreshRandom(unique_enough_seed);
        for (let i=0; i<Game.num_guesses; i++){
            kinda_random_number=refreshRandom(kinda_random_number);
        }
        if (kinda_random_number<3){
            comparisons.length=HiddenComparison;
        } else if (kinda_random_number<6){
            comparisons.weight=HiddenComparison;
        } else {
            comparisons.max_depth=HiddenComparison;
        }
        if (kinda_random_number<4){
            comparisons.habitat=HiddenComparison;
        } else if (kinda_random_number<7){
            comparisons.coloration=HiddenComparison;
        }
    }
    const html_to_render_dirty=getGuessResultHtml(input_shrimp, comparisons);
    GuessResultsDiv.innerHTML+=DOMPurify.sanitize(html_to_render_dirty);
    checkAnswer(comparisons);
    setLocalStorage();
    SubmitOverride.after_submit(comparisons);
    PlayerInput.value="";
    SubmitButton.disabled=true;
    
}
function changeSubmitFunction(){
    SubmitOverride.submit_function=clampicatedSubmit
    ClipboardFunction=copyClamplicatedResults;
}
/**@param {number} seed  */
function refreshRandom(seed){
    return (seed*171717)%10;
}
