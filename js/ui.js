var api_key = undefined;

function getKey() {
    return api_key
}

function setKey(key) {
    api_key = key;
}

function getLoc(callback) {
    if (navigator.geolocation) {
        var opts = {timeout: 5000};        // 5 sec timeout
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat_lon = {geo: {lat: position.coords.latitude, lon: position.coords.longitude}};
            callback(lat_lon)
        }, function (error) {
            // Can't get location (permission denied or timed out)
            oab.debugLog(error.message);
            callback(null);
        }, opts);
    } else {
        // Browser does not support location
        oab.debugLog('GeoLocation is unsupported.');
        callback(null)
    }
}

function displayError(warning) {
    var warn_div = document.getElementById('error');
    warn_div.innerHTML = '<div class="alert alert-danger med-text" role="alert"></div>';
    warn_div.firstChild.textContent = warning;
}

function openOptions() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        // Reasonable fallback.
        window.open(chrome.runtime.getURL('auth.html'));
    }
}

function setButton(request_id, button_text, button_target, post_story) {
    var button = $('#submit');
    button.text(button_text);

    if (button_target && post_story) { // story and redirect, redirect after post made
        button.click(function() {
            $('#spin-greybox').visible = true;
            sendStory(id, function () {
                chrome.tabs.create({url: button_target});
                var pp = chrome.extension.getViews({type: 'popup'})[0];
                pp.close();
            });
        });
    } else if (post_story) { // story only; we need to tell the popup to close once it is sent
        button.click(function () {
            $('#spin-greybox').visible = true;
            sendStory(id, function () {
                var pp = chrome.extension.getViews({type: 'popup'})[0];
                pp.close();
            });
        });
    } else if (button_target) { // target only, just open tab when button is clicked
        button.click(function() {
            chrome.tabs.create({url: button_target})
        });
    }
}

function injectCheckbox(item) {
    $('#dynamic_content').children('form').append(item.type + ' <input type="checkbox" name="' + item.type + '" value="' + item.type + '"><br>');
}

function sendStory(request_id, callback) {

    // The data is the story from the page, plus the type they are interested in
    var data = {
        story: $('#story').value
        // types: list of types requested from the checkboxes
    };

    try {
        // Add location to data if possible
        getLoc(function (pos_obj) {
            if (pos_obj) {
                data['location'] = pos_obj;
            }
            oab.sendRequestPost(getKey(), request_id, data, handleRequestResponse, oab.handleAPIError);
            callback()
        });
    } catch (e) {
        oab.debugLog("A location error has occurred.");
        oab.sendRequestPost(getKey(), request_id, data, handleRequestResponse, oab.handleAPIError);
        callback()
    }
}

function handleAvailabilityResponse(response) {
    // The main extension logic - do different things depending on what the API returns about URL's status
    oab.debugLog('API response: ' + JSON.stringify(response.data));

    // Display the UI for the types that we can request
    if (response.data.availability.length > 0) {
        for (var availability_entry of response.data.availability) {
            // Show that this information is available
        }
    } else if (response.data.requests.length > 0) {
        for (var requests_entry of response.data.requests) {
            if (requests_entry.usupport) {
                // The user has supported the request
                break;
            }
            if (requests_entry.ucreated) {
                // The user created this request
                break;
            }

            // Otherwise, we ask for support for the request
            injectCheckbox(requests_entry);
        }
    } else if (response.data.accepts.length > 0) {
        $('#dynamic_content').append('Create a new request: what type of content would you like? <br><form></form>');
        for (var accepts_entry of response.data.accepts) {
            injectCheckbox(accepts_entry);
        }
        $('#story_div').collapse(false);
    } else {
        oab.debugLog("The API sent a misshapen response to our availability request.");
        displayError("Sorry, something went wrong with the API.")
    }
}

function handleRequestResponse(response) {
    // Take care of what we get back when we update a request
}

chrome.storage.local.get({api_key : ''}, function(items) {
    if (items.api_key == '') {
        // If there is no API Key available, prompt the user to add one via the options
        openOptions();
    } else {
        // Otherwise, we can check the status of the current tab's URL
        setKey(items.api_key);

        chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {

            // Check the status of the URL for the current tab
            oab.sendAvailabilityQuery(getKey(), tabs[0].url, handleAvailabilityResponse, oab.handleAPIError);
        });

        // Set up listeners for links and the story box

        $('#spin-greybox').visible = false;

        $('#why').click(function () {
            chrome.tabs.create({'url': "https://openaccessbutton.org/why"});
        });

        $('#bug').click(function () {
            if (chrome.runtime.getManifest()['version_name'].indexOf('firefox') >= 0) {
                chrome.tabs.create({'url': "https://openaccessbutton.org/firefox/bug"});
            } else {
                chrome.tabs.create({'url': "https://openaccessbutton.org/chrome/bug"});
            }
        });

        $('#logout').click(function () {
            chrome.storage.local.remove('api_key', openOptions)
        });

        $('#story').keyup(function () {
            var left = 85 - $(this).val().length;
            if (left < 0) {
                left = 0;
            }
            $('#counter').text(left);

            // the submit button is enabled when there are characters in the story box
            $('#submit').enabled = (left < 85);
        });
    }
});