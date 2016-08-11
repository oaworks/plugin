var api_key = undefined;

function get_key() {
    return api_key
}

function set_key(key) {
    api_key = key;
}

function get_loc(callback) {
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

function display_error(warning) {
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

function set_button(id, button_text, button_target, post_story) {
    //fixme: this could be much more efficient!
    var button = $('#submit');
    button.text(button_text);

    if (button_target && post_story) { // story and redirect, redirect after post made
        button.click(function() {
            $('#spin-greybox').visible = true;
            send_story(id, function () {
                chrome.tabs.create({url: button_target});
                var pp = chrome.extension.getViews({type: 'popup'})[0];
                pp.close();
            });
        });
    } else if (post_story) { // story only; we need to tell the popup to close once it is sent
        button.click(function () {
            // check we have an email before sending    //fixme: this should really be done by not activating the button
            if (document.getElementById('auth_email').value || !document.getElementById('article_title').value) {
                display_error("Please complete all fields!")
            } else {
                $('#spin-greybox').visible = true;
                send_story(id, function () {
                    var pp = chrome.extension.getViews({type: 'popup'})[0];
                    pp.close();
                });
            }
        });
    } else if (button_target) { // target only, just open tab when button is clicked
        button.click(function() {
            chrome.tabs.create({url: button_target})
        });
    }
}

function send_story(request_id, callback) {

    // The data is the story from the page, plus the type they are interested in
    var data = {
        story: $('#story').value
        // types:
    };

    try {
        // Add location to data if possible
        get_loc(function (pos_obj) {
            if (pos_obj) {
                data['location'] = pos_obj;
            }
            oab.request_post(get_key(), request_id, data, handle_request_response, oab.handle_api_error);
            callback()
        });
    } catch (e) {
        oab.debugLog("A location error has occurred.");
        oab.request_post(get_key(), request_id, data, handle_request_response, oab.handle_api_error);
        callback()
    }
}

function handle_availability_response(response) {
    // The main extension logic - do different things depending on what the API returns about URL's status
}

function handle_request_response(response) {
    // Take care of what we get back when we update a request
}

chrome.storage.local.get({api_key : ''}, function(items) {
    if (items.api_key == '') {
        // If there is no API Key available, prompt the user to add one via the options
        openOptions();
    } else {
        // Otherwise, we can check the status of the current tab's URL
        set_key(items.api_key);

        chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {

            // Get the URL for the current tab
            var active_tab = tabs[0].url;

            // Check the status of this URL
            oab.availability_query(get_key(), active_tab, handle_availability_response, oab.handle_api_error);
        }); //todo: why not chrome.tabs.getCurrent?

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