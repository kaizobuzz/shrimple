function get_valid_autofill_results(input){
    var valid_shrimps=[];
    var i=0;
    shrimp_list_promise.then((shrimps) =>{
        let shrimp_list=shrimps.shrimps;
        console.log(shrimp_list);
        //console.log(shrimp_list["shrimps"]);
        while (i<shrimp_list.length){
            //console.log(input);
            let position=shrimp_list[i].name.search(input);
        //console.log(position);
            if (position != -1){
                valid_shrimps.push([shrimp_list[i].name, position]);
            }
            i++;
        } 
    })
    console.log(valid_shrimps);
    return valid_shrimps
}
async function get_shrimps() {
    response = await fetch("/shrimps");
    shrimps = await response.json();
    console.log(shrimps);
    return shrimps;
}
function autofill_shrimps(e) {
    let input=e.target.value;
    console.log(input);
    let valid_shrimps=get_valid_autofill_results(input);
    console.log(valid_shrimps);

}
let shrimp_list_promise=get_shrimps();
console.log(shrimp_list_promise);
document.getElementById("player-guess").addEventListener("input", autofill_shrimps);

