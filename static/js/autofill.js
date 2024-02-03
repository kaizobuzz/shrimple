function get_valid_shrimps(input) {
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
function autofill_shrimps(e) {
    if(!game.initialized) {
        return;
    }
    autofill_results.hidden=false;
    let input=e.target.value.toLowerCase();
    update_submit_button(input);
    if (input.length==0){
        autofill_results.innerHTML="";
        return;
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
        update_submit_button(player_input.value);
        autofill_results.hidden=true;
    }
}
function check_if_clicked_off(e){
    console.log(e.target);
    if (!input_container.contains(e.target)||(e.target.value==undefined&&e.target.childNodes.length!=0)){
       hide_autofill() 
    }
}
function toggle_info(e){
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
if (info_checkbox.checked){
    show_stats=true;
}

function initialize_autofill() {
    info_checkbox.addEventListener("input", toggle_info);
    player_input.addEventListener("input", autofill_shrimps);
    player_input.addEventListener("click", autofill_shrimps);
    document.addEventListener("click", check_if_clicked_off);
}

initialize_autofill();
