//@ts-check
const 
GuessStatHide=0, 
TimeLimitMinus=1,    
RequiredClick=2,
NoAutofill=3,  
ShrimpGarbage=4,
BombParty=5;
class GameEffect{
    /** 
     * @param {Function} start_function 
     * @param {Function} end_function 
     * @param {number} duration_guesses 
    */
    constructor(start_function, end_function, duration_guesses){
        /**@type {Function} start_function*/
        this.start_function=start_function;
        /**@type {Function} end_function*/
        this.end_function=end_function;
        /**@type {number} duration_guesses*/
        this.duration_guesses=duration_guesses;
    }
}

let EffectDuration={
    GuessStatHide: 4,
    TimeLimitMinus: 4, 
    NoAutofill: 4,
}
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
                NewEffects.push(new GameEffect(
                    hideRandomFieldsOn, 
                    hideRandomFieldsOff, 
                    EffectDuration.GuessStatHide));
                displayEffectName("Guess Field Hide");
                //maybe duration to work around comment below for no autofill
                break;
            case TimeLimitMinus:
                NewEffects.push(new GameEffect(speedUpTimerOn, speedUpTimerOff, EffectDuration.TimeLimitMinus));
                displayEffectName("Reduced Time Limit");
                break;
            case RequiredClick:
                break;
            case NoAutofill:
                NewEffects.push(new GameEffect(
                    function(){AutofillDisabled+=1}, 
                    function(){AutofillDisabled-=1}, 
                    EffectDuration.NoAutofill));
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
/**@type GameEffect[]*/
let NewEffects=[];
/**@type GameEffect[]*/
let CurrentEffects=[];

let EffectNameDiv=assertNotNull(document.getElementById("effect-name"));
let CurrentEffect=GuessStatHide;

