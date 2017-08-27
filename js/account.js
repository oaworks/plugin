
var foundkey;

function save_auth() {
  chrome.storage.local.set({
    api_key: foundkey
  }, function() {
    document.getElementById('plugin_messages').innerHTML = '<div class="alert alert-action"><p>Your plugin is ready to use!</p></div>';
  });
}

function do_auth() {
  document.getElementById('plugin_messages').innerHTML = '<div class="alert alert-action"><p>Your plugin is installed! Just associating it to your account for you...</p></div>';
  document.getElementById('chromeinstall').style.display = 'none';
  chrome.storage.local.get({api_key : ''}, function(items) {
    foundkey = document.getElementById('apikey').innerHTML;
    if (items.api_key === '') {
      if ( foundkey ) {
        save_auth();
      } else {
        document.getElementById('plugin_messages').innerHTML = '<div class="alert alert-action"><p>We couldn\'t connect your account and plugin, something is up. Email help@openaccessbutton.org</p></div>';
      }
    } else if ( foundkey && foundkey !== items.api_key ) {
      var html = '<div class="alert alert-action"><p>The account associated with your installed plugin isn\'t the same as this account, do you want to change it?</p>';
      html += '<p><button id="update_key" class="btn btn-action" style="border:1px solid white;margin-top:5px;">Yes, connect this account to my plugin!</button></p>';
      html += '</div>';
      document.getElementById('plugin_messages').innerHTML = html;
      document.getElementById('update_key').onclick = save_auth;
    } else {
      document.getElementById('plugin_messages').innerHTML = '<div class="alert alert-action"><p>Your plugin is ready to use!</p></div>';
    }
  });

}

setTimeout(do_auth,2000);
setInterval(do_auth,5000);
