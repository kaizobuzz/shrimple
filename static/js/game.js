let Game = {
    awaiting_promises: [],
    active: false,
    num_guesses: 0,
    guesses: [],
    shrimp_list: null, 
    daily_shrimp_name: null,
    daily_shrimp: null,
    shrimp_names_lowercase: [],
    shrimp_index_by_name: {},
}

function fillInGameValueWithPromise(promise, key, processing_function){
    if(processing_function == undefined) {
        processing_function = function(x){return x};
    }
    Game.awaiting_promises.push(promise);
    promise.then((value) => {
        Game[key] = processing_function(value);
    });
}


function initializeGameVariablesFromServer(){
    fillInGameValueWithPromise(getShrimps(), "shrimp_list", (x) => {return x.shrimps});
    fillInGameValueWithPromise(getDailyShrimp(), "daily_shrimp_name")

    Promise.all(Game.awaiting_promises).then(() => {
        for (const index in Game.shrimp_list) {
            const shrimp_lowercase = Game.shrimp_list[index].name.toLowerCase();
            Game.shrimp_index_by_name[shrimp_lowercase] = index;
            Game.shrimp_names_lowercase.push(shrimp_lowercase)
        }
        Game.daily_shrimp = Game.shrimp_list[Game.shrimp_index_by_name[Game.daily_shrimp_name.toLowerCase()]];
        console.log("DAILY SHRIMP")
        console.log(Game.daily_shrimp)

        Game.active = true;
    });
}

initializeGameVariablesFromServer();

