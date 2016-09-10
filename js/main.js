var api_key;
var page_url;

function handleAvailabilityResponse(response) {
  // The main extension logic - do different things depending on what the API returns about URL's status
  oab.debugLog('API response: ' + JSON.stringify(response.data));
  
  // Change the UI depending on availability, existing requests, and the data types we can open new requests for.
  if (response.data.availability.length > 0) {
    for ( var i = 0; i < response.data.availability.length; i++ ) {
      $('#icon'+response.data.availability[i].type).css({'background-color':'green'});
      $('#icon'+response.data.availability[i].type+'button').attr('href',response.data.availability[i].url);
    }
  } else if (response.data.requests.length > 0) {
    for (var requests_entry of response.data.requests) {
      $('#icon'+requests_entry.type).css({'background-color':'yellow'});
      if (requests_entry.usupport || requests_entry.ucreated) {
        $('#icon'+requests_entry.type+'button').attr('href',oab.site_address+'/request/'+requests_entry._id);
      } else {
        $('#icon'+requests_entry.type+'button').attr('data-action','support');
        $('#submit').attr('data-action','support');
        $('#submit').attr('data-support',requests_entry._id);
      }
    }
  } else if (response.data.accepts.length > 0) {
    for (var accepts_entry of response.data.accepts) {
      $('#icon'+accepts_entry.type).css({'background-color':'red'});
      $('#icon'+accepts_entry.type+'button').attr('data-action','create');
      $('#submit').attr('data-action','create');
    }
  } else {
    oab.debugLog("The API sent a misshapen response to our availability request.");
    oab.displayMessage("Sorry, something went wrong with the API.")
  }
}

function handleRequestResponse(response) {
  $('#story_div').addClass('collapse');
  $('#story').val("");
  var url = oab.site_address + '/request/' + response._id;
  var msg = "<p>Thanks very much for ";
  msg += $('#submit').attr('data-action') === 'create' ? 'creat' : 'support';
  msg += "ing this request!</p>";
  msg += "<p>Please take a moment to go and view the request, and provide any additional support that you can.</p>"
  msg += '<p>We have opened it up in a new tab for you. If your browser blocked it, you can open it <a class="label label-info" target="_blank" href="' + url + '">here</a>';
  $('#message').html(msg);
  try {
    chrome.tabs.create({url: url, active: false});
  } catch(err) {
    // try opening direct with js
    console.log('Cannot open new tab for ' + url + ' - probably in the test page. Trying to open directly with js')
    window.open(url,'_blank');
  }
}


// This is run when the extension loads
var noapimsg = "You don't appear to be signed up yet! If you sign up you can create and support requests, and more.";
noapimsg += ' Please <a class="label label-info" href="' + oab.site_address + oab.register_address;
noapimsg += '">signup or login</a> now, and your API key will be automatically retrieved.';
try {
  chrome.storage.local.get({api_key : ''}, function(items) {
    if (items.api_key === '') {
      oab.displayMessage(noapimsg);
    } else {
      api_key = items.api_key;
    }
  });
} catch (err) {
  var apik;
  try {
    apik = window.location.href.split('apikey=')[1].split('&')[0].split('#')[0];
  } catch(err) {}
  if (apik) {
    // this is just useful for testing...
    console.log('Got api key ' + apik + ' direct from url param for testing');
    api_key = apik;
  } else {
    oab.displayMessage('(you are on the test page - you can provide an apikey url param to override this msg).<br>' + noapimsg);
  }
}

try {
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    // Check the status of the URL for the current tab
    page_url = tabs[0].url.split('?')[0].split('#')[0];
    oab.debugLog('Sending availability query via chrome tabs for URL ' + page_url);
    oab.sendAvailabilityQuery(api_key, page_url, handleAvailabilityResponse, oab.handleAPIError);
  });
} catch (err) {
  // for testing it is useful to send this based on page
  oab.debugLog('Sending availability query direct from within test page')
  page_url = window.location.href.split('?')[0].split('#')[0];
  oab.sendAvailabilityQuery(api_key, page_url, handleAvailabilityResponse, oab.handleAPIError);
}

// Set up listeners for links and the story box
$('#spin-greybox').visible = false;

var need = function(e) {
  if ( $(this).attr('href') === '#' && api_key ) {
    e.preventDefault();
    var action = $(this).attr('data-action');
    var type = $(this).attr('data-type');
    var ask = action === 'support' ? 'There is an open request for this ' + type + '. Add your support. ' : 'Create a new ' + type + ' request. ';
    ask += 'How would getting access to this ' + type + ' help you? This message will be sent to the author.';
    $('#story').attr('placeholder',ask);
    $('#submit').attr('data-type',type);
    action === 'support' ? $('#submit').html($('#submit').html().replace('create','support')) : $('#submit').html($('#submit').html().replace('support','create'));
    $('#story_div').removeClass('collapse');
  }
}
$('.need').bind('click',need);

$('#submit').click(function () {
  var data = {
    story: $('#story').value
  };
  var action = $(this).attr('data-action');
  if ( action === 'create' ) {
    data.type = $(this).attr('data-type');
    data.url = page_url;
  } else {
    data._id = $(this).attr('data-support');
  }
  oab.sendSupportPost(api_key, data, handleRequestResponse, oab.handleAPIError);
});

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


