const FRAME_TIME=0.02;

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

function getRandomIndex(array){
    return Math.floor(Math.random()*array.length);
}

/**@type number*/
let CurrentGuesses=0;
/**@type number*/
let CurrentLives=0;
