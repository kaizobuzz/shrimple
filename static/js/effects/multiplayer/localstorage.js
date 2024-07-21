//@ts-check
const current_time_local_name="current_time"
import { MAX_TIMER_WIDTH, TimerStats } from "../timer";
import { GameId } from "./start_game";
/**@returns {number[]} */
export function getTimeOffset(){
    let last_time_string=window.localStorage.getItem(current_time_local_name)
    if (last_time_string==null){ 
        return [0, MAX_TIMER_WIDTH];
    }
    let last_time_object=JSON.parse(last_time_string) 
    if (last_time_object.game_id!=GameId){
        window.localStorage.removeItem(current_time_local_name); 
        return [0, MAX_TIMER_WIDTH];
    }
    let offset=last_time_object.time-performance.now(); 
    return [offset, /**@type number*/last_time_object.width];
}
export function setTimeOffset(){
    let last_time_object={
        game_id: GameId,
        time: performance.now(),
        width: TimerStats.width,
    }
    window.localStorage.setItem(current_time_local_name, JSON.stringify(last_time_object));
}
