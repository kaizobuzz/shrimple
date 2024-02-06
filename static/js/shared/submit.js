const MAX_GUESSES=6;

function submitAnswer(){
    if(!Game.active){
        return;
    }
    const input=PlayerInput.value.toLowerCase();
    console.log(input);
    if (!isInputShrimpValid(input)){
        return;
    }
    if (SubmitOverride.active==true){
        SubmitOverride.submit_function(input);
        return;
    }
    let comparisons=[];
    if (SubmitOverride.comparison_shrimp!=null){
        comparisons=checkAgainstShrimp(
        Game.shrimp_list[Game.shrimp_index_by_name[input]], 
        SubmitOverride.comparison_shrimp); 
    } else{
        comparisons=checkAgainstDailyShrimp(input);
    }
    let html_to_render="<p> Guess: "+PlayerInput.value+" ";
    html_to_render+=getComparisonHtml(comparisons); 
    html_to_render+="</p>";
    GuessResultsDiv.innerHTML+=(html_to_render);
    checkAnswer(comparisons);
}
function isInputShrimpValid(input){
    if (SubmitOverride.active==true){
        return SubmitOverride.can_submit_function(input);
    }
    if (Game.shrimp_index_by_name[input.toLowerCase()]==undefined){
        return false;
    }
    return true;
}
function updateSubmitButton(input){
    if (isInputShrimpValid(input)){
        SubmitButton.disabled=false;
        return;
    }
    SubmitButton.disabled=true;
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

let NumGuesses;
let SubmitButton=document.getElementById("input-submit");
let GuessResultsDiv=document.getElementById("guesses");
SubmitButton.addEventListener("click", submitAnswer);
