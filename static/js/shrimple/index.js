//@ts-check
import {getMode, assertNotNull, Modes} from "./../shared/utils.js";
import { setup } from "../shared/setup.js";
import { results_setup } from "./results.js";
import { info_setup } from "../shared/info.js";
import { changeSubmitFunction } from "../clamplicated/submitchange.js";
import { initializeGameVariablesFromServer } from "./game.js";

initializeGameVariablesFromServer();
setup();
info_setup();
let mode=getMode();
console.log(mode);
results_setup();
if (mode==Modes.Shrimple){
} else if (mode==Modes.Clamplicated){
    changeSubmitFunction();
} else {
}
