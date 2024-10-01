//@ts-check
//
import { assertNotNull } from "../shared/utils.js";
import { FRAME_TIME } from "./utils.js";
import { submitEmptyGuess } from "./submitchange.js";
const SPEED_UP={
    factor: 1.5,
    colour: "#d09e83" 
}
export const MAX_TIMER_WIDTH=100;

export function decrementTimer(){
    TimerStats.width-=MAX_TIMER_WIDTH/(TimerStats.duration/FRAME_TIME);
    Timer.style.width=TimerStats.width+"%";
    if (TimerStats.width<=0){
        submitEmptyGuess();
        TimerStats.width=MAX_TIMER_WIDTH;
    }
}
/**@param {Number} delta_time  */

export function decrementTimerRTA(delta_time, offset=0){
    let current_time=performance.now()+offset;
    let time_passed=(current_time-delta_time)/1000
    TimerStats.width-=MAX_TIMER_WIDTH/(TimerStats.duration/time_passed);
    if (TimerStats.width<=0){
        submitEmptyGuess();
        Timer.style.width="0%";
        TimerStats.width+=MAX_TIMER_WIDTH;
    }
    else{
        Timer.style.width=TimerStats.width+"%";
    }
    return current_time;
}
export function speedUpTimerOn(){
    TimerStats.duration/=SPEED_UP.factor;
    Timer.style.backgroundColor=SPEED_UP.colour;
}
export function speedUpTimerOff(){
    TimerStats.duration*=SPEED_UP.factor;
    Timer.style.backgroundColor="";
}
export function speedUpTimerPermanent(){
    TimerStats.duration/=(SPEED_UP.factor**0.25)
}

export function resetTimer(){
    TimerStats.width=MAX_TIMER_WIDTH;
}

export const TimerStats={duration: 24, width: MAX_TIMER_WIDTH};
let Timer=assertNotNull(document.getElementById("current-timer"));
