
var oabutton_ui = function(api_key) {
  // =============================================
  // declare vars and functions

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
    }
    if (response.data.requests.length > 0) {
      for (var requests_entry of response.data.requests) {
        var rnd = document.getElementById('icon'+requests_entry.type).innerHTML;
        if (requests_entry.usupport || requests_entry.ucreated) {
          document.getElementById('icon'+requests_entry.type).setAttribute('href',oab.site_address + '/request/' + requests_entry._id);
          rnd = rnd.replace('Unavailable','View request');
        } else {
          document.getElementById('icon'+requests_entry.type).setAttribute('data-action','support');
          document.getElementById('icon'+requests_entry.type).setAttribute('data-support',requests_entry._id);
          rnd = rnd.replace('Unavailable','Support request');
        }
        document.getElementById('icon'+requests_entry.type).innerHTML = rnd;
      }
    }
    if (response.data.accepts.length > 0) {
      for (var accepts_entry of response.data.accepts) {
        document.getElementById('icon'+accepts_entry.type).setAttribute('data-action','create');
        if (api_key) {
          var and = document.getElementById('icon'+accepts_entry.type).innerHTML;
          and = and.replace('Unavailable','Request '+accepts_entry.type);
          document.getElementById('icon'+accepts_entry.type).innerHTML = and;
        }
      }
    }
  }

  function handleRequestResponse(response) {
    document.getElementById('icon_submitting').className = 'collapse';
    document.getElementById('story_div').className += ' collapse';
    document.getElementById('story').value = "";
    var url = oab.site_address + '/request/';
    url += response.rid ? response.rid : response._id
    var msg = "<p>Thank you for ";
    msg += document.getElementById('submit').getAttribute('data-action') === 'create' ? 'creat' : 'support';
    msg += "ing this request!</p>";
    msg += "<p>Please go and view the request, it may need additional details.</p>"
    msg += '<p>It should be open in a new tab, but if you do not see it <a class="label label-info" target="_blank" href="' + url + '">click here</a>';
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

  var noapimsg = "You don't appear to be signed up. If you sign up you can create and support requests.";
  noapimsg += '<br>Please <a id="noapikey" class="label" style="background-color:#398bc5;" href="' + oab.site_address + oab.register_address;
  noapimsg += '">signup or login</a> now.';

  var start = function() {
    try {
      chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
        // Start by checking the status of the URL for the current tab
        page_url = tabs[0].url.split('#')[0];
        oab.debugLog('Sending availability query via chrome tabs for URL ' + page_url);
        var qry = {url:page_url};
        try {
          chrome.storage.local.get({dom : ''}, function(items) {
            if (items.dom !== '') qry.dom = items.dom;
            oab.sendAvailabilityQuery(api_key, qry, handleAvailabilityResponse, oab.handleAPIError);
          });
        } catch (err) {
          oab.sendAvailabilityQuery(api_key, qry, handleAvailabilityResponse, oab.handleAPIError);
        }
      });
    } catch (err) {
      oab.debugLog('Sending availability query direct from within page');
      page_url = window.location.href.split('#')[0];
      if (page_url.indexOf('apikey=') !== -1) page_url = page_url.split('?apikey=')[0].split('&apikey=')[0].split('apikey=')[0];
      oab.sendAvailabilityQuery(api_key, {url:page_url, dom: document.all[0].outerHTML}, handleAvailabilityResponse, oab.handleAPIError);
    }
  }

  try {
    chrome.storage.local.get({api_key : ''}, function(items) {
      if (items.api_key === '') {
        oab.displayMessage(noapimsg);
        document.getElementById('noapikey').onclick = function () {
          chrome.tabs.create({'url': oab.site_address + oab.register_address});
        };
        start();
      } else {
        api_key = items.api_key;
        oab.debugLog('api key is available from chrome storage: ' + api_key);
        start();
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
    } else if (!api_key) {
      oab.displayMessage('(you are on the test page - you can provide an apikey url param to override this msg).<br>' + noapimsg);
    }
    start();
  }


  // =============================================
  // bind actions to the elements

  var needs = document.getElementsByClassName('need');
  for ( var n in needs ) {
    needs[n].onclick = function(e) {
      var href = e.target.getAttribute('href');
      if (href === undefined || href === null) href = e.target.parentNode.getAttribute('href');
      var type = e.target.getAttribute('data-type');
      if (type === undefined || type === null) type = e.target.parentNode.getAttribute('data-type');
      var supports = e.target.getAttribute('data-support');
      if (supports === undefined || supports === null) supports = e.target.parentNode.getAttribute('data-support');
      var action = e.target.getAttribute('data-action');
      if (action === undefined || action === null) action = e.target.parentNode.getAttribute('data-action');

      if ( href === '#' && api_key ) {
        e.preventDefault();
        var ask = action === 'support' ? 'Someone else has started a request for this ' + type + '. Add your support. ' : 'Create a new ' + type + ' request. ';
        ask += 'How would getting access to this ' + type + ' help you?';
        if (action !== 'support') ask += 'This message will be sent to the author.';
        document.getElementById('story').setAttribute('placeholder',ask);
        document.getElementById('submit').setAttribute('data-type',type);
        document.getElementById('submit').setAttribute('data-support',supports);
        document.getElementById('submit').setAttribute('data-action',action);
        if ( action === 'support' ) {
          document.getElementById('submit').innerHTML = document.getElementById('submit').innerHTML.replace('create','support');
        } else {
          document.getElementById('submit').innerHTML = document.getElementById('submit').innerHTML.replace('support','create');
        }
        document.getElementById('story_div').className = '';
      } else if (chrome && chrome.tabs && api_key) {
        chrome.tabs.create({'url': href});
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
      document.getElementById('submit').innerHTML = 'Say why you need this in up to <br><span id="counter">25</span> words to support this request';
      document.getElementById('submit').style.backgroundColor = '#f04717';
    }
    if (length <= 5) {
      document.getElementById('submit').innerHTML = 'Tell us your reason with up to <span id="counter"></span><br> more words to support this request';
      document.getElementById('submit').style.backgroundColor = '#f04717';
    }
    if ( left < 25 && length > 5 ) {
      document.getElementById('submit').removeAttribute('disabled');
    } else {
      document.getElementById('submit').setAttribute('disabled',true);
    }
    if (length > 5 && length <= 10) {
      document.getElementById('submit').innerHTML = 'Great, <span id="counter"></span> words remaining!<br>Write a few more?';
      document.getElementById('submit').style.backgroundColor = '#ffff66';
    }
    if (length > 10 && length <= 20) {
      document.getElementById('submit').innerHTML = '<span id="counter"></span> words left! Or click to submit<br>now and create your request!';
      document.getElementById('submit').style.backgroundColor = '#99ff99';
    }
    if (length > 20) {
      document.getElementById('submit').innerHTML = '<span id="counter"></span>... Click now to submit your<br>reason and create your request';
      document.getElementById('submit').style.backgroundColor = '#99ff99';
    }
    document.getElementById('counter').innerHTML = left;
  };
};
