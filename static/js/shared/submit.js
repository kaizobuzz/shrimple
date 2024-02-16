// @ts-check
const MAX_GUESSES=6;
const FLEX_COL="<div class='column'>"
const FLEX_ROW="<div class='row'>"
const BIGFONT="<p class='large'>"
/** @param {Shrimp} input_shrimp
* @param {Comparisons} comparisons 
* @returns {string}
*/
function getGuessResultHtml(input_shrimp, comparisons){
    let html_to_render="";
    if (Game.num_guesses==0){
        html_to_render+=renderKeys(input_shrimp)
    }
    html_to_render+=FLEX_ROW+FLEX_COL
    html_to_render+=(getComparisonHtml(comparisons)).join("</div>"+FLEX_COL);
    html_to_render+="</div>"
    Game.guesses.push(getComparisonHtml(comparisons).join("")); 
    html_to_render+=FLEX_COL+"<div class='tooltip'>"+"<p>"+input_shrimp.name+"</p>";
    html_to_render+="<span class='tooltip_text'>";
    for (const key of Object.keys(input_shrimp)){
        html_to_render+="<strong>"+key+": </strong>"+getShrimpStat(input_shrimp, key)+"<br>"; 
    }
    html_to_render+="</span> </div> </div> </div>";
    return html_to_render;
}
/** @param {Shrimp} input_shrimp 
 * @returns {string}
 */
function renderKeys(input_shrimp){
    let html_to_render=FLEX_ROW;
    for (const key of Object.keys(input_shrimp)){
        html_to_render+=FLEX_COL;
        html_to_render+=key;
        html_to_render+="</div>"
    }
    html_to_render+="</div>"
    return html_to_render;
}
/** @param {string} input
 */
function submitInput(input){
    let input_shrimp=Game.shrimp_list[Game.shrimp_index_by_name[input]];
    /** @type Comparisons*/
    let comparisons;
    if (SubmitOverride.comparison_shrimp!=null){
        comparisons=checkAgainstShrimp(
        input_shrimp, 
        SubmitOverride.comparison_shrimp); 
    } else{
        comparisons=checkAgainstDailyShrimp(input_shrimp);
    }
    let html_to_render=getGuessResultHtml(input_shrimp, comparisons);
    GuessResultsDiv.innerHTML+=(html_to_render);
    checkAnswer(comparisons);
    setLocalStorage();
    if (SubmitOverride.after_submit!=null){
        console.log("?");
        SubmitOverride.after_submit();
    }
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
    if (SubmitOverride.active==true){
        SubmitOverride.submit_function(input);
        return;
    }
    submitInput(input);
}
/**@param {string} input*/
function isInputShrimpValid(input){ 
    if (Game.shrimp_index_by_name[input.toLowerCase()]==undefined){
        return false;
    }
    return true;
}
/** @param {string} input*/
function updateSubmitButton(input){
    let should_enable;
    if (SubmitOverride.active==true){
        should_enable=SubmitOverride.can_submit_function(input);
    } else{
        should_enable=isInputShrimpValid(input);
    }
    if (should_enable){
        SubmitButton.disabled=false;
        return;
    } else{
        SubmitButton.disabled=true;
    }
}
/**@param {Comparisons} comparisons*/
function checkAnswer(comparisons){
    if (comparisons.name==Equal){
        Game.num_guesses+=1;
        if (GameOverRide.active){
            GameOverRide.win_function();
            return;
        }
        Game.won=true;
        renderEndPopup();
        Game.active=false;
        return;
    }
    addGuesses(1); 
}
/** @param {number} num_new_guesses */
function addGuesses(num_new_guesses){
    Game.num_guesses+=num_new_guesses;
    if (Game.num_guesses>=MAX_GUESSES){
        if (GameOverRide.active){
            GameOverRide.lose_function();
            return;
        }
        Game.won=false;
        renderEndPopup();
        Game.active=false;
        return;
    }
}

let SubmitOverride={
    after_submit: function(){},
    /**@type Shrimp|null*/
    comparison_shrimp: null,
    active: false,
    submit_function: submitInput,
    can_submit_function: isInputShrimpValid,
};
let GameOverRide={
    active: false,
    win_function: function(){},
    lose_function: function(){},
}
function disableSubmitFunctionOverride(){
    SubmitOverride.active=false;
    SubmitOverride.submit_function=submitInput;
    SubmitOverride.can_submit_function=isInputShrimpValid;
}
let SubmitButton = assertButtonElement(document.getElementById("input-submit"));
let GuessResultsDiv=assertNotNull(document.getElementById("guesses"));
SubmitButton.addEventListener("click", submitAnswer);
addEventListener("keydown", function(e){
    if (e.key=="Enter"){
        if (!SubmitButton.disabled){
            submitAnswer();
        }
    }
});
