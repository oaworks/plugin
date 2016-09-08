var api_key;

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

function openTabs(list_of_urls){
  for (var url of list_of_urls) {
    chrome.tabs.create({url: url, active: false})
  }
}

function setButton(button_text, button_targets, post_story) {
  var button = $('#submit');
  button.text(button_text);

  if (button_targets.length > 0 && post_story) { // story and redirect, redirect after post made
    button.click(function() {
      $('#spin-greybox').visible = true;
      sendStory(id, function () {
        openTabs(button_targets);
        var pp = chrome.extension.getViews({type: 'popup'})[0];
        pp.close();
      });
    });
  } else if (post_story) { // story only; we will get a reply informing what happens next
    button.click(function () {
      $('#spin-greybox').visible = true;
      sendStory(id, function () {
        $('#spin-greybox').visible = false;
      });
    });
  } else if (button_targets) { // target only, just open tabs when button is clicked
    button.click(function() {
      openTabs(button_targets);
      var pp = chrome.extension.getViews({type: 'popup'})[0];
      pp.close();
    });
  }
}

function injectParagraph(text) {
  $('#dynamic_content').children('form').append('<p>' + text + '</p>');
}

function injectCheckbox(label, val) {
  $('#dynamic_content').children('form').append('<input type="checkbox" name="' + val + '" value="' + val + '"> ' + label + '<br>');
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
      oab.sendRequestPost(api_key, request_id, data, handleRequestResponse, oab.handleAPIError);
      callback()
    });
  } catch (e) {
    oab.debugLog("A location error has occurred.");
    oab.sendRequestPost(api_key, request_id, data, handleRequestResponse, oab.handleAPIError);
    callback()
  }
}

function handleAvailabilityResponse(response) {
  // The main extension logic - do different things depending on what the API returns about URL's status
  oab.debugLog('API response: ' + JSON.stringify(response.data));

  // Change the UI depending on availability, existing requests, and the data types we can open new requests for.
  var urls = [];
  if (response.data.availability.length > 0) {
    for ( var i = 0; i < response.data.availability.length; i++ ) {
      $('#icon'+response.data.availability[i].type).css({'background-color':'green'});
      urls.push(response.data.availability[i].url);
    }
  } else if (response.data.requests.length > 0) {
    for (var requests_entry of response.data.requests) {
      $('#icon'+requests_entry.type).css({'background-color':'yellow'});
      if (requests_entry.usupport || requests_entry.ucreated) {
        urls.push(oab.site_address+'/request/'+requests_entry._id);
      } else {
        injectCheckbox('Add your support for the ' + requests_entry.type, requests_entry.type);
        $('#story_div').removeClass('collapse');
      }
    }
  } else if (response.data.accepts.length > 0) {
    for (var accepts_entry of response.data.accepts) {
      $('#icon'+accepts_entry.type).css({'background-color':'red'});
      injectCheckbox('Start a request for the ' + accepts_entry.type, accepts_entry.type);
    }
    $('#story_div').removeClass('collapse');
  } else {
    oab.debugLog("The API sent a misshapen response to our availability request.");
    displayError("Sorry, something went wrong with the API.")
  }
  if (urls.length) openTabs(urls);
  // todo: set the button text and function by reading the form and using setButton()
}

function handleRequestResponse(response) {
  // Take care of what we get back when we update a request
  /*
   Response will confirm request(s) have been created, and provide the IDs for them
   Then plugin should say thanks, and show links to the open requests, and urge user to go and view them and take more action
   */
}


// This is run when the extension loads
try {
  chrome.storage.local.get({api_key : ''}, function(items) {
    if (items.api_key === '') {
      // no api key, user can only do availability requests - set something on the UI to indicate this
    } else {
      api_key = items.api_key;
    }
  });
} catch (err) {
  // no api key, user can only do availability requests - set something on the UI to indicate this
}

try {
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    // Check the status of the URL for the current tab
    oab.debugLog('Sending availability query via chrome tabs for URL ' + window.location.href)
    oab.sendAvailabilityQuery(tabs[0].url, handleAvailabilityResponse, oab.handleAPIError);
  });
} catch (err) {
  // for testing it is useful to send this based on page
  oab.debugLog('Sending availability query direct from within test page')
  oab.sendAvailabilityQuery(window.location.href, handleAvailabilityResponse, oab.handleAPIError);
}

// Set up listeners for links and the story box
$('#spin-greybox').visible = false;

$('#bug').click(function () {
  chrome.tabs.create({'url': oab.site_address + "/bugs"});
});

$('#logout').click(function () {
  chrome.storage.local.remove('api_key')
});

$('#story').keyup(function () {
  var length = $(this).val().replace(/  +/g,' ').split(' ').length;
  var left = 25 - length;
  if (left < 0) {
    left = 0;
  }
  if (length === 0) $('#submit').html('Tell us your story in up to <br><span id="counter">25</span> words to support this request').css({'background-color':'#f04717'}); 
  if (length <= 5) $('#submit').html('Tell us your story with up to <span id="counter"></span><br> more words to support this request').css({'background-color':'#f04717'}); 
  left < 25 && length > 5 ? $('#submit').removeAttr('disabled') : $('#submit').attr('disabled',true); 
  if (length > 5 && length <= 10) $('#submit').html('Great, <span id="counter"></span> words remaining!<br>Write 5 more?').css({'background-color':'#ffff66'}); 
  if (length > 10 && length <= 20) $('#submit').html('<span id="counter"></span> words left! Or click to submit<br>now and create your request!').css({'background-color':'#99ff99'}); 
  if (length > 20) $('#submit').html('<span id="counter"></span>... Click now to submit your<br>story and create your request').css({'background-color':'#99ff99'}); 
  $('#counter').text(left);
});


