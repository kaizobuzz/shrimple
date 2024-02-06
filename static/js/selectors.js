async function getShrimps() {
    const response = await fetch("data/shrimps.json");
    const shrimps = response.json();
    console.log(shrimps);
    return shrimps;
}

async function getDailyShrimp() {
    const response=await fetch("/dailyshrimp");
    const dailyshrimp=response.text();
    return dailyshrimp;
}
