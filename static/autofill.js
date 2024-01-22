function autofill_shrimps(e) {
    autofill_results.hidden=false;
    let input=e.target.value.toLowerCase();
    if (input==last_input){
        autofill_results.hidden=false;
        return
    }
    last_input=input;
    console.log(input);
    var valid_shrimps=[];
    if (input.length==0){
        autofill_results.innerHTML="";
        return;
    }
    var i=0;
    console.log(shrimp_list);
    while (i<shrimp_list.length){
        let position=shrimp_names_lowercase[i].indexOf(input);
        if (position != -1){
            valid_shrimps.push({name: shrimp_list[i].name, pos: position});
        }
        i++;
    } 
    var html_to_render="";
    for (index in valid_shrimps){
        let shrimp=valid_shrimps[index];
        console.log(Object.keys(shrimp));
        pos=shrimp.pos;
        html_to_render+=
            "<li>"+
            shrimp.name.slice(0, pos)+
            "<mark>"+shrimp.name.slice(pos, pos+input.length)+"</mark>"+
            shrimp.name.slice(pos+input.length)+
            "</li>";
    }
    console.log(html_to_render);
    autofill_results.innerHTML=html_to_render;
}
function hide_autofill(){
    autofill_results.hidden=true; 
}
function use_autofill(e){
    console.log(e.target.textContent);
    if (e.target.textContent!=""){
        player_guess.value=e.target.textContent;
        autofill_results.hidden=true;
    }
}
function check_if_clicked_off(e){
    if (input_container.contains(e.target)&&e.target.value!=undefined){
        use_autofill(e);
    } else{
        hide_autofill();
    }
}
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
shrimp_list_promise.then((shrimps) =>{
    shrimp_list=shrimps.shrimps;
    for (index in shrimp_list){
        shrimp_names_lowercase.push(shrimp_list[index].name.toLowerCase());
    }
})
let daily_shrimp_promise=get_daily_shrimp()
var daily_shrimp;
daily_shrimp_promise.then((daily) =>{
    daily_shrimp=daily;
    console.log("daily shrimp:", daily_shrimp);
})
console.log(shrimp_list_promise);
let player_guess=document.getElementById("player-guess")
let autofill_results=document.getElementById("autofill-results");
var last_input="";
let input_container=document.querySelector("#player-input");
player_guess.addEventListener("input", autofill_shrimps);
player_guess.addEventListener("click", autofill_shrimps);
document.addEventListener("click", check_if_clicked_off);
