//@ts-check
/**@param {string} input  */
function swapResultSubmit(input){
    let input_shrimp=Game.shrimp_list[Game.shrimp_index_by_name[input]];
    let comparisons=checkAgainstShrimp(input_shrimp, assertNotNull(Game.current_shrimp));
    for (const key of Object.keys(comparisons)){
        comparisons[key]=EffectMappings[comparisons[key]]
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

function changeMapping(){
    for (let i=0; i<10; i++){
        const index_1=getRandomIndex(EffectMappings);
        const index_2=getRandomIndex(EffectMappings);
        EffectMappings[index_1], EffectMappings[index_2]=EffectMappings[index_2], EffectMappings[index_1];
    }
    SubmitOverride.submit_function=swapResultSubmit;
    EffectMappingActive+=1;
}
function resetMapping(){
    EffectMappings=Object.values(EffectType);
    EffectMappingActive-=1;
    if (EffectMappingActive==0){
    disableSubmitFunctionOverride;
    }
}
let EffectMappings=Object.values(EffectType);
let EffectMappingActive=0;

