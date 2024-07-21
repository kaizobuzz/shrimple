//@ts-check
import {assertNotNull, Modes } from "../shared/utils.js";
import {getHistory} from  "../shared/localstorage.js";
import { renderBarNodes, renderBarNodeAnimation } from "../shared/display.js";

async function startDisplay(){
    let main_history_node=assertNotNull(document.getElementById("history-results"));
    for (const mode of Object.values(Modes)){
        let branch_node=document.createElement("div");
        branch_node.className="result-colour";
        branch_node.hidden=true;
        main_history_node.appendChild(branch_node);
        branch_node.appendChild(document.createTextNode(mode+" history"));
        const urlParams = new URLSearchParams(window.location.search);
        let history=await getHistory(mode, urlParams.get("userid"));
        if (history==null){
            branch_node.appendChild(document.createTextNode("guess history not available"));
            branch_node.hidden=false;
            continue;
        }
        let result=renderBarNodes(history, branch_node);
        let [history_nodes, lengths]=[result.nodes, result.lengths];
        branch_node.hidden=false;
        renderBarNodeAnimation(history_nodes, lengths);
        main_history_node.appendChild(document.createElement("br"));
    }
}
startDisplay()
