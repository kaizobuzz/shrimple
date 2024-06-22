//@ts-check
/**@param {string} request  */
async function checkAuth(request){
    let response= await fetch(request);
    if (response.redirected){
        window.location.href=response.url;
    }
}
checkAuth("/api/v1/checkauth");
