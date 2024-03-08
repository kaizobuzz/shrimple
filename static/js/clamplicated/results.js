async function copyClamplicatedResults(){
    console.log("?");
    let result=Game.won ? Game.num_guesses : "X"; 
    let text_to_copy="Daily Shrimple: Clamplicated mode "+result+"/"+MAX_GUESSES+"\n"+Game.guesses.join("\n");
    navigator.clipboard.writeText(text_to_copy);
    ClipboardMessage.style.opacity=String(1);
    await sleep(1);
    ClipboardMessage.style.opacity=String(0);
}
