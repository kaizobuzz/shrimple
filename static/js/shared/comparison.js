// @ts-check
/** 
 * @typedef {import ('./shrimp_type.js').Shrimp} Shrimp
 */

/** 
 * @typedef {Object} Comparisons
 * @property {number} name
 * @property {number} habitat
 * @property {number} length
 * @property {number} coloration
 * @property {number} weight 
 * @property {number} max_depth
*/
export const ComparisonTypes= {
    Equal: 0,
    NotEqual: 1,
    TooLarge: 2, 
    TooSmall: 3, 
    PartialEqual: 4,
    UnknownComparison: 5, 
    HiddenComparison: 6,
};

const path="img/", png=".png";
const Images={
    equal: path+"shrimpcorrect"+png,
    notequal: path+"shrimpincorrect"+png, 
    toolarge: path+"shrimptoobig"+png,
    toosmall: path+"shrimptoosmall"+png,
    partialequal: path+"shrimppartialequal"+png, 
    unknowncomparison: path+"shrimpunknown"+png,
    hiddencomparison: path+"shrimphide"+png,
}
/** 
 * @function 
 * @template A 
 * @param {A|null} guess_statistic
 * @param {A|null} answer_statistic
 * @returns {number}
 */
function compareStatistic(guess_statistic, answer_statistic){
    if(guess_statistic == null || answer_statistic == null) {
        return ComparisonTypes.UnknownComparison;
    }
    if(typeof(guess_statistic) != typeof(answer_statistic)){
        console.error("Can't compare guess with answer of different type!")
        return ComparisonTypes.HiddenComparison; 
    }
    if (typeof(guess_statistic)=='number'&&typeof(answer_statistic)=='number'){
        if (guess_statistic>answer_statistic){
            return ComparisonTypes.TooLarge 
        } else if (guess_statistic<answer_statistic){
            return ComparisonTypes.TooSmall
        }
        return ComparisonTypes.Equal
    } else if(Array.isArray(guess_statistic)&&Array.isArray(answer_statistic)){ // what the heck is this why is js like this
        return compareArrayStatistic(guess_statistic, answer_statistic);
    } else if (guess_statistic==answer_statistic){
        return ComparisonTypes.Equal;
    }
    return ComparisonTypes.NotEqual;
}
/**@param {Number[]} comparisonarray  
 * @returns {string[]}*/
export function getComparisonImagesByArray(comparisonarray){
    let resimages=[]; 
    for (const value of comparisonarray){
        switch (value){
            case ComparisonTypes.Equal:
                resimages.push(Images.equal);
                break;
            case ComparisonTypes.NotEqual:
                resimages.push(Images.notequal);
                break;
            case ComparisonTypes.TooLarge:
                resimages.push(Images.toolarge);
                break;
            case ComparisonTypes.TooSmall:
                resimages.push(Images.toosmall);
                break;
            case ComparisonTypes.PartialEqual:
                resimages.push(Images.partialequal);
                break;
            case ComparisonTypes.UnknownComparison:
                resimages.push(Images.unknowncomparison);
                break;
            case ComparisonTypes.HiddenComparison:
                resimages.push(Images.hiddencomparison);
                break;
            default:
                resimages.push(Images.hiddencomparison); 
                console.error("unknown comparison number "+value);
        }
    }
    return resimages;
}
/**@param {Comparisons} comparisons 
 * @returns {string[]}
 */
export function getComparisonImages(comparisons){
    return getComparisonImagesByArray(Object.values(comparisons));
}
/**@param {number[]} comparisonarray 
 * @returns {string[]} */
export function getComparisonHtmlByArray(comparisonarray){
    let html_to_render=/**@type string[]*/([]);
    for (const value of comparisonarray){
        //html_to_render+=key+": ";
        if(value == ComparisonTypes.TooLarge) {
            html_to_render.push("⬇️")
        } else if(value == ComparisonTypes.TooSmall) {
            html_to_render.push("⬆️")
        } else if(value == ComparisonTypes.Equal) {
            html_to_render.push("🟩")
        } else if(value == ComparisonTypes.PartialEqual) {
            html_to_render.push("🟨")
        } else if(value == ComparisonTypes.UnknownComparison) {
            html_to_render.push("🟪")
        } else if(value==ComparisonTypes.HiddenComparison){ 
            html_to_render.push("⬛")
        } else if(value == ComparisonTypes.NotEqual) {
            html_to_render.push("🟥")
        } else {
            html_to_render.push("uh there was an error")
        }
    }
    return html_to_render
}
/**
 * @param {Comparisons} comparisons 
 * @returns {string[]}
 */
export function getComparisonHtml(comparisons){
    return getComparisonHtmlByArray(Object.values(comparisons));
}
/**
 * @param {Shrimp} shrimp_guess
 * @param {Shrimp} comparison_shrimp
 * @returns {Comparisons}
 */
export function checkAgainstShrimp(shrimp_guess, comparison_shrimp){
    let comparisons=/**@type Comparisons*/({});
    if (shrimp_guess.name===comparison_shrimp.name){
        for (const key of Object.keys(shrimp_guess)){
            comparisons[key]=ComparisonTypes.Equal;
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
        return ComparisonTypes.Equal;
    } else if(num_shared > 0) {
        return ComparisonTypes.PartialEqual;
    } else {
        return ComparisonTypes.NotEqual;
    }
}
