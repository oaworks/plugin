
function save_auth(key) {
  chrome.storage.local.set({
    api_key: key
  }, function() {
    document.getElementById('plugin_messages').innerHTML = '<div class="alert alert-info"><p>Your API key ' + key + 'has been saved to your plugin.</p></div>';
  });
}

function do_auth() {
  document.getElementById('chromeinstall').style.display = 'none';
  chrome.storage.local.get({api_key : ''}, function(items) {
    var key = document.getElementById('apikey').innerHTML;
    if (items.api_key === '') {
      if ( key !== "") {
        save_auth(key);
      } else {
        document.getElementById('plugin_messages').innerHTML = '<div class="alert alert-info"><p>Your API key could not be found!</p></div>';
      }
    } else if ( key !== items.api_key ) {
      var html = '<div class="alert alert-info"><p>Your API key appears to have been changed. Do you want to save the new API key ' + key + ' into your plugin?</p>';
      html += '<p><button class="btn" onclick="save_auth(' + key + ')">Yes, save the new API key to my plugin!</button></p>';
      html += '</div>';
      document.getElementById('plugin_messages').innerHTML = html;
    } else {
      document.getElementById('plugin_messages').innerHTML = '<div class="alert alert-info"><p>Your API key ' + items.api_key + ' is stored in your plugin.</p></div>';
    }
  });

}

do_auth();