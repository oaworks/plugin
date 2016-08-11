// Handle the installer page - tell the page it's installed and receive the API key

var isInstalledNode = document.createElement('div');
isInstalledNode.id = 'oabutton-is-installed';
document.body.appendChild(isInstalledNode);

//var port = chrome.runtime.connect();

window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
        return;

    if (event.data.type && (event.data.type == "from_oabutton_install_page")) {
        console.log("Content script received: " + event.data.api_key);
        //port.postMessage(event.data.text);
    }
}, false);