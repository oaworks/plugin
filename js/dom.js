var port = chrome.runtime.connect({name:"main.js"});
port.onMessage.addListener(function(message,sender,sendResponse) {
  console.log('getting a msg')
  if (message.text === "dom") {
    sendResponse('HELLO');
  }
});

/*chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  console.log('getting a msg ' + msg.text);
  if (msg.text === 'gimme') {
    sendResponse('HELLO');
    //sendResponse(document.all[0].outerHTML);
  }
});8?*/