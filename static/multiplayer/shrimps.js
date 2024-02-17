//@ts-check
async function getShrimps() {
    const response = await fetch("data/shrimps.json");
    const shrimps = (await response.json()).shrimps;
    console.log(shrimps);
    return shrimps;
}

async function getRandomShrimpServer(){
    const response=await fetch("/randomshrimp");
    const random_shrimp_name=await response.text();
    return random_shrimp_name;
}

function getNewRandomShrimp(){
    Game.current_shrimp=Game.next_shrimp;
    SubmitOverride.comparison_shrimp=Game.current_shrimp;
    Game.next_shrimp=null;
    const response = fetch("/randomshrimp");
    response.then((result) => {
        const next_shrimp_promise = result.text();
        next_shrimp_promise.then((next_shrimp_name) => {
            Game.next_shrimp=Game.shrimp_list[Game.shrimp_index_by_name[next_shrimp_name.toLowerCase()]];
            console.log(Game.next_shrimp);
        });
    });
}
