
function do_auth() {
  $('.dl').hide();
  chrome.storage.local.get({api_key : ''}, function(items) {
    if (items.api_key === '') {
      var key = document.getElementById('apikey').value;
      if ( key !== "") {
        chrome.storage.local.set({
          api_key: key
        }, function() {
          document.getElementById('plugin_messages').textContent = 'Your API key ' + key + 'has been saved to your plugin.';
        });
      } else {
        document.getElementById('plugin_messages').textContent = 'Your API key could not be found!';
      }
    } else {
      document.getElementById('plugin_messages').textContent = 'Your API key ' + items.api_key + 'is stored in your plugin.';
    }
  });

}

do_auth();