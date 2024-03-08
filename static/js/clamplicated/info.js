async function checkIfUseClamplicatedInfo(){
    await sleep(0.2);
    if (mode=="clamplicated"){
        ClamplicatedInfo.hidden=false;
    }
}
let ClamplicatedInfo=document.getElementById("clam-mode-info");
checkIfUseClamplicatedInfo();

