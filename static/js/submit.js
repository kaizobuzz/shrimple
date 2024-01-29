function submit_answer(){
    num_guesses+=1;
    let input=player_input.value.toLowerCase();
    console.log(input);
    if (!is_input_shrimp_valid){
        return;
    }
    let comparisons=check_against_daily_shrimp(input);
    var html_to_render="<p> Guess: "+player_input.value+" ";
    let keys=Object.keys(comparisons);
    for (const key of keys){
        html_to_render+=key+": ";
        if (typeof(comparisons[key])=='number'){
            if (comparisons[key]==greater_than){
                html_to_render+="too high, "
                continue;
            }
            if (comparisons[key]==smaller_than){
                html_to_render+="too low,, "
                continue;
            }
            html_to_render+="correct :3 "
            continue;
        }
        if (comparisons[key]==true){
            html_to_render+="correct :3 "
            continue;
        }
        html_to_render+="incorrect 3: "
    }
    html_to_render+="</p>";
    guesses.innerHTML+=(html_to_render);
}
function is_input_shrimp_valid(input){
    if (shrimp_index_by_name[input.toLowerCase()]==undefined){
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
submit_button.addEventListener("click", submit_answer);

