// JS for the options / auth page.

// Saves auth info to chrome.storage.local
function do_auth() {
    var key = document.getElementById('api_key_field').value;

    if ( key != "") {
        var status = document.getElementById('auth_feedback');
        
        // Check the API Key is valid
        var api_request = '/blocked';
        data = {
            'api_key': key
        };
        oab.api_request(api_request, data, 'accounts', function(resp) {

            //  success, Save the credentials to storage
            save_auth(key, function() {
                // Update status to let user know options were saved
                status.textContent = 'Credentials verified by server and saved.';
                setTimeout(function() {
                    window.close();
                }, 2000);
                chrome.runtime.sendMessage({key_verified: true});
            });

        }, function(resp) {
            // auth failure, tell the user
            status.textContent = 'Error: credentials could not be verified';

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

document.addEventListener('DOMContentLoaded', restore_auth);
document.getElementById('submit_auth').addEventListener('click', do_auth);