chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.text === 'gimme') {
    sendResponse(document.all[0].outerHTML);
  }
});