// @ts-check

export const MAX_GUESSES=6;
export const sleep = (s) => new Promise(r => setTimeout(r, s*1000));

/**
 * @readonly 
 * @enum {string}
 */ 
export const Modes={
    Shrimple: "shrimple",
    Clamplicated: "clamplicated",
}
Object.freeze(Modes);

/** 
 * @template T
 * @param {T} object 
 * @returns {Exclude<T, null>}
*/
export function assertNotNull(object){
    return /**@type {Exclude<T, null>}*/ (object); 
}
/**
*@param {HTMLElement|null} button 
*@returns {HTMLButtonElement}
*/
export function assertButtonElement(button){
    return /**@type {HTMLButtonElement}*/(button);
}
/** 
*@param {HTMLElement|null} element     
*@returns {HTMLInputElement}
*/
export function assertInputElement(element){
    return /**@type {HTMLInputElement}*/(element);
}
export function getMode(){
    let urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("mode");
};

