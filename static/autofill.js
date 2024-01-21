function get_valid_autofill_results(input, shrimp_list){
    var valid_shrimps=[];
    var i=0;
    //console.log(input);
    while (i<shrimp_list.length){
        let position=shrimp_list[i].name.search(input);
        //console.log(position);
        if (position != -1){
            valid_shrimps.push([shrimp_list[i], position]);
        }
    }
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
    let valid_shrimps=get_valid_autofill_results(input, shrimp_list);
    console.log(valid_shrimps);

}
shrimp_list=get_shrimps();
document.getElementById("player-guess").addEventListener("input", autofill_shrimps);

