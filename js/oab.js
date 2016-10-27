/* Using the OAB API */

var oab = {

  debug : true, // this puts the button in debug mode, issues debug warnings

  bookmarklet : false, // this lib is also used by a bookmarklet, which sets this to change plugin type
  
  api_address : 'https://dev.api.cottagelabs.com/service/oab', // 'https://api.openaccessbutton.org',

  site_address : 'http://oab.test.cottagelabs.com', // 'https://openaccessbutton.org',

  howto_address : '/instructions',

  register_address : '/account',

  bug_address : '/bug',

  messages: 'message', // a div ID name to put error messages etc

  // Tell the API which plugin version is in use for each POST
  signPluginVersion: function(data) {
    // Add the debug key if turned on
    try {
      var manifest = chrome.runtime.getManifest();
      data.plugin = manifest.version_name;
    } catch (err) {
      data.plugin = oab.bookmarklet ? 'bookmarklet_'+oab.bookmarklet : 'oab_test_page';
    }
    if (oab.debug) data.test = true;
    return data;
  },

  sendAvailabilityQuery: function(api_key, data, success_callback, failure_callback) {
    oab.postLocated('/availability', api_key, data, success_callback, failure_callback)
  },

  sendRequestPost: function(api_key, data, success_callback, failure_callback) {
    var request_id = data._id ? data._id : '';
    oab.postLocated('/request/' + request_id, api_key, data, success_callback, failure_callback)
  },

  sendSupportPost: function(api_key, data, success_callback, failure_callback) {
    var request_id = data._id ? data._id : undefined;
    if ( request_id ) {
      oab.postLocated('/support/' + request_id, api_key, data, success_callback, failure_callback);
    } else {
      // refuse to send
      oab.debugLog('Not sending support post without request ID');
    }
  },

  // try to append location to the data object before POST
  postLocated: function(request_type,key,data,success_callback,error_callback) {
    try {
      if (navigator.geolocation) {
        var opts = {timeout: 5000};
        navigator.geolocation.getCurrentPosition(function (position) {
          data.location = {geo: {lat: position.coords.latitude, lon: position.coords.longitude}};
          oab.postToAPI(request_type,key,data,success_callback,error_callback);
        }, function (error) {
          oab.debugLog(error.message);
          oab.postToAPI(request_type,key,data,success_callback,error_callback);
        }, opts);
      } else {
        // Browser does not support location
        oab.debugLog('GeoLocation is unsupported.');
        oab.postToAPI(request_type,key,data,success_callback,error_callback);
      }
    } catch (e) {
      oab.debugLog("A location error has occurred.");
      oab.postToAPI(request_type,key,data,success_callback,error_callback);
    }
  },

  postToAPI: function(request_type, api_key, data, success_callback, failure_callback) {
    var http = new XMLHttpRequest();
    var url = oab.api_address + request_type;
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/json; charset=utf-8");
    if (api_key !== undefined) http.setRequestHeader("x-apikey", api_key);
    http.onreadystatechange = function() {
      if (http.readyState == XMLHttpRequest.DONE) {
        http.status === 200 ? success_callback(JSON.parse(http.response)) : failure_callback(http);
      }
    }
    http.send(JSON.stringify(this.signPluginVersion(data)));
    oab.debugLog('POST to ' + request_type + ' ' + JSON.stringify(data));
  },

  displayMessage: function(msg, div, type) {
    if (div === undefined) div = document.getElementById(oab.messages);
    if (type === undefined) {
      type = '';
    } else if ( type === 'error' ) {
      type = 'alert-danger';
    }
    div.innerHTML = '<div class="alert ' + type + '" role="alert">' + msg + '</div>';
  },

  handleAPIError: function(data, displayError) {
    document.getElementById('icon_submitting').className = 'collapse';
    document.getElementById('icon_loading').className = 'collapse';
    var error_text = '';
    if (data.status === 400) {
      error_text = 'Sorry, the Button does not work on pages like this. You might want to check the <a href="' + oab.site_address + oab.howto_address + '" id="goto_instructions">instructions</a> for help. If you think it should work here, <a id="goto_bug" href="' + oab.site_address + oab.bug_address + '">file a bug</a>.';
    } else if (data.status === 401) {
      error_text = "You need an account for this. Go to ";
      error_text += '<a href="' + oab.site_address + oab.register_address + '" id="goto_register">';
      error_text += oab.site_address + oab.register_address + "</a> and either sign up or sign in - then your plugin will work.";
    } else if (data.status === 403) {
      error_text = 'Something is wrong, please <a id="goto_bug" href="' + oab.site_address + oab.bug_address + '">file a bug</a>.';
    } else if (data.status === 412) {
      error_text = data.response.message;
    } else {
      error_text = data.status + '. Hmm, we are not sure what is happening. You or the system may be offline. Please <a id="goto_bug" href="' + oab.site_address + oab.bug_address + '">file a bug</a>.';
    }
    if (error_text !== '') {
      error_text = '<p><img src="';
      error_text += oab.bookmarklet ? oab.site_address + '/static/bookmarklet/img/error.png' : '../img/error.png';
      error_text += '" style="margin:5px auto 10px 100px;"></p>' + error_text;
      document.getElementById('loading_area').className = 'row collapse';
      oab.displayMessage(error_text, undefined, 'error');
      if (chrome && chrome.tabs) {
        if ( document.getElementById('goto_instructions') ) {
          document.getElementById('goto_instructions').onclick = function () {
            chrome.tabs.create({'url': oab.site_address + oab.howto_address});
          };
        }
        if ( document.getElementById('goto_bug') ) {
          document.getElementById('goto_bug').onclick = function () {
            chrome.tabs.create({'url': oab.site_address + oab.bug_address});
          };
        }
        if ( document.getElementById('goto_register') ) {
          document.getElementById('goto_register').onclick = function () {
            chrome.tabs.create({'url': oab.site_address + oab.register_address});
          };
        }
      }
    }
  },

  debugLog: function(message) {
    if (oab.debug) {
      console.log(message)
    }
  }
};
