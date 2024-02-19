//@ts-check
const SPEED_UP={
    factor: 1.5,
    colour: "#d09e83" 
}
const MAX_TIMER_WIDTH=100;

function decrementTimer(){
    Width-=MAX_TIMER_WIDTH/(TimerDurationSeconds/FRAME_TIME);
    Timer.style.width=Width+"%";
    if (Width<=0){
        submitEmptyGuess();
        Width=MAX_TIMER_WIDTH;
    }
}

function speedUpTimerOn(){
    TimerDurationSeconds/=SPEED_UP.factor;
    Timer.style.backgroundColor=SPEED_UP.colour;
}
function speedUpTimerOff(){
    TimerDurationSeconds*=SPEED_UP.factor;
    Timer.style.backgroundColor="";
}
function speedUpTimerPermanent(){
    TimerDurationSeconds/=(SPEED_UP.factor**0.25)
}

function resetTimer(){
    Width=MAX_TIMER_WIDTH;
}

let TimerDurationSeconds=100;
let Width=MAX_TIMER_WIDTH;
let Timer=assertNotNull(document.getElementById("current-timer"));
