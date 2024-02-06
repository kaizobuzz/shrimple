function getValidShrimps(input) {
    var valid_shrimps=[];
    var i=0;
    console.log(game.shrimp_list);
    while (i<game.shrimp_list.length){
        let position=game.shrimp_names_lowercase[i].indexOf(input);
        if (position != -1){
            valid_shrimps.push({name: game.shrimp_list[i].name, pos: position});
        }
        i++;
    } 
    return valid_shrimps;
}
function autofillShrimps(e) {
    if(!game.active||autofill_disabled) {
        return;
    }
    autofill_results.hidden=false;
    let input=e.target.value.toLowerCase();
    updateSubmitButton(input);
    if (input.length==0){
        autofill_results.innerHTML="";
        return;
    } 
    console.log(input);
    let valid_shrimps=getValidShrimps(input);
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
            let shrimp_stats=game.shrimp_list[game.shrimp_index_by_name[shrimp.name.toLowerCase()]];
            html_to_render+=
            "<br><span class=shrimp-info>";
            let keys=Object.keys(shrimp_stats);
            for (const key of keys){
                if (key=="name"){
                    continue;
                }
                html_to_render+=shrimp_stats[key];
                if (shrimp_stats[key]!=null){
                    if (key=='length'){
                        html_to_render+="cm";
                    } 
                    else if (key=='max_depth'){
                        html_to_render+='m'; 
                    }
                    else if (key=='weight'){
                        html_to_render+='g';
                    }
                }
                    html_to_render+=", ";
            }
            html_to_render+="</span>";
        }
        html_to_render+="<input type=\"hidden\" value=\""+shrimp.name+"\"/>"+
            "</li>";
    }
    console.log(html_to_render);
    autofill_results.innerHTML=html_to_render;
    addListEners();
}
function addListEners(){
    let list_items=document.querySelectorAll("li");
    console.log(list_items);
    for (const list_item of list_items){
        list_item.addEventListener("click", useAutofill);
    }
}
function hideAutofill(){
    autofill_results.hidden=true; 
}
function useAutofill(){
    console.log(this.getElementsByTagName("input")[0].value);
    //console.log(e.target.value);
    if (this.getElementsByTagName("input")[0]!=undefined){
        player_input.value=this.getElementsByTagName("input")[0].value;
        updateSubmitButton(player_input.value);
        autofill_results.hidden=true;
    }
}
function checkIfClickedOff(e){
    console.log(e.target);
    if (!input_container.contains(e.target)||(e.target.value==undefined&&e.target.childNodes.length!=0)){
       hideAutofill() 
    }
}
function toggleInfo(e){
    if (e.target.checked==true){
        show_stats=true;
        return;
    }
    show_stats=false;
}
let player_input=document.getElementById("player-guess")
let autofill_results=document.getElementById("autofill-results");
let input_container=document.querySelector("#shrimp-search");
let info_checkbox=document.getElementById("info-toggle");
var show_stats=false;
var autofill_disabled=false;
if (info_checkbox.checked){
    show_stats=true;
}

function initializeAutofill() {
    info_checkbox.addEventListener("input", toggleInfo);
    player_input.addEventListener("input", autofillShrimps);
    player_input.addEventListener("click", autofillShrimps);
    document.addEventListener("click", checkIfClickedOff);
}

initializeAutofill();
