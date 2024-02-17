//@ts-check
class GameEffect{
    /** 
     * @param {Function} start_function 
     * @param {Function} end_function 
     * @param {number} duration_guesses 
    */
    constructor(start_function, end_function, duration_guesses){
        this.start_function=start_function;
        this.end_function=end_function;
        this.duration_guesses=duration_guesses;
    }
}

function checkForGuesses(){
    if (CurrentLives!=Game.lives){
        CurrentLives=Game.lives;
        for (const effect of CurrentEffects){
            effect.end_function();
        }
        CurrentEffects=[];
        return;
    }
    if (CurrentGuesses!=Game.num_guesses){ 
        CurrentGuesses=Game.num_guesses;
        for (const effect of CurrentEffects){
            effect.duration_guesses-=1;
            if (effect.duration_guesses==0){
                effect.end_function();
            }
        }
        CurrentEffects=CurrentEffects.filter((effect) => effect.duration_guesses>0);
    }
}

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

let NewEffects=[];
let CurrentEffects=[];
let CurrentGuesses=null;
let CurrentLives=null;
