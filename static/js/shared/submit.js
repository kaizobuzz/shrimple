function submit_answer(){
    if(!game.active){
        return;
    }
    game.num_guesses+=1;
    let input=player_input.value.toLowerCase();
    console.log(input);
    if (!is_input_shrimp_valid(input)){
        return;
    }
    if (submit_override.active==true){
        submit_override.submit_function(input);
        return;
    }
    var comparisons=[];
    if (submit_override.comparison_shrimp!=null){
        comparisons=check_against_shrimp(input, submit_override.comparison_shrimp); 
    } else{
        comparisons=check_against_daily_shrimp(input);
    }
    var html_to_render="<p> Guess: "+player_input.value+" ";
    html_to_render+=get_comparison_html(comparisons); 
    html_to_render+="</p>";
    guesses.innerHTML+=(html_to_render);
}
function is_input_shrimp_valid(input){
    if (submit_override.active==true){
        return submit_override.can_submit_function(input);
    }
    if (game.shrimp_index_by_name[input.toLowerCase()]==undefined){
        return false;
    }
    return true;
}
function update_submit_button(input){
    if (is_input_shrimp_valid(input)){
        submit_button.disabled=false;
        return;
    }
    submit_button.disabled=true;
}
var submit_override={
    comparison_shrimp: null,
    active: false,
    submit_function: null,
    can_submit_function: null,
};
var num_guesses;
let submit_button=document.getElementById("input-submit");
let guesses=document.getElementById("guesses");
submit_button.addEventListener("click", submit_answer);
