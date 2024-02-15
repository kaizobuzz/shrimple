function getShrimpStat(input_shrimp, key){ 
    let result=input_shrimp[key];
    if (result!=null){
        switch (key){
            case "length":
                result+="cm";
                break;
            case "max_depth":
                result+="m";
                break;
            case "weight":
                result+="g";
                break;
            default:
                break;
        }
    }
    return result;
}
function getValidShrimps(input) {
    let valid_shrimps=[];
    for (const index in Game.shrimp_list){
        const position=Game.shrimp_names_lowercase[index].indexOf(input);
        if (position != -1){
            valid_shrimps.push({name: Game.shrimp_list[index].name, pos: position});
        }
    } 
    return valid_shrimps;
}
function autofillShrimps(e) {
    if(!Game.active) {
        return;
    }
    AutofillResults.hidden=false;
    let input=e.target.value.toLowerCase();
    updateSubmitButton(input);
    if (AutofillDisabled){
        AutofillResults.innerHTML="";
        return;
    }
    if (input.length==0){
        AutofillResults.innerHTML="";
        return;
    } 
    //console.log(input);
    const valid_shrimps=getValidShrimps(input);
    let html_to_render="";
    for (const shrimp of valid_shrimps){
        //console.log(Object.keys(shrimp));
        pos=shrimp.pos;
        html_to_render+=
            "<li>"+
            shrimp.name.slice(0, pos)+
            "<mark>"+shrimp.name.slice(pos, pos+input.length)+"</mark>"+
            shrimp.name.slice(pos+input.length);
        if (ShowStats){
            const shrimp_stats=Game.shrimp_list[Game.shrimp_index_by_name[shrimp.name.toLowerCase()]];
            html_to_render+=
            "<br><span class=shrimp-info>";
            for (const key of Object.keys(shrimp_stats)){
                if (key=="name"){
                    continue;
                }
                html_to_render+=getShrimpStat(shrimp_stats, key); 
                html_to_render+=", ";
            }
            html_to_render+="</span>";
        }
        html_to_render+="<input type=\"hidden\" value=\""+shrimp.name+"\"/>"+
            "</li>";
    }
    //console.log(html_to_render);
    AutofillResults.innerHTML=html_to_render;
    addListEners();
}
function addListEners(){
    let list_items=document.querySelectorAll("li");
    //console.log(list_items);
    for (const list_item of list_items){
        list_item.addEventListener("click", useAutofill);
    }
}
function hideAutofill(){
    AutofillResults.hidden=true; 
}
function useAutofill(){
    //console.log(this.getElementsByTagName("input")[0].value);
    //console.log(e.target.value);
    if (this.getElementsByTagName("input")[0]!=undefined){
        PlayerInput.value=this.getElementsByTagName("input")[0].value;
        updateSubmitButton(PlayerInput.value);
        AutofillResults.hidden=true;
    }
}
function checkIfClickedOff(e){
    //console.log(e.target);
    if (!InputContainer.contains(e.target)||(e.target.value==undefined&&e.target.childNodes.length!=0)){
       hideAutofill() 
    }
}
function toggleInfo(e){
    if (e.target.checked==true){
        ShowStats=true;
        return;
    }
    ShowStats=false;
}
let PlayerInput=document.getElementById("player-guess")
let AutofillResults=document.getElementById("autofill-results");
let InputContainer=document.querySelector("#shrimp-search");
let InfoCheckbox=document.getElementById("info-toggle");
let ShowStats=false;
let AutofillDisabled=false;
if (InfoCheckbox.checked){
    ShowStats=true;
}

function initializeAutofill() {
    InfoCheckbox.addEventListener("input", toggleInfo);
    PlayerInput.addEventListener("input", autofillShrimps);
    PlayerInput.addEventListener("click", autofillShrimps);
    document.addEventListener("click", checkIfClickedOff);
}

initializeAutofill();
