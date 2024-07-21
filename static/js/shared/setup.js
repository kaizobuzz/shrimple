//@ts-check
import { setup as submit_setup } from "./submit.js";
import {initializeAutofill } from "./autofill.js";
import { results_setup } from "./results.js";
/**@param {boolean} include_results*/
export function setup(include_results){
    if (include_results){
        results_setup();
    }
    submit_setup();
    initializeAutofill();
}

