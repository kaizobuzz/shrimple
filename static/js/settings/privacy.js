//@ts-check

import {assertButtonElement, assertInputElement, assertNotNull} from "../shared/utils.js";
import { getSettings, setSettings } from "./localstorage.js";

/** @typedef PagePrivacySettings
 * @property {number} ViewUserInfo 
 * @property {boolean} ViewGuessHistory 	
 * @property {boolean} ViewExperience   
 */
/** 
 * @typedef PrivacySettings
 * @property {number} AllowReceivingFriendRequests
 * @property {boolean} AllowBeingSearched
 * @property {boolean} ShowOnLeaderboard
 * @property {PagePrivacySettings} Page
*/

/**
 * @readonly 
 * @enum {number}
 */
const Privacy={ 
    Private: 0,
    FriendsOnly: 1,
    Unlisted: 2,
    Public: 3,
};
const PrivacyStrings={ 
    Private: "Private",
    FriendsOnly: "FriendsOnly",
    Unlisted: "Unlisted",
    Public: "Public",
};
Object.freeze(Privacy);
Object.freeze(PrivacyStrings);

/**
 * @readonly 
 * @enum {number}
 */
const Searching={
    None: 0,
    IdOnly: 1,
    Name: 2,
};
const SearchingStrings={
    None: "None",
    IdOnly: "IdOnly",
    Name: "Name",
};

Object.freeze(Searching);
Object.freeze(SearchingStrings);

async function getPrivacySettings(){
    const full_settings=await getSettings()
    const settings=full_settings.Privacy;

    if (settings.AllowReceivingFriendRequests==Searching.None){
        allow_friend_requests.value=SearchingStrings.None;    
    } else if (settings.AllowReceivingFriendRequests==Searching.IdOnly){
        allow_friend_requests.value=SearchingStrings.IdOnly;
    } else{
        allow_friend_requests.value=SearchingStrings.Name;
    }

    if (settings.ShowOnLeaderboard){
        show_on_leaderboard.checked=true;
    } else {
        show_on_leaderboard.checked=false;
    }

    if (settings.Page.ViewUserInfo==Privacy.Private){
        view_user_info.value=PrivacyStrings.Private; //TODO should this disable other things?
    } else if (settings.Page.ViewUserInfo==Privacy.FriendsOnly){
        view_user_info.value=PrivacyStrings.FriendsOnly;
    } else if (settings.Page.ViewUserInfo==Privacy.Unlisted){
        view_user_info.value=PrivacyStrings.Unlisted;
    } else if (settings.Page.ViewUserInfo==Privacy.Public){
        view_user_info.value=PrivacyStrings.Public;
    }

    if (settings.AllowBeingSearched){
        allow_being_searched.checked=true;
    } else{
        allow_being_searched.checked=false;
    }

    if (settings.Page.ViewGuessHistory){
        show_guess_history.checked=true;
    } else{
        show_guess_history.checked=false;
    }

    settings_flex.hidden=false;
}

async function setPrivacySettings(){
    const settings=await getSettings();
    settings.Privacy={
        AllowReceivingFriendRequests: Searching[allow_friend_requests.value],
        ShowOnLeaderboard: show_on_leaderboard.checked,
        AllowBeingSearched: allow_being_searched.checked,
        Page: {
            ViewUserInfo: Privacy[view_user_info.value],
            ViewGuessHistory: show_guess_history.checked,
            ViewExperience: show_experience.checked, 
        }
        
    };
    await setSettings(settings); 
}
//<button class="main-buttons" id="save-settings">Save settings</button>

assertButtonElement(document.getElementById("save-settings")).addEventListener("click", setPrivacySettings);
const allow_friend_requests=/**@type HTMLSelectElement*/(document.getElementById("allow-friend-requests"));
const allow_being_searched = assertInputElement(document.getElementById("allow-being-searched"))
const show_on_leaderboard = assertInputElement(document.getElementById("show-on-leaderboard"));
const view_user_info =/**@type HTMLSelectElement*/(document.getElementById("view-user-info"));
const show_guess_history = assertInputElement(document.getElementById("show-guess-history"));
const show_experience = assertInputElement(document.getElementById("show-experience"));
const settings_flex=assertNotNull(document.getElementById("settings-flex"));
getPrivacySettings();

