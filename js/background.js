// add to manifest to enable background script if desired later:
// "background" : { "scripts" : ["background.js"] },
  
function updateIcon() {
  chrome.browserAction.setIcon({path:"../img/spin_orange.png"});
}
chrome.browserAction.onClicked.addListener(updateIcon);