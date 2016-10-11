//document.all[0].outerHTML
function get_dom() {
  chrome.storage.local.set({dom: "HELLO" });
}

//setTimeout(get_dom,6000);
