import {assertNotNull, assertInputElement, assertButtonElement} from "./../shared/utils.js"

export const PlayerInput=assertInputElement(document.getElementById("player-guess"));
export const AutofillResults=assertNotNull(document.getElementById("autofill-results"));
export const InputContainer=assertNotNull(document.querySelector("#shrimp-search"));
export const InfoCheckbox=assertInputElement(document.getElementById("info-toggle"));

export const SubmitButton = assertButtonElement(document.getElementById("input-submit"));
export const GuessResultsDiv=assertNotNull(document.getElementById("guesses"));



