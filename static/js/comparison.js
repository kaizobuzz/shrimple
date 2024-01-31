const greater_than=0;
const equal=1;
const smaller_than=2;
const not_equal=3;
const partial_equal=4;
const unknown_comparison=5;
function compare_statistic(guess_statistic, answer_statistic){
    if(guess_statistic == null || answer_statistic == null) {
        return unknown_comparison;
    }
    if(typeof(guess_statistic) != typeof(answer_statistic)){
        console.error("Can't compare guess with answer of different type!")
        return; 
    }
    if (typeof(guess_statistic)=='number'){
        if (guess_statistic>answer_statistic){
            return greater_than 
        } else if (guess_statistic<answer_statistic){
            return smaller_than
        }
        return equal
    } else if(guess_statistic.constructor == Array){ // what the heck is this why is js like this
        return compare_array_statistic(guess_statistic, answer_statistic);
    } else if (guess_statistic==answer_statistic){
        return equal;
    }
    return not_equal;
}

function check_against_daily_shrimp(input_lowercase){
    let index=game.shrimp_index_by_name[input_lowercase];
    let shrimp_guess=game.shrimp_list[index];
    var comparisons={};
    for (const key of Object.keys(shrimp_guess)){
        console.log(shrimp_guess[key], game.daily_shrimp[key], key);
        comparisons[key]=compare_statistic(shrimp_guess[key], game.daily_shrimp[key]);
    }
    return comparisons
}

function compare_array_statistic(guess_array, answer_array){
    //return not_equal if the arrays share no elements.
    //return partial_equal if the arrays share at least one element.
    //return equal if they contain exactly the same elements
    var num_shared = 0;
    var num_not_shared = 0;
    for(const guess_item of guess_array){
        if(answer_array.includes(guess_item)){
            num_shared += 1;
        } else {
            num_not_shared += 1;
        }
    }
    if(guess_array.length == answer_array.length && answer_array.length == num_shared){
        return equal;
    } else if(num_shared > 0) {
        return partial_equal;
    } else {
        return not_equal;
    }
}
