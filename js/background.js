function updateIcon() {
  chrome.browserAction.setIcon({path:"../img/spin_orange.png"});
}
chrome.browserAction.onClicked.addListener(updateIcon);
updateIcon();