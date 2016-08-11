// JS for the options / auth page.

// Saves auth info to chrome.storage.local
function do_auth() {
    var key = document.getElementById('api_key_field').value;

    if ( key != "") {
        var status = document.getElementById('auth_feedback');
        
        // Check the API Key is valid
        oab.auth_query(key, function(resp) {

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
    } else {
        // Clear the fields to empty data from storage and api key from memory
        chrome.storage.local.clear();
        localStorage.clear();
        api_key = undefined;
    }
}

function save_auth(api_key, callback) {
    chrome.storage.local.set({
        api_key: api_key
    }, callback);
}

// Populates options fields from stored values
function restore_auth() {
    chrome.storage.local.get({
        api_key: ''
    }, function(items) {
        document.getElementById('api_key_field').value = items.api_key;
    });
}

// When the window opens, restore the stored API Key
document.addEventListener('DOMContentLoaded', restore_auth);

// When the submit button is clicked, perform the auth steps
document.getElementById('submit_auth').addEventListener('click', do_auth);

// When the link to create an account is clicked, open a tab for it.
document.getElementById('register').addEventListener('click', function () {
    chrome.tabs.create({'url': oab.register_address});
});