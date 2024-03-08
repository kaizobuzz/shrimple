//@ts-check
async function copyToClipboard(){
    let text_to_copy="Shrimple endless: "+String(CorrectGuesses)+" guesses gotten";
    navigator.clipboard.writeText(text_to_copy);
    ClipboardMessage.style.opacity=String(1);
    await sleep(1);
    ClipboardMessage.style.opacity=String(0);
}

function outOfLives(){
    Game.active=false;
    FinalResultsText.innerText="You got "+String(CorrectGuesses)+" guesses before losing all your lives"; 
    FinalResults.hidden=false;
    ShareButton.disabled=false;
}
ClipboardFunction=copyToClipboard;
