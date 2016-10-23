
// =============================================
// declare vars and functions

var api_key;
var page_url;

function handleAvailabilityResponse(response) {
  // The main extension logic - do different things depending on what the API returns about URL's status
  oab.debugLog('API response: ' + JSON.stringify(response.data));

  document.getElementById('buttonstatus').className = document.getElementById('buttonstatus').className.replace('collapse','').replace('  ',' ');
  document.getElementById('loading_area').className = 'row collapse';
  
  // Change the UI depending on availability, existing requests, and the data types we can open new requests for.
  if (response.data.availability.length > 0) {
    var title = 'We found it! Click to open';
    for ( var avail_entry of response.data.availability ) {
      document.getElementById('icon'+avail_entry.type).style.backgroundColor = '#398bc5';
      document.getElementById('icon'+avail_entry.type).setAttribute('alt',title);
      document.getElementById('icon'+avail_entry.type).setAttribute('title',title);
      document.getElementById('icon'+avail_entry.type).setAttribute('href',avail_entry.url);
      var nd = document.getElementById('icon'+avail_entry.type).innerHTML;
      nd = nd.replace('Unavailable','Open '+avail_entry.type);
      document.getElementById('icon'+avail_entry.type).innerHTML = nd;
    }
  } else if (response.data.requests.length > 0) {
    for (var requests_entry of response.data.requests) {
      if (requests_entry.usupport) {
        document.getElementById('icon'+requests_entry.type).setAttribute('data-action','supported');
        document.getElementById('submit').setAttribute('data-action','supported');
      } else if (requests_entry.ucreated) {
        document.getElementById('icon'+requests_entry.type).setAttribute('data-action','created');
        document.getElementById('submit').setAttribute('data-action','created');        
      } else {
        document.getElementById('icon'+requests_entry.type).setAttribute('data-action','support');
        document.getElementById('submit').setAttribute('data-action','support');
      }
document.getElementById('icon'+requests_entry.type).setAttribute('href',oab.site_address+'/request/'+requests_entry._id);
      document.getElementById('submit').setAttribute('data-support',requests_entry._id);
      var rnd = document.getElementById('icon'+requests_entry.type).innerHTML;
      rnd = rnd.replace('Unavailable','Support '+requests_entry.type);
      document.getElementById('icon'+requests_entry.type).innerHTML = rnd;
    }
  } else if (response.data.accepts.length > 0) {
    for (var accepts_entry of response.data.accepts) {
      document.getElementById('icon'+accepts_entry.type).setAttribute('data-action','create');
      document.getElementById('submit').setAttribute('data-action','create');
      if (api_key) {
        var and = document.getElementById('icon'+accepts_entry.type).innerHTML;
        and = and.replace('Unavailable','Request '+accepts_entry.type);
        document.getElementById('icon'+accepts_entry.type).innerHTML = and;
      }
    }
  } else {
    oab.debugLog("The API sent a misshapen response to our availability request.");
    oab.displayMessage("Sorry, something went wrong with the API.")
  }
}

function handleRequestResponse(response) {
  document.getElementById('icon_submitting').className = 'collapse';
  document.getElementById('story_div').className += ' collapse';
  document.getElementById('story').value = "";
  var url = oab.site_address + '/request/' + response._id;
  var msg = "<p>Thanks very much for ";
  msg += document.getElementById('submit').getAttribute('data-action') === 'create' ? 'creat' : 'support';
  msg += "ing this request!</p>";
  msg += "<p>Please take a moment to go and view the request, and provide any additional support that you can.</p>"
  msg += '<p>We have opened it up in a new tab for you. If your browser blocked it, you can open it <a class="label label-info" target="_blank" href="' + url + '">here</a>';
  document.getElementById('message').innerHTML = msg;
  try {
    chrome.tabs.create({url: url, active: false});
  } catch(err) {
    // try opening direct with js
    oab.debugLog('Cannot open new tab for ' + url + ' - probably in the test page. Trying to open directly with js')
    window.open(url,'_blank');
  }
}


// =============================================
// These are run when the extension loads

try {
  chrome.tabs.executeScript({
    code: 'chrome.storage.local.set({dom: document.all[0].outerHTML });'
  });
} catch(err) {}

var noapimsg = "You don't appear to be signed up yet! If you sign up you can create and support requests, and more.";
noapimsg += '<br>Please <a id="noapikey" class="label" style="background-color:#398bc5;" href="' + oab.site_address + oab.register_address;
noapimsg += '">signup or login</a> now.';

try {
  // is it worth checking for an api key here? would we want to test as different users by directly passing api key?
  chrome.storage.local.get({api_key : ''}, function(items) {
    if (items.api_key === '') {
      oab.displayMessage(noapimsg);
      document.getElementById('noapikey').onclick = function () {
        chrome.tabs.create({'url': oab.site_address + oab.register_address});
      };
    } else {
      api_key = items.api_key;
      oab.debugLog('api key is available from chrome storage: ' + api_key);
    }
  });
} catch (err) {
  var apik;
  try {
    apik = window.location.href.split('apikey=')[1].split('&')[0].split('#')[0];
  } catch(err) {}
  if (apik) {
    // this is just useful for testing...
    oab.debugLog('Got api key ' + apik + ' direct from url param for testing');
    api_key = apik;
  } else {
    oab.displayMessage('(you are on the test page - you can provide an apikey url param to override this msg).<br>' + noapimsg);
  }
}

