
function do_auth() {
  document.getElementsByClassName('dl').style.display = 'none';
  chrome.storage.local.get({api_key : ''}, function(items) {
    if (items.api_key === '') {
      var key = document.getElementById('apikey').value;
      if ( key !== "") {
        chrome.storage.local.set({
          api_key: api_key
        }, function() {
          document.getElementById('plugin_messages').textContent = 'Your API key has been saved to your plugin.';
        });
      } else {
        document.getElementById('plugin_messages').textContent = 'Your API key could not be found!';        
      }
    } else {
      document.getElementById('plugin_messages').textContent = 'Your API key is already stored in your plugin.';
    }
  });

}

setTimeout(function() {
  do_auth();
}, 3000);

