async function get_shrimps() {
    response = await fetch("/shrimps");
    shrimps = await response.json();
    console.log(shrimps);
    return shrimps;
}

async function get_daily_shrimp() {
    response=await fetch("/dailyshrimp");
    let dailyshrimp=await response.text();
    return dailyshrimp;
}
