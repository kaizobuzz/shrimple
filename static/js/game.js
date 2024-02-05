
var game = {
    awaiting_promises: [],
    active: false,
    num_guesses: 0,
    shrimp_list: null, 
    daily_shrimp_name: null,
    daily_shrimp: null,
    shrimp_names_lowercase: [],
    shrimp_index_by_name: {},
}

function fill_in_game_value_with_promise(promise, key, processing_function){
    if(processing_function == undefined) {
        processing_function = function(x){return x};
    }
    game.awaiting_promises.push(promise);
    promise.then((value) => {
        game[key] = processing_function(value);
    });
}


function initialize_game_variables_from_server(){
    fill_in_game_value_with_promise(get_shrimps(), "shrimp_list", (x) => {return x.shrimps});
    fill_in_game_value_with_promise(get_daily_shrimp(), "daily_shrimp_name")

    Promise.all(game.awaiting_promises).then(() => {
        for (index in game.shrimp_list) {
            let shrimp_lowercase = game.shrimp_list[index].name.toLowerCase();
            game.shrimp_index_by_name[shrimp_lowercase] = index;
            game.shrimp_names_lowercase.push(shrimp_lowercase)
        }
        game.daily_shrimp = game.shrimp_list[game.shrimp_index_by_name[game.daily_shrimp_name.toLowerCase()]];
        console.log("DAILY SHRIMP")
        console.log(game.daily_shrimp)

        game.active = true;
    });
}

initialize_game_variables_from_server();


