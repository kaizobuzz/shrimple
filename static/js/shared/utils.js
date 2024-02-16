// @ts-check
const sleep = s => new Promise(r => setTimeout(r, s*1000));

/** 
 * @template T
 * @param {T} object 
 * @returns {Exclude<T, null>}
*/
function assertNotNull(object){
    return /**@type {Exclude<T, null>}*/ (object); 
}
/**
*@param {HTMLElement|null} button 
*@returns {HTMLButtonElement}
*/
function assertButtonElement(button){
    return /**@type {HTMLButtonElement}*/(button);
}
/** 
*@param {HTMLElement|null} element     
*@returns {HTMLInputElement}
*/
function assertInputElement(element){
    return /**@type {HTMLInputElement}*/(element);
}
