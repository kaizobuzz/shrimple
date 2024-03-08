// @ts-check
/**
 * @param {Shrimp} input_shrimp 
 * @param {string} key 
 * @returns {string}
 */
function getShrimpStat(input_shrimp, key){ 
    if (key=="coloration"){
        return input_shrimp.coloration.join(", ")
    }
    let result=input_shrimp[key];
    if (result==null){
        return "unknown"
    }
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
    return result;
}
/**@param {string} input  */
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

function autofillShrimps() {
    if(!Game.active) {
        return;
    }
    AutofillResults.hidden=false;
    let input=PlayerInput.value.toLowerCase();
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
    let html_to_render_dirty="";
    for (const shrimp of valid_shrimps){
        //console.log(Object.keys(shrimp));
        const pos=shrimp.pos;
        html_to_render_dirty+=
            "<li>"+
            shrimp.name.slice(0, pos)+
            "<mark>"+shrimp.name.slice(pos, pos+input.length)+"</mark>"+
            shrimp.name.slice(pos+input.length);
        if (ShowStats){
            const shrimp_stats=Game.shrimp_list[Game.shrimp_index_by_name[shrimp.name.toLowerCase()]];
            html_to_render_dirty+=
            "<br><span class=shrimp-info>";
            for (const key of Object.keys(shrimp_stats)){
                if (key=="name"){
                    continue;
                }
                html_to_render_dirty+=getShrimpStat(shrimp_stats, key); 
                html_to_render_dirty+=", ";
            }
            html_to_render_dirty+="</span>";
        }
        html_to_render_dirty+="<input type=\"hidden\" value=\""+shrimp.name+"\"/>"+
            "</li>";
    }
    //console.log(html_to_render);
    const html_to_render_clean=DOMPurify.sanitize(html_to_render_dirty);
    AutofillResults.innerHTML=html_to_render_clean;
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
    if (this.getElementsByTagName("input")[0]!=undefined){
        PlayerInput.value=this.getElementsByTagName("input")[0].value;
        updateSubmitButton(PlayerInput.value);
        AutofillResults.hidden=true;
    }
}
/**@param {Event} e  */
function checkIfClickedOff(e){
    let target=/**@type Node */(assertNotNull(e.target));
    if (!InputContainer.contains(target)||(target["value"]==undefined&&target.childNodes.length!=0)){
       hideAutofill() 
    }
}
function toggleInfo(){
    if (InfoCheckbox.checked==true){
        ShowStats=true;
        return;
    }
    ShowStats=false;
}
let PlayerInput=assertInputElement(document.getElementById("player-guess"));
let AutofillResults=assertNotNull(document.getElementById("autofill-results"));
let InputContainer=assertNotNull(document.querySelector("#shrimp-search"));
let InfoCheckbox=assertInputElement(document.getElementById("info-toggle"));
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
