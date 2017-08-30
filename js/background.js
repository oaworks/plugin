
function updateIcon() {
  chrome.browserAction.setIcon({path:"../img/spin_orange.svg"});
}
chrome.browserAction.onClicked.addListener(updateIcon);