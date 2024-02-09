const Equal=0;
const NotEqual=1;
const TooLarge=2;
const TooSmall=3;
const PartialEqual=4;
const UnknownComparison=5;
const HiddenComparison=6;
function compareStatistic(guess_statistic, answer_statistic){
    if(guess_statistic == null || answer_statistic == null) {
        return UnknownComparison;
    }
    if(typeof(guess_statistic) != typeof(answer_statistic)){
        console.error("Can't compare guess with answer of different type!")
        return; 
    }
    if (typeof(guess_statistic)=='number'){
        if (guess_statistic>answer_statistic){
            return TooLarge 
        } else if (guess_statistic<answer_statistic){
            return TooSmall
        }
        return Equal
    } else if(guess_statistic.constructor == Array){ // what the heck is this why is js like this
        return compareArrayStatistic(guess_statistic, answer_statistic);
    } else if (guess_statistic==answer_statistic){
        return Equal;
    }
    return NotEqual;
}
function getComparisonHtml(comparisons){
    let html_to_render="";
    const keys=Object.keys(comparisons);
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
        } else if(comparisons[key]==HiddenComparison){ 
            html_to_render += "⬛"
        } else if(comparisons[key] == NotEqual) {
            html_to_render += "🟥"
        } else {
            html_to_render += "uh there was an error"
        }
        html_to_render += " "
    }
    return html_to_render;
}
function checkAgainstShrimp(shrimp_guess, comparison_shrimp){
    let comparisons={};
    if (shrimp_guess.name===comparison_shrimp.name){
        for (const key of Object.keys(shrimp_guess)){
            comparisons[key]=Equal;
        }
    } else{
        for (const key of Object.keys(shrimp_guess)){
            //console.log(shrimp_guess[key], comparison_shrimp[key], key);
            comparisons[key]=compareStatistic(shrimp_guess[key], comparison_shrimp[key]);
        }
    }
    return comparisons
}
function checkAgainstDailyShrimp(input_shrimp){
    return checkAgainstShrimp(input_shrimp, Game.daily_shrimp);
}

function compareArrayStatistic(guess_array, answer_array){
    //return NotEqual if the arrays share no elements.
    //return PartialEqual if the arrays share at least one element.
    //return equal if they contain exactly the same elements
    let num_shared = 0;
    let num_not_shared = 0;
    for(const guess_item of guess_array){
        if(answer_array.includes(guess_item)){
            num_shared += 1;
        } else {
            num_not_shared += 1;
        }
    }
    if(guess_array.length == answer_array.length && answer_array.length == num_shared){
        return Equal;
    } else if(num_shared > 0) {
        return PartialEqual;
    } else {
        return NotEqual;
    }
}
