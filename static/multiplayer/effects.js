//@ts-check
const 
GuessStatHide=0, 
TimeLimitMinus=1,    
RequiredClick=2,
NoAutofill=3,  
ShrimpGarbage=4,
BombParty=5;

/**@param {string} name  */
async function displayEffectName(name){
    EffectNameDiv.innerHTML+="<p>"+name+"</p>";
    await sleep(2);
    EffectNameDiv.innerHTML="";
}
/**@param {number[]} effects  */
function renderEffects(effects){
    for (const effect of effects){
        console.log(effect);
        switch (effect){
            case GuessStatHide:
                NewEffects.push(new GameEffect(hideRandomFieldsOn, hideRandomFieldsOff, 4));
                displayEffectName("Guess Field Hide");
                //maybe duration to work around comment below for no autofill
                break;
            case TimeLimitMinus:
                NewEffects.push(new GameEffect(speedUpTimerOn, speedUpTimerOff, 4));
                displayEffectName("Reduced Time Limit");
                break;
            case RequiredClick:
                break;
            case NoAutofill:
                NewEffects.push(new GameEffect(
                    function(){AutofillDisabled=true}, 
                    function(){AutofillDisabled=false}, 
                    4));
                displayEffectName("No Autofill");
                //this is notable because it also disables showing stats initially so might have to do something about that
                break;
            case ShrimpGarbage:
                getShrimpGarbage();
                displayEffectName("Garbage Shrimp");
                break;
            case BombParty:
                startBombParty();
                displayEffectName("Bomb Party");
                break;
            default:
                console.error("unimplemented or invalid effect, effect num:", effect)
        }
    }
}

let EffectNameDiv=assertNotNull(document.getElementById("effect-name"));
let CurrentEffect;
