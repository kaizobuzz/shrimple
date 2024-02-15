const MAX_GUESSES=6;
const FLEX_COL="<div class='column'>"
const FLEX_ROW="<div class='row'>"
const BIGFONT="<p class='large'>"
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
    for (key of Object.keys(input_shrimp)){
        html_to_render+="<strong>"+key+": </strong>"+getShrimpStat(input_shrimp, key)+"<br>"; 
    }
    html_to_render+="</span> </div> </div> </div>";
    return html_to_render;
}
function renderKeys(input_shrimp){
    html_to_render=FLEX_ROW;
    for (key of Object.keys(input_shrimp)){
        html_to_render+=FLEX_COL;
        html_to_render+=key;
        html_to_render+="</div>"
    }
    html_to_render+="</div>"
    return html_to_render;
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
    let input_shrimp=Game.shrimp_list[Game.shrimp_index_by_name[input]];
    if (SubmitOverride.active==true){
        SubmitOverride.submit_function(input);
        return;
    }
    let comparisons=[];
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
function isInputShrimpValid(input){ 
    if (Game.shrimp_index_by_name[input.toLowerCase()]==undefined){
        return false;
    }
    return true;
}
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
function checkAnswer(comparisons){
    if (comparisons.name==Equal){
        Game.num_guesses+=1;
        if (GameOverRide.active){
            GameOverRide.win_function();
            return;
        }
        //alert("Daily Shrimple "+Game.num_guesses+"/"+MAX_GUESSES+"\n"+Game.guesses.join("\n"));
        renderEndPopup();
        Game.active=false;
        return;
    }
    addGuesses(1); 
}
function addGuesses(num_new_guesses){
    Game.num_guesses+=num_new_guesses;
    if (Game.num_guesses>=MAX_GUESSES){
        if (GameOverRide.active){
            GameOverRide.lose_function();
            return;
        }
        //TODO popup
    }
}
let SubmitOverride={
    after_submit: null,
    comparison_shrimp: null,
    active: false,
    submit_function: null,
    can_submit_function: null,
};
let GameOverRide={
    active: false,
    win_function: null,
    lose_function: null,
}
function disableSubmitFunctionOverride(){
    SubmitOverride.active=false;
    SubmitOverride.submit_function=null;
    SubmitOverride.can_submit_function=null;
}

let SubmitButton=document.getElementById("input-submit");
let GuessResultsDiv=document.getElementById("guesses");
SubmitButton.addEventListener("click", submitAnswer);
addEventListener("keydown", function(e){
    if (e.key=="Enter"){
        if (!SubmitButton.disabled){
            submitAnswer();
        }
    }
});
