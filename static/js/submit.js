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
    let comparisons=check_against_daily_shrimp(input);
    var html_to_render="<p> Guess: "+player_input.value+" ";
    let keys=Object.keys(comparisons);
    for (const key of keys){
        html_to_render+=key+": ";
        if(comparisons[key] == TooLarge) {
            html_to_render += "⬇️"
        } else if(comparisons[key] == TooSmall) {
            html_to_render += "⬆️"
        } else if(comparisons[key] == Equal) {
            html_to_render += "🟩"
        } else if(comparisons[key] == PartialEqual) {
            html_to_render += "🟨"
        } else if(comparisons[key] == UnknownComparison) {
            html_to_render += "🟪"
        } else if(comparisons[key] == NotEqual) {
            html_to_render += "🟥"
        } else {
            html_to_render += "uh there was an error"
        }
        html_to_render += " "
    }
    html_to_render+="</p>";
    guesses.innerHTML+=(html_to_render);
}
function is_input_shrimp_valid(input){
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
var num_guesses;
let submit_button=document.getElementById("input-submit");
let guesses=document.getElementById("guesses");
submit_button.addEventListener("click", submit_answer);
