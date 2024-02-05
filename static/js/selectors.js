async function get_shrimps() {
    response = await fetch("data/shrimps.json");
    shrimps = response.json();
    console.log(shrimps);
    return shrimps;
}

async function get_daily_shrimp() {
    response=await fetch("/dailyshrimp");
    let dailyshrimp=response.text();
    return dailyshrimp;
}
