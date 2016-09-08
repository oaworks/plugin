
// look for an api key section on the account page and save it
// Saves auth info to chrome.storage.local
function do_auth() {
  // TODO - because the button must be installed and working for this to fire on the oab account page, we can hide anything on that page to do with installing the button
  var key = document.getElementById('apikey').value;
  if ( key !== "") {
    var status = document.getElementById('auth_feedback');

    // Check the API Key is valid
    oab.sendAuthQuery(key, function(resp) {
      //  success, Save the credentials to storage
      save_auth(key, function() {
        // Update status to let user know options were saved
        status.textContent = 'Credentials verified by server and saved.';
        setTimeout(function() {
          window.close();
        }, 2000);
      });
    }, function(resp) {
      // auth failure, tell the user
      status.textContent = 'Error: API Key could not be verified';
      var oldcolour = status.style.color;
      status.style.color = "red";
      setTimeout(function() {
        status.style.color = oldcolour;
        status.textContent = '';
      }, 2000);
    });
  }
}

setTimeout(function() {
  try {
    chrome.storage.local.get({api_key : ''}, function(items) {
      if (items.api_key === '') {
        do_auth();
      } else {
        document.getElementById('chromeinstall').style.display = 'none'; // hide the install button
      }
    });
  } catch (err) {}
}, 1000);

function save_auth(api_key, callback) {
  chrome.storage.local.set({
    api_key: api_key
  }, callback);
}

