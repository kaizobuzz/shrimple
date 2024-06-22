//@ts-check
/** @param {string} mode 
 * @param {string|undefined} userid 
 * @returns {Promise<number[]|null>}*/
async function getHistory(mode, userid){ 
    const response=await fetch("/api/v1/getguesshistoryentry", {
        method: "POST",
        body: JSON.stringify(
        {GameMode: mode, 
        UserId: userid??""}), 
        headers: {
           "Content-type": "application/json; charset=UFT-8" 
        }
    });
    if (response.ok){
        const guess_history=await response.json();
        const guess_history_array=Array(MAX_GUESSES).fill(0);
        for (let i=0; i<guess_history_array.length; i++){
            guess_history_array[i]=guess_history[i+1]??0;
        }
        return guess_history_array;
    }
    
    if (userid==undefined){
        let history_string=localStorage.getItem("guess_history"+mode);
        let history=/**@type Number[]*/(history_string!=null ? JSON.parse(history_string) : Array(MAX_GUESSES).fill(0));
        localStorage.setItem("guess_history"+mode, JSON.stringify(history));
        return history;
    } else{
        return null;
    }
}



