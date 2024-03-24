//@ts-check

/**@param {string} input */
function submitwithHiddenFields(input){
    let input_shrimp=Game.shrimp_list[Game.shrimp_index_by_name[input]];
    let comparisons=checkAgainstShrimp(input_shrimp, assertNotNull(Game.current_shrimp));
    console.log(comparisons);
    if (comparisons.name!=Equal){
        for (const key of Object.keys(comparisons)){
            if (Math.random()<0.4){
                comparisons[key]=HiddenComparison;
            }
        }    
    }
    let guess_html=getGuessResultHtml(input_shrimp, comparisons);
    for (const node of guess_html){
        GuessResultsDiv.appendChild(node);
    }
    checkAnswer(comparisons);
    SubmitOverride.after_submit(comparisons);
    PlayerInput.value="";
    SubmitButton.disabled=true;
}
function hideRandomFieldsOn(){
    HideFieldCount+=1
    SubmitOverride.submit_function=submitwithHiddenFields;
}
function hideRandomFieldsOff(){
    HideFieldCount-=1
    if (HideFieldCount<1){ 
        disableSubmitFunctionOverride();
    }
}
let HideFieldCount=0
