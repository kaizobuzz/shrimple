//@ts-check
export const LocalStorageString="settings";
export const SettingsTimeField="time";
/**@typedef {import('./privacy.js').PrivacySettings} PrivacySettings
 * @typedef Settings
 * @property {PrivacySettings} Privacy
 * */


function getCurrentMinute(){
    return Date.now()/(1000*60);
}
async function getSettingsFromServer(){
    const response=await fetch("/api/v1/getsettings")
    if (!response.ok){
        console.log(response);
    }
    const settings=await response.json(); 
    setSettingsLocalStorage(settings);
    return settings;
}

/**@returns {Promise<Settings>}*/
export async function getSettings(){
    const settings=window.sessionStorage.getItem(LocalStorageString);
    if (settings==null){
        return await getSettingsFromServer();
    }
    if ((settings[SettingsTimeField]-getCurrentMinute())>5){
        return await getSettingsFromServer();
    }
    return JSON.parse(settings);
}

/**@param {Settings} settings  */
export async function setSettings(settings){
    setSettingsLocalStorage(settings);
    settings[SettingsTimeField]=undefined;
    const response=await fetch("/api/v1/changesettings", {
        method: "POST",
        body: JSON.stringify(settings), 
        headers: {
           "Content-type": "application/json; charset=UFT-8" 
        } 
    })
    if (response.ok){
        console.log(response);
    }
}

/**@param {Settings} settings*/
function setSettingsLocalStorage(settings){
    settings[SettingsTimeField]=getCurrentMinute();
    window.sessionStorage.setItem(LocalStorageString, JSON.stringify(settings));
}
