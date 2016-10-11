
var foundkey;

function save_auth() {
  chrome.storage.local.set({
    api_key: foundkey
  }, function() {
    document.getElementById('plugin_messages').innerHTML = '<div class="alert alert-action"><p>Your API key ' + foundkey + 'has been saved to your plugin.</p></div>';
  });
}

function do_auth() {
  document.getElementById('plugin_messages').innerHTML = '<div class="alert alert-action"><p>You have your plugin installed! Just checking your API key is set for you...</p></div>';
  document.getElementById('chromeinstall').style.display = 'none';
  chrome.storage.local.get({api_key : ''}, function(items) {
    foundkey = document.getElementById('apikey').innerHTML;
    if (items.api_key === '') {
      if ( foundkey ) {
        save_auth();
      } else {
        document.getElementById('plugin_messages').innerHTML = '<div class="alert alert-action"><p>Your API key could not be found!</p></div>';
      }
    } else if ( foundkey && foundkey !== items.api_key ) {
      var html = '<div class="alert alert-action"><p>Your API key appears to have been changed.<br>Do you want to save the new API key ' + foundkey + ' into your plugin?</p>';
      html += '<p><button id="update_key" class="btn btn-action" style="border:1px solid white;margin-top:5px;">Yes, save the new API key to my plugin!</button></p>';
      html += '</div>';
      document.getElementById('plugin_messages').innerHTML = html;
      document.getElementById('update_key').onclick = save_auth;
    } else {
      document.getElementById('plugin_messages').innerHTML = '<div class="alert alert-action"><p>Your API key ' + items.api_key + ' is stored in your plugin.</p></div>';
    }
  });

}

setTimeout(do_auth,2000);
setInterval(do_auth,5000);