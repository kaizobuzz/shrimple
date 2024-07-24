//@ts-check
import { assertNotNull, assertInputElement, assertButtonElement } from "../shared/utils.js";


/**@typedef UsernameIdPair
 * @prop {string} Id,
 * @prop {string} Username,
 * */

async function getFriends(){
    FriendsList.innerHTML="";
    const response = await fetch("/api/v1/getfriends")
    if (!response.ok){
        console.error(response);
    }
    const friends=/**@type UsernameIdPair[]*/(await response.json());
    for (const friend of friends){
        const node=document.createElement("li");
        const link=document.createElement("a");
        link.className="soft-links";
        link.innerText=friend.Username;
        link.href="/userinfo.html?userid="+friend.Id;
        node.append(link);
        FriendsList.append(node);
    }
}

async function getIncomingFriendRequests(){
    const response = await fetch("/api/v1/getfriendrequests")
    if (!response.ok){
        console.error(response);
    }
    const friend_requests=/**@type UsernameIdPair[]*/(await response.json());
    for (const friend_request of friend_requests){
        const node=document.createElement("li");
        node.innerText=friend_request.Username;
        const accept_button=document.createElement("button");
        accept_button.innerText="✓";
        accept_button.onclick = async function(){
            const accept_response=await fetch("/api/v1/acceptfriendrequest", {
                method: "POST",
                body: JSON.stringify(friend_request.Id), 
                headers: {
                    "Content-type": "application/json; charset=UFT-8" 
                }
            });
            if (accept_response.ok){
                node.remove();
                getFriends()
                //TODO display error relative to li probably
            } else{
            }
        };
        const reject_button = document.createElement("button");
        reject_button.innerText="x";
        reject_button.onclick = async function(){
            const reject_response=await fetch("/api/v1/declinefriendrequest", {
                method: "POST",
                body: JSON.stringify(friend_request.Id), 
                headers: {
                    "Content-type": "application/json; charset=UFT-8" 
                }
            });
            if (reject_response.ok){
                document.removeChild(node);
                //TODO display error relative to li probably
            } else{
            }
        };
        node.append(accept_button);
        node.append(reject_button);


        FriendRequestsList.append(node);
    }
}

async function getOutgoingFriendRequests(){
    const response = await fetch("/api/v1/getoutgoingfriendrequests")
    if (!response.ok){
    }
    const friend_requests=/**@type UsernameIdPair[]*/(await response.json());
    for (const friend_request of friend_requests){
        const node=document.createElement("li");
        node.innerText=friend_request.Username;
        OutgoingFriendRequestsList.append(node);
    }
}
async function sendFriendRequest(){
    const response=await fetch("/api/v1/sendfriendrequest", {
        method: "POST",
        body: JSON.stringify(FriendRequestInput.value), 
        headers: {
            "Content-type": "application/json; charset=UFT-8" 
        }
    });
    if (response.ok){
        getOutgoingFriendRequests();
    } else{
        //TODO
    }
}


const FriendsList=assertNotNull(document.getElementById("friends-list"));
const FriendRequestsList=assertNotNull(document.getElementById("current-friend-requests"));
const OutgoingFriendRequestsList=assertNotNull(document.getElementById("outgoing-friend-requests"));

const FriendRequestInput=assertInputElement(document.getElementById("friend-request-input"));
const FriendRequestSubmit=assertButtonElement(document.getElementById("friend-request-submit"));
FriendRequestSubmit.onclick=sendFriendRequest;
FriendRequestInput.addEventListener("keydown", function(e){
    if (e.key=="Enter"){
        if (!FriendRequestSubmit.disabled){
            sendFriendRequest();
        }
    }
});
FriendRequestInput.addEventListener("input", function(){
    if (FriendRequestInput.value.length==0){
        FriendRequestSubmit.disabled=true;
    } else{
        FriendRequestSubmit.disabled=false;
    }
});
    



getFriends();
getIncomingFriendRequests();
getOutgoingFriendRequests();
