//@ts-check
import { setup as submit_setup } from "./submit.js";
import {initializeAutofill } from "./autofill.js";
import { results_setup } from "./results.js";
export function setup(){
    results_setup();
    submit_setup();
    initializeAutofill();
}

