// @ts-check
const PROMPT_LENGTH=3;
const BOMB_TIMER_SECONDS=15;

function getBombPartyPrompt(){
    const index=getRandomIndex(Game.shrimp_list);
    const shrimp_words=Game.shrimp_list[index].name.split(" ").join("");
    let prompt_index=getRandomIndex(shrimp_words)-(PROMPT_LENGTH);
    if (prompt_index<0){
        prompt_index=0;
    }
    console.log(shrimp_words);
    console.log(prompt_index);
    let next_prompt=shrimp_words.slice(prompt_index, prompt_index+PROMPT_LENGTH).toLowerCase();
    return next_prompt;
    //const wordindex=Math.floor(Math.random()*shrimp_words.length);
    //const shrimp_word=shrimp_words[wordindex];
}
/**@param {string} input*/
function canSubmitForBomb(input){
    if (isInputShrimpValid(input)){
        let stripped_input=input.toLowerCase().split(" ").join("");
        return stripped_input.includes(CurrentPrompts[0]);
    }
    return false;
}
function submitShrimpForBomb(){
    CurrentPrompts.shift();
    PlayerInput.value="";
    SubmitButton.disabled=true;
    if (CurrentPrompts.length<=0){
        return
    }
    //TODO need to update the bomb visuals
}
async function useBomb(){
    const current_prompt=CurrentPrompts[0];
    //TODO render bomb
    let time_remaining=BOMB_TIMER_SECONDS;
    while (current_prompt===CurrentPrompts[0]){
        GuessResultsDiv.innerHTML="<p>Bomb party prompt:"+current_prompt+
            ", Remaining time: "+Math.round(time_remaining)+"s </p>";
        await sleep(FRAME_TIME);
        time_remaining-=FRAME_TIME;
        if (time_remaining<=0){
           //TODO explode bomb 
            submitShrimpForBomb();
            outOfGuesses();
            break;
        }
    }
}
async function checkForBombs(){
    if (BombPartyActive===true){
        return;
    }
    let timer_duration=TimerDurationSeconds;
    TimerDurationSeconds=1000000;
    const guesshtml=GuessResultsDiv.innerHTML;
    AutofillDisabled=true;
    BombPartyActive=true;
    SubmitOverride.submit_function=submitShrimpForBomb;
    SubmitOverride.can_submit_function=canSubmitForBomb;
    while (CurrentPrompts.length>0){
        await useBomb();
    }
    TimerDurationSeconds=timer_duration;
    AutofillDisabled=false;
    BombPartyActive=false;
    disableSubmitFunctionOverride();
    GuessResultsDiv.innerHTML=guesshtml;
}
function startBombParty(){
    CurrentPrompts.push(getBombPartyPrompt());
    checkForBombs();
}

let BombPartyActive=false;
let BombDisabled=true;
/** @type {string[]}*/
let CurrentPrompts=[];
