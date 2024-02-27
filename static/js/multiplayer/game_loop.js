//@ts-check
async function startGameLoop(){
    let iterator=0;
    CurrentLives=Game.lives;
    CurrentGuesses=Game.num_guesses;
    let [offset, timer_width]=getTimeOffset();
    let current_time=performance.now()+offset;
    Width=timer_width
    while (Game.active){
        await sleep(FRAME_TIME)
        iterator+=1;
        if (iterator>(3/FRAME_TIME)){
            iterator=0;
            receiveEvents();
        }
        current_time=decrementTimerRTA(current_time, offset);
        checkForGuesses()       
        for (const effect of NewEffects){
            effect.start_function();
            CurrentEffects.push(effect);
        }
        NewEffects=[];
    }
}
function redirectOut(){
    console.log("you would be redirected here")
    //window.location.replace("/timeout.html")
}

