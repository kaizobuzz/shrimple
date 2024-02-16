// @ts-check

/** 
 * @typedef {Object} Comparisons
 * @property {number} name
 * @property {number} habitat
 * @property {number} length
 * @property {number} coloration
 * @property {number} weight 
 * @property {number} max_depth
*/
const Equal=0;
const NotEqual=1;
const TooLarge=2;
const TooSmall=3;
const PartialEqual=4;
const UnknownComparison=5;
const HiddenComparison=6;

/** 
 * @function 
 * @template A 
 * @param {A|null} guess_statistic
 * @param {A|null} answer_statistic
 * @returns {number}
 */
function compareStatistic(guess_statistic, answer_statistic){
    if(guess_statistic == null || answer_statistic == null) {
        return UnknownComparison;
    }
    if(typeof(guess_statistic) != typeof(answer_statistic)){
        console.error("Can't compare guess with answer of different type!")
        return HiddenComparison; 
    }
    if (typeof(guess_statistic)=='number'&&typeof(answer_statistic)=='number'){
        if (guess_statistic>answer_statistic){
            return TooLarge 
        } else if (guess_statistic<answer_statistic){
            return TooSmall
        }
        return Equal
        //TODO check if this changes stuff
    } else if(Array.isArray(guess_statistic)&&Array.isArray(answer_statistic)){ // what the heck is this why is js like this
        return compareArrayStatistic(guess_statistic, answer_statistic);
    } else if (guess_statistic==answer_statistic){
        return Equal;
    }
    return NotEqual;
}
/**
 * @param {Comparisons} comparisons 
 * @returns {string[]}
 */
function getComparisonHtml(comparisons){
    let html_to_render=[];
    const keys=Object.keys(comparisons);
    for (const key of keys){
        //html_to_render+=key+": ";
        if(comparisons[key] == TooLarge) {
            html_to_render.push("⬇️")
        } else if(comparisons[key] == TooSmall) {
            html_to_render.push("⬆️")
        } else if(comparisons[key] == Equal) {
            html_to_render.push("🟩")
        } else if(comparisons[key] == PartialEqual) {
            html_to_render.push("🟨")
        } else if(comparisons[key] == UnknownComparison) {
            html_to_render.push("🟪")
        } else if(comparisons[key]==HiddenComparison){ 
            html_to_render.push("⬛")
        } else if(comparisons[key] == NotEqual) {
            html_to_render.push("🟥")
        } else {
            html_to_render.push("uh there was an error")
        }
    }
    return html_to_render;
}
/**
 * @param {Shrimp} shrimp_guess
 * @param {Shrimp} comparison_shrimp
 * @returns {Comparisons}
 */
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
/**
 *@param {Shrimp} input_shrimp
 *@returns {Comparisons}
 */
function checkAgainstDailyShrimp(input_shrimp){
    return checkAgainstShrimp(input_shrimp, assertNotNull(Game.daily_shrimp));
}
/** 
 * @param {string[]} guess_array  
 * @param {string[]} answer_array 
 * @returns {number}
 */
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
