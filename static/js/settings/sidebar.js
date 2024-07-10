//@ts-check
async function getSidebar(){
    const response=await fetch("/settings/sidebar.html");
    const html = await response.text();
    sidebar.innerHTML=html;
}
const sidebar=assertNotNull(document.getElementById("sidebar-flex"));
getSidebar();
