const greater_than=1;
const equal=0;
const smaller_than=-1;
function field_comparison(field, field1){
    if (typeof(field)=='number'){
        if (field>field1){
            return greater_than 
        }
        if (field<field1){
            return smaller_than
        }
        return equal
    }
    if (field==field1){
        return true;
    }
    return false;
}
function is_input_shrimp_valid(input){
    if (shrimp_index_by_name[input.toLowerCase()]==undefined){
        return false;
    }
    return true;
}
function check_against_daily_shrimp(input_lowercase){
    let index=shrimp_index_by_name[input_lowercase];
    let shrimp_guess=shrimp_list[index];
    var comparisons={};
    for (let key of Object.keys(shrimp_guess)){
        console.log(shrimp_guess[key], daily_shrimp[key], key);
        comparisons[key]=field_comparison(shrimp_guess[key], daily_shrimp[key]);
    }
    return comparisons
}
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
    for (const key in keys){
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

var num_guesses;
document.getElementById("input-submit").addEventListener("click", submit_answer);
let guesses=document.getElementById("guesses");
