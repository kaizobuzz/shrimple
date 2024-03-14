//@ts-check

let FinalResults=assertNotNull(document.getElementById("final-results"));
let FinalResultsText=assertNotNull(document.getElementById("final-results-text"));
let ShareButton=assertButtonElement(document.getElementById("share-results"));
let ClipboardMessage=assertNotNull(document.getElementById("clipboard-message"));
let CloseButton=assertButtonElement(document.getElementById("results-close"));
let OpenButton=assertButtonElement(document.getElementById("results-open"));
OpenButton.addEventListener("click", async function(){
    OpenButton.hidden=true;
    FinalResults.hidden=false;
    await sleep(0.05);
    FinalResults.style.opacity="1";
});
CloseButton.addEventListener("click", async function(){
    OpenButton.hidden=false;
    FinalResults.style.opacity="0";
    await sleep(0.5);
    FinalResults.hidden=true;
});
let ClipboardFunction=async function(){};
ShareButton.addEventListener("click", function(){
    ClipboardFunction();
});


