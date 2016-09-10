
function do_auth() {
  document.getElementsByClassName('dl').style.display = 'none';
  var key = document.getElementById('apikey').value;
  if ( key !== "") {
    /*chrome.runtime.sendMessage({api_key: api_key}, function(response) {
      console.log('API key messaged to plugin');
    });*/
    chrome.storage.local.set({
      api_key: api_key
    }, function() {
      var status = document.getElementById('plugin_messages');
      status.textContent = 'Your API key has been saved to your plugin.';
    });
  }
}

setTimeout(function() {
  try {
    chrome.storage.local.get({api_key : ''}, function(items) {
      if (items.api_key === '') do_auth();
    });
  } catch (err) {}
}, 1000);

