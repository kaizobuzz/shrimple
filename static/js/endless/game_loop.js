//@ts-check

async function waitForGameStart(){
    return
}
async function startGameLoop(){
    CurrentLives=Game.lives;
    CurrentGuesses=Game.num_guesses;
    while (Game.active){
        await sleep(FRAME_TIME) 
        decrementTimer()
        checkForGuesses()       
        for (const effect of NewEffects){
            effect.start_function();
            CurrentEffects.push(effect);
        }
        NewEffects=[];
    }
}

