//@ts-check
//
import { sleep } from "./utils.js"
/**@typedef BarNodeReturn
 *@property {HTMLDivElement[]} nodes 
 *@property {number[]} lengths*/
/**@param {number[]} history  
 * @param {HTMLElement} base_node 
 * @returns {BarNodeReturn} */
export function renderBarNodes(history, base_node){
    const sum=history.reduce(function(sum, number){return sum+number}, 0) 
    const base_lengths=history.map(function(number){return (number/sum)*100})
    const maximum_base_length=Math.max(...base_lengths);
    const modifier = Math.max(1, Math.min(3, (100/maximum_base_length)/1.5));
    const lengths=history.map(function(number){return Math.floor(number*modifier)})
    let history_bar_nodes=/**@type HTMLDivElement[]*/([])
    for (let i=0; i<history.length; i++){
        let history_node=document.createElement("div");
        history_node.classList.add("row-no-wrap");
        base_node.appendChild(history_node);
        let history_num_node=document.createElement("p"); 
        history_num_node.classList.add("main-flex");
        history_num_node.innerText=String(i+1);
        history_node.appendChild(history_num_node)
        let history_bar_node_container=document.createElement("div");
        history_bar_node_container.classList.add("container-size");
        history_bar_node_container.classList.add("main-flex");
        history_node.appendChild(history_bar_node_container);
        let history_bar_node=document.createElement("div");
        history_bar_nodes.push(history_bar_node);
        history_bar_node_container.appendChild(history_bar_node);
        history_bar_node.classList.add("history-item");
        let count_history_node=document.createElement("p");
        history_node.appendChild(count_history_node);
        count_history_node.classList.add("float-right");
        count_history_node.classList.add("main-flex");
        count_history_node.innerText=String(history[i]);
    }
    return {nodes: history_bar_nodes, lengths: lengths}
}
/**@param {HTMLDivElement[]} history_bar_nodes 
 * @param {Number[]} lengths  */
export async function renderBarNodeAnimation(history_bar_nodes, lengths){
    await sleep(0.1);
    for (let i=0; i<history_bar_nodes.length; i++)
        history_bar_nodes[i].style.width=String(lengths[i])+"%";{
    }
}

