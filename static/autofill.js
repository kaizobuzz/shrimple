function autofill_shrimps(e) {
    let input=e.target.value.toLowerCase();
    var search_results=document.getElementById('autofill-results');
    console.log(input);
    var valid_shrimps=[];
    if (input.length==0){
        search_results.innerHTML="";
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
    console.log(valid_shrimps);
    console.log(valid_shrimps.length);
    var html_to_render="";
    for (index in valid_shrimps){
        let shrimp=valid_shrimps[index];
        console.log(Object.keys(shrimp));
        pos=shrimp.pos;
        html_to_render+=
            "<li> "+
            shrimp.name.slice(0, pos)+
            "<mark>"+shrimp.name.slice(pos, pos+input.length)+"</mark>"+
            shrimp.name.slice(pos+input.length)+
            " <input type=hidden value="+shrimp.name+"/>"+
            " </li>";
    }
    console.log(html_to_render);
    search_results.innerHTML=html_to_render;
}
function use_autofill(e){
    console.log(e.target.value);
}
async function get_shrimps() {
    response = await fetch("/shrimps");
    shrimps = await response.json();
    console.log(shrimps);
    return shrimps;
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
console.log(shrimp_list_promise);
document.getElementById("player-guess").addEventListener("input", autofill_shrimps);
document.getElementById("autofill-results").addEventListener("click", use_autofill); 
