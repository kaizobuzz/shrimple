const MAX_GUESSES=6;

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
    let html_to_render="<p> Guess: "+input_shrimp.name+" ";
    html_to_render+=getComparisonHtml(comparisons);
    Game.guesses.push(getComparisonHtml(comparisons));
    html_to_render+="</p>";
    GuessResultsDiv.innerHTML+=(html_to_render);
    checkAnswer(comparisons);
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
