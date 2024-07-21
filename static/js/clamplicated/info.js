//@ts-check
import { sleep, getMode, assertNotNull } from "../shared/utils.js";

export async function checkIfUseClamplicatedInfo(){
    await sleep(0.1);
    if (getMode()=="clamplicated"){
        ClamplicatedInfo.hidden=false;
    }
}
let ClamplicatedInfo=assertNotNull(document.getElementById("clam-mode-info"));

//TODO this doesn't work like that
