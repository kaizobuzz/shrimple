//@ts-check

import {assertNotNull, assertButtonElement, sleep} from "./utils.js";

export const FinalResults=assertNotNull(document.getElementById("final-results"));
export const FinalResultsText=assertNotNull(document.getElementById("final-results-text"));
export const ShareButton=assertButtonElement(document.getElementById("share-results"));
export const ClipboardMessage=assertNotNull(document.getElementById("clipboard-message"));
export const CloseButton=assertButtonElement(document.getElementById("results-close"));
export const OpenButton=assertButtonElement(document.getElementById("results-open"));
export function results_setup(){
OpenButton.addEventListener("click", async function(){
    Functions.Open();
    OpenButton.hidden=true;
    FinalResults.hidden=false;
    await sleep(0.05);
    FinalResults.style.opacity="1";
});
CloseButton.addEventListener("click", async function(){
    OpenButton.hidden=false;
    FinalResults.style.opacity="0";
    await sleep(0.5);
    FinalResults.hidden=true;
});
ShareButton.addEventListener("click", function(){
    Functions.Clipboard();
});
}
const ClipboardFunction=async function(){};

const OpenButtonFunction=async function(){}

export const Functions = {
    Clipboard: ClipboardFunction,
    Open: OpenButtonFunction,
};


