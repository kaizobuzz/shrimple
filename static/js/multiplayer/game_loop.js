//@ts-check
async function startGameLoop(){
    let iterator=0;
    CurrentLives=Game.lives;
    CurrentGuesses=Game.num_guesses;
    let current_time=performance.now();
    while (Game.active){
        await sleep(FRAME_TIME)
        iterator+=1;
        if (iterator>(3/FRAME_TIME)){
            iterator=0;
            receiveEvents();
        }
        current_time=decrementTimerRTA(current_time);
        checkForGuesses()       
        for (const effect of NewEffects){
            effect.start_function();
            CurrentEffects.push(effect);
        }
        NewEffects=[];
    }
}
function redirectOut(){
    window.location.replace("/timeout.html")
}

