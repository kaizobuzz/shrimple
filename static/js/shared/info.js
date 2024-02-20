//@ts-check
let StartInfoCloseButton=assertButtonElement(document.getElementById("start-info-close"));
let StartInfo=assertNotNull(document.getElementById("start-info"));
let StartInfoOpenButton=assertButtonElement(document.getElementById("start-info-open"));
StartInfoCloseButton.addEventListener("click", async function(){
    StartInfo.style.opacity="0%";
    await sleep(0.5);
    StartInfo.hidden=true;
});
StartInfoOpenButton.addEventListener("click", async function(){
    StartInfo.hidden=false;
    await sleep(0.1);
    StartInfo.style.opacity="100%";
});

