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
let guesses=document.getElementById("guesses");
