async function getShrimps() {
    response = await fetch("data/shrimps.json");
    shrimps = response.json();
    console.log(shrimps);
    return shrimps;
}

async function getDailyShrimp() {
    response=await fetch("/dailyshrimp");
    let dailyshrimp=response.text();
    return dailyshrimp;
}
