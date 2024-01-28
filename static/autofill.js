function get_valid_shrimps(input) {
    var valid_shrimps=[];
    var i=0;
    console.log(shrimp_list);
    while (i<shrimp_list.length){
        let position=shrimp_names_lowercase[i].indexOf(input);
        if (position != -1){
            valid_shrimps.push({name: shrimp_list[i].name, pos: position});
        }
        i++;
    } 
    return valid_shrimps;
}
function autofill_shrimps(e) {
    autofill_results.hidden=false;
    let input=e.target.value.toLowerCase();
    if (input==last_input){
        return
    }
    last_input=input;
    if (input.length==0){
        submit_button.disabled=true;
        autofill_results.innerHTML="";
        return;
    }
    if (shrimp_index_by_name[input]==undefined){
        autofill_results.disabled=true;
    }
    console.log(input);
    let valid_shrimps=get_valid_shrimps(input);
    var html_to_render="";
    for (let shrimp of valid_shrimps){
        console.log(Object.keys(shrimp));
        pos=shrimp.pos;
        html_to_render+=
            "<li>"+
            shrimp.name.slice(0, pos)+
            "<mark>"+shrimp.name.slice(pos, pos+input.length)+"</mark>"+
            shrimp.name.slice(pos+input.length);
        if (show_stats){
            let shrimp_stats=shrimp_list[shrimp_index_by_name[shrimp.name.toLowerCase()]];
            html_to_render+=
            "<br><span class=shrimp-info>";
            let keys=Object.keys(shrimp_stats);
            for (const key of keys){
                if (key!="name"){
                    html_to_render+=shrimp_stats[key];
                    if (typeof(shrimp_stats[key])=='number'){
                        html_to_render+="cm";
                    }
                    html_to_render+=", ";
                }
            }
            html_to_render+="</span>";
        }
        html_to_render+="<input type=\"hidden\" value=\""+shrimp.name+"\"/>"+
            "</li>";
    }
    console.log(html_to_render);
    autofill_results.innerHTML=html_to_render;
    add_list_eners();
}
function add_list_eners(){
    let list_items=document.querySelectorAll("li");
    console.log(list_items);
    for (const list_item of list_items){
        list_item.addEventListener("click", use_autofill);
    }
}
function hide_autofill(){
    autofill_results.hidden=true; 
}
function use_autofill(){
    console.log(this.getElementsByTagName("input")[0].value);
    //console.log(e.target.value);
    if (this.getElementsByTagName("input")[0]!=undefined){
        player_input.value=this.getElementsByTagName("input")[0].value;
        submit_button.disabled=false;
        autofill_results.hidden=true;
    }
}
function check_if_clicked_off(e){
    console.log(e.target);
    if (input_container.contains(e.target)&&(e.target.value!=undefined||e.target.childNodes.length==0)){
        if (e.target.textContent=="submit"){
            submit_answer();
            return;
        }
        //use_autofill(e);
    } else{
        hide_autofill();
    }
}
const greater_than=1;
const equal=0;
const smaller_than=-1;
function field_comparison(field, field1){
    if (typeof(field)=='number'){
        if (field>field1){
            return greater_than 
        }
        if (field<field1){
            return smaller_than
        }
        return equal
    }
    if (field==field1){
        return true;
    }
    return false;
}
function is_input_shrimp_valid(input){
    if (shrimp_index_by_name[input.toLowerCase()]==undefined){
        return false;
    }
    return true;
}
function check_against_daily_shrimp(input_lowercase){
    let index=shrimp_index_by_name[input_lowercase];
    let shrimp_guess=shrimp_list[index];
    var comparisons={};
    for (let key of Object.keys(shrimp_guess)){
        console.log(shrimp_guess[key], daily_shrimp[key], key);
        comparisons[key]=field_comparison(shrimp_guess[key], daily_shrimp[key]);
    }
    return comparisons
}
function submit_answer(){
    num_guesses+=1;
    let input=player_input.value.toLowerCase();
    console.log(input);
    if (!is_input_shrimp_valid){
        return;
    }
    let comparisons=check_against_daily_shrimp(input);
    var html_to_render="<p> Guess: "+player_input.value+" ";
    let keys=Object.keys(comparisons);
    for (const key in keys){
        html_to_render+=key+": ";
        if (typeof(comparisons[key])=='number'){
            if (comparisons[key]==greater_than){
                html_to_render+="too high, "
                continue;
            }
            if (comparisons[key]==smaller_than){
                html_to_render+="too low,, "
                continue;
            }
            html_to_render+="correct :3 "
            continue;
        }
        if (comparisons[key]==true){
            html_to_render+="correct :3 "
            continue;
        }
        html_to_render+="incorrect 3: "
    }
    html_to_render+="</p>";
    guesses.innerHTML+=(html_to_render);
}
function toggle_info(e){
    console.log(e.target.value);
    if (e.target.checked==true){
        show_stats=true;
        return;
    }
    show_stats=false;
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
var num_guesses;
let guesses=document.getElementById("guesses");
let player_input=document.getElementById("player-guess")
let autofill_results=document.getElementById("autofill-results");
let submit_button=document.getElementById("input-submit");
var last_input="";
let input_container=document.querySelector("#shrimp-search");
let info_checkbox=document.getElementById("info-toggle");
var show_stats=false;
if (info_checkbox.checked){
    show_stats=true;
}
info_checkbox.addEventListener("input", toggle_info);
player_input.addEventListener("input", autofill_shrimps);
player_input.addEventListener("click", autofill_shrimps);
document.addEventListener("click", check_if_clicked_off);
