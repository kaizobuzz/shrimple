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
    if (AutofillDisabled>0){
        AutofillResults.innerHTML="";
        return;
    }
    if (input.length==0){
        AutofillResults.innerHTML="";
        return;
    } 
    //console.log(input);
    const valid_shrimps=getValidShrimps(input);
    let list_items=/**@type HTMLLIElement[]*/([])
    for (const shrimp of valid_shrimps){
        //console.log(Object.keys(shrimp));
        const pos=shrimp.pos;
        let list_item=document.createElement("li");
        list_items.push(list_item);
        list_item.appendChild(document.createTextNode(shrimp.name.slice(0, pos)));
        let found_segment=document.createElement("mark");
        found_segment.innerText=shrimp.name.slice(pos, pos+input.length);
        list_item.appendChild(found_segment);
        list_item.appendChild(document.createTextNode(shrimp.name.slice(pos+input.length)));
        if (ShowStats){
            const shrimp_stats=Game.shrimp_list[Game.shrimp_index_by_name[shrimp.name.toLowerCase()]];
            list_item.appendChild(document.createElement("br"));
            let shrimp_info=document.createElement("span");
            shrimp_info.classList.add("shrimp-info");
            list_item.append(shrimp_info);
            for (const key of Object.keys(shrimp_stats)){
                if (key=="name"){
                    continue;
                }
                shrimp_info.innerText+=getShrimpStat(shrimp_stats, key); 
                shrimp_info.innerText+=", ";
            }
        }
        let hidden_input_elem=document.createElement("input");
        list_item.appendChild(hidden_input_elem);
        hidden_input_elem.type="hidden";
        hidden_input_elem.value=shrimp.name;
    }
    //console.log(html_to_render);
    AutofillResults.innerHTML="";
    for (const item of list_items){ 
        AutofillResults.appendChild(item);
    }
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
let AutofillDisabled=0;
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
