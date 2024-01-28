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
let shrimp_list_promise=get_shrimps();
var shrimp_list;
var shrimp_names_lowercase=[];
var shrimp_index_by_name={};
let daily_shrimp_promise=get_daily_shrimp()
var daily_shrimp;
shrimp_list_promise.then((shrimps) =>{
    shrimp_list=shrimps.shrimps;
    for (index in shrimp_list){
        let shrimp_lowercase=shrimp_list[index].name.toLowerCase();
        shrimp_index_by_name[shrimp_lowercase]=index;
        shrimp_names_lowercase.push(shrimp_lowercase);
    }
    daily_shrimp_promise.then((daily) =>{
    daily_shrimp=shrimp_list[shrimp_index_by_name[daily.toLowerCase()]];
    console.log("daily shrimp:", daily_shrimp);
    })
})
console.log(shrimp_list_promise);