try {
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    // Start by checking the status of the URL for the current tab
    page_url = tabs[0].url.split('#')[0];
    oab.debugLog('Sending availability query via chrome tabs for URL ' + page_url);
    oab.sendAvailabilityQuery(api_key, page_url, handleAvailabilityResponse, oab.handleAPIError);
  });
} catch (err) {
  oab.debugLog('Sending availability query direct from within test page');
  page_url = window.location.href.split('#')[0];
  if (page_url.indexOf('apikey=') !== -1) page_url = page_url.split('?apikey=')[0].split('&apikey=')[0].split('apikey=')[0];
  oab.sendAvailabilityQuery(api_key, page_url, handleAvailabilityResponse, oab.handleAPIError);
}


// =============================================
// bind actions to the elements

var needs = document.getElementsByClassName('need');
for ( var n in needs ) {
  needs[n].onclick = function(e) {
    var href = e.target.getAttribute('href');
    if (!href) href = e.target.parentNode.getAttribute('href');
    oab.displayMessage('');
    if ( href === '#' && api_key ) {
      e.preventDefault();
      var action = e.target.getAttribute('data-action');
      if (!action) action = e.target.parentNode.getAttribute('data-action');
      if (action === 'created' || action === 'supported') {
        var rid = document.getElementById('submit').getAttribute('data-support');
        var u = oab.site_address + 'request/' + rid;
        var dm = '<p>You already ' + action + ' a request for this.<br>';
        dm += '<a id="goto_request" href="' + u + '">' + u + '</a></p>';
        if (chrome && chrome.tabs) {
          document.getElementById('goto_request').onclick = function () {
            chrome.tabs.create({'url': oab.site_address + 'request/' + rid});
          };          
        }
        oab.displayMessage(dm);
      } else {
        var type = e.target.getAttribute('data-type');
        if (!type) type = e.target.parentNode.getAttribute('data-type');
        var ask = action === 'support' ? 'There is an open request for this ' + type + '. Add your support. ' : 'Create a new ' + type + ' request. ';
        ask += 'How would getting access to this ' + type + ' help you? This message will be sent to the author.';
        document.getElementById('story').setAttribute('placeholder',ask);
        document.getElementById('submit').setAttribute('data-type',type);
        if ( action === 'support' ) {
          document.getElementById('submit').innerHTML = document.getElementById('submit').innerHTML.replace('create','support');
        } else {
          document.getElementById('submit').innerHTML = document.getElementById('submit').innerHTML.replace('support','create');
        }
        document.getElementById('story_div').className = document.getElementById('story_div').className.replace('collapse','').replace('  ',' ');
      }
    } else if (chrome && chrome.tabs && api_key) {
      chrome.tabs.create({'url': e.target.getAttribute('href')});
    } else {
      e.preventDefault();
    }
  }
}

document.getElementById('submit').onclick = function (e) {
  document.getElementById('submit').className = 'collapse';
  document.getElementById('icon_submitting').className = '';
  var data = {
    story: document.getElementById('story').value
  };
  var action = document.getElementById('submit').getAttribute('data-action');
  if ( action === 'create' ) {
    data.type = document.getElementById('submit').getAttribute('data-type');
    data.url = page_url;
    try {
      chrome.storage.local.get({dom : ''}, function(items) {
        if (items.dom !== '') data.dom = items.dom;
        oab.sendRequestPost(api_key, data, handleRequestResponse, oab.handleAPIError);
      });
    } catch (err) {
      oab.sendRequestPost(api_key, data, handleRequestResponse, oab.handleAPIError);
    }
  } else {
    data._id = document.getElementById('submit').getAttribute('data-support');
    oab.sendSupportPost(api_key, data, handleRequestResponse, oab.handleAPIError);
  }
};

document.getElementById('story').onkeyup = function () {
  var length = document.getElementById('story').value.replace(/  +/g,' ').split(' ').length;
  var left = 25 - length;
  if (left < 0) {
    left = 0;
  }
  if (length === 0) {
    document.getElementById('submit').innerHTML = 'Tell us your story in up to <br><span id="counter">25</span> words to support this request';
    document.getElementById('submit').style.backgroundColor = '#f04717'; 
  }
  if (length <= 5) {
    document.getElementById('submit').innerHTML = 'Tell us your story with up to <span id="counter"></span><br> more words to support this request';
    document.getElementById('submit').style.backgroundColor = '#f04717'; 
  }
  if ( left < 25 && length > 5 ) {
    document.getElementById('submit').removeAttribute('disabled');
  } else {
    document.getElementById('submit').setAttribute('disabled',true);
  }
  if (length > 5 && length <= 10) {
    document.getElementById('submit').innerHTML = 'Great, <span id="counter"></span> words remaining!<br>Write 5 more?';
    document.getElementById('submit').style.backgroundColor = '#ffff66'; 
  }
  if (length > 10 && length <= 20) {
    document.getElementById('submit').innerHTML = '<span id="counter"></span> words left! Or click to submit<br>now and create your request!';
    document.getElementById('submit').style.backgroundColor = '#99ff99'; 
  }
  if (length > 20) {
    document.getElementById('submit').innerHTML = '<span id="counter"></span>... Click now to submit your<br>story and create your request';
    document.getElementById('submit').style.backgroundColor = '#99ff99'; 
  }
  document.getElementById('counter').innerHTML = left;
};


