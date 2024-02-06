const MAX_GUESSES=6;

function submitAnswer(){
    if(!game.active){
        return;
    }
    let input=player_input.value.toLowerCase();
    console.log(input);
    if (!isInputShrimpValid(input)){
        return;
    }
    if (submit_override.active==true){
        submit_override.submit_function(input);
        return;
    }
    var comparisons=[];
    if (submit_override.comparison_shrimp!=null){
        comparisons=checkAgainstShrimp(
        game.shrimp_list[game.shrimp_index_by_name[input]], 
        submit_override.comparison_shrimp); 
    } else{
        comparisons=checkAgainstDailyShrimp(input);
    }
    var html_to_render="<p> Guess: "+player_input.value+" ";
    html_to_render+=getComparisonHtml(comparisons); 
    html_to_render+="</p>";
    guesses.innerHTML+=(html_to_render);
    checkAnswer(comparisons);
}
function isInputShrimpValid(input){
    if (submit_override.active==true){
        return submit_override.can_submit_function(input);
    }
    if (game.shrimp_index_by_name[input.toLowerCase()]==undefined){
        return false;
    }
    return true;
}
function updateSubmitButton(input){
    if (isInputShrimpValid(input)){
        submit_button.disabled=false;
        return;
    }
    submit_button.disabled=true;
}
function checkAnswer(comparisons){
    if (comparisons.name==Equal){
        game.num_guesses+=1;
        //TODO now do the win thing
        return;
    }
    addGuesses(1); 
}
function addGuesses(num_new_guesses){
    game.num_guesses+=num_new_guesses;
    if (game.num_guesses>=MAX_GUESSES){
       //TODO do the opposite of win thing 
    }
}
var submit_override={
    comparison_shrimp: null,
    active: false,
    submit_function: null,
    can_submit_function: null,
};

function disableSubmitFunctionOverride(){
    submit_override.active=false;
    submit_override.submit_function=null;
    submit_override.can_submit_function=null;
}

var num_guesses;
let submit_button=document.getElementById("input-submit");
let guesses=document.getElementById("guesses");
submit_button.addEventListener("click", submitAnswer);
