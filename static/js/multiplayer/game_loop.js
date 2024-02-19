//@ts-check
async function startGameLoop(){
    let iterator=0;
    CurrentLives=Game.lives;
    CurrentGuesses=Game.num_guesses;
    while (Game.active){
        await sleep(FRAME_TIME)
        iterator+=1;
        if (iterator>(5/FRAME_TIME)){
            iterator=0;
            receiveEvents();
        }
        decrementTimer()
        checkForGuesses()       
        for (const effect of NewEffects){
            effect.start_function();
            CurrentEffects.push(effect);
        }
        NewEffects=[];
    }
}

