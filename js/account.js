
var foundkey;

function save_auth(key) {
  if (key === undefined) key = foundkey;
  if (key === undefined) {
    console.log('Could not find key to save...');
  } else {
    chrome.storage.local.set({
      api_key: key
    }, function() {
      document.getElementById('plugin_messages').innerHTML = '<div class="alert alert-info"><p>Your API key ' + key + 'has been saved to your plugin.</p></div>';
    });
  }
}

function do_auth() {
  document.getElementById('chromeinstall').style.display = 'none';
  chrome.storage.local.get({api_key : ''}, function(items) {
    foundkey = document.getElementById('apikey').innerHTML;
    if (items.api_key === '') {
      if ( foundkey ) {
        save_auth(foundkey);
      } else {
        document.getElementById('plugin_messages').innerHTML = '<div class="alert alert-info"><p>Your API key could not be found!</p></div>';
      }
    } else if ( foundkey !== items.api_key ) {
      var html = '<div class="alert alert-info"><p>Your API key appears to have been changed.<br>Do you want to save the new API key ' + foundkey + ' into your plugin?</p>';
      html += '<p><button id="update_key" class="btn btn-action" style="border:1px solid white;margin-top:5px;">Yes, save the new API key to my plugin!</button></p>';
      html += '</div>';
      document.getElementById('plugin_messages').innerHTML = html;
      document.getElementById('update_key').onclick = save_auth;
    } else {
      document.getElementById('plugin_messages').innerHTML = '<div class="alert alert-info"><p>Your API key ' + items.api_key + ' is stored in your plugin.</p></div>';
    }
  });

}

do_auth();