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
/**@param {Number} delta_time  */

function decrementTimerRTA(delta_time, offset=0){
    let current_time=performance.now()+offset;
    let time_passed=(current_time-delta_time)/1000
    Width-=MAX_TIMER_WIDTH/(TimerDurationSeconds/time_passed);
    if (Width<=0){
        submitEmptyGuess();
        Timer.style.width="0%";
        Width+=MAX_TIMER_WIDTH;
    }
    else{
        Timer.style.width=Width+"%";
    }
    return current_time;
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

let TimerDurationSeconds=24;
let Width=MAX_TIMER_WIDTH;
let Timer=assertNotNull(document.getElementById("current-timer"));
