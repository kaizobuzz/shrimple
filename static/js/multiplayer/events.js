//@ts-check

/**@typedef Message
 * @property {number} Type 
 * @property {string} Id
 * @property {string} Jsondata
*/
const JsonContentHeaderValue="application/json; charset=UFT-8"

/**
 * @readonly 
 * @enum {string}
 */ 
const ConflictReasons={
    DisplayNameTaken: "Display name taken",
    GameAlreadyStarted: "Game already started",
    GameNotStarted: "Game not started",
}
Object.freeze(ConflictReasons)
/**
 * @readonly 
 * @enum {number}
 */
const GuessStatus={ 
    Normal: 0,
    CorrectGuess: 1,
    OutOfGuesses: 2,
};
Object.freeze(GuessStatus)
/**
 * @readonly 
 * @enum {number}
 */
const MessageType={
    NewGuess: 0,
	NewEffect: 1,      
	PlayerList: 2,     
	PlayerDied: 3,     
	Join: 4,           
	Disconnect: 5,     
	Ready: 6,          
	Unready: 7,        
	GameStart: 8,      
	GetEvents: 9,      
	GetState: 10,       
	NoContent: 11,      
	RawText: 12,        
	NestedMessages: 13 
};
Object.freeze(MessageType);
const http={
    StatusConflict: 409,
    StatusGone: 410,
}
Object.freeze(http)
/**@typedef Guess 
 * @property {Number[]} Results
 * @property {Number} Status 
*/
/**@param {any} event 
 * @param {Number} message_type */
async function sendEvent(message_type, event){ 
    const message=/**@type Message */({
        Type: message_type,
        Id: CurrentKeyObject.playerkey,
        Jsondata: JSON.stringify(event),
    })
    const response=await fetch("/api/v1/sendevents", {
        method: "POST",
        body: JSON.stringify(message), 
        headers: {
           "Content-type": "application/json; charset=UFT-8" 
        } 
    })
    if (!response.ok){
        if (response.status==http.StatusConflict){

        } else if (response.status==http.StatusGone){
            
        } else{

        }
    }
}
/**@typedef Player 
 * @property {Guess[]} NewGuesses
 * @property {Number[]} NewEffects
*/
async function receiveEvents(){
    const response=await fetch("/api/v1/getevents");
    if (!response.ok){
    }
    const response_string=await response.text();
    const messages=/**@type Message[]*/(JSON.parse(response_string));   
    if (messages==null){
        return;
    }
    for (const message of messages){
        switch (message.Type){
            case MessageType.NewGuess:
                renderGuess(JSON.parse(message.Jsondata));
                break;
            case MessageType.NewEffect:
                renderEffects([JSON.parse(message.Jsondata)]);
                break;
            default:
                console.error("Invalid effect number ", message.Type)
        }
    }
}
let HtmxDiv=assertNotNull(document.getElementById("htmx-things"))
const startthing="Current effect set to "
addEventListener("keydown", function(e){
    switch (e.key){
        case "0":
            CurrentEffect=GuessStatHide;
            displayEffectName(startthing+"Guess Field Hide");
            break;
        case "1":
            CurrentEffect=TimeLimitMinus;
            displayEffectName(startthing+"Reduced Time Limit");
            break;
        case "2":
            CurrentEffect=NoAutofill;
            displayEffectName(startthing+"No Autofill");
            break;
        case "3":
            CurrentEffect=ShrimpGarbage;
            displayEffectName(startthing+"Shrimp Garbage");
            break;
        case "4":
            CurrentEffect=BombParty;
            displayEffectName(startthing+"Bomb Party");
            break;
        default:
            break;
    }
})
let PlayerId=""
