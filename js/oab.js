/* Using the OAB API */

var oab = {

  debug : true, // this puts the button in debug mode, issues debug warnings
  test : true, // whether or not to create requests that are marked as test
  
  api_address : function() {
    return oab.debug ? 'https://dev.api.cottagelabs.com/service/oab' : 'https://api.openaccessbutton.org';
  },

  site_address : function() {
    return oab.debug ? 'http://oab.test.cottagelabs.com' : 'https://openaccessbutton.org';
  },

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
      data.plugin = 'oab_test_page';
    }
    if (oab.test) data.test = true;
    return data;
  },

  sendAvailabilityQuery: function(api_key, url, success_callback, failure_callback) {
    oab.postLocated('/availability', api_key, { url: url }, success_callback, failure_callback)
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
    var error_text = '';
    if (data.status === 400) {
      error_text = 'Sorry, the page you are on is not one that we can check availability for. See the <a href="' + oab.site_address + oab.howto_address + '" id="goto_instructions">instructions</a> for help.';
    } else if (data.status === 401) {
      error_text = "Unauthorised - check your API key is valid. Go to ";
      error_text += '<a href="' + oab.site_address + oab.register_address + '" id="goto_register">';
      error_text += oab.site_address + oab.register_address + "</a> and sign up if you have not already done so. Once you are signed in the plugin should find your API key for you.";
    } else if (data.status === 403) {
      error_text = "Forbidden - please file a bug.";
    } else {
      error_text = data.status + ". Sorry, unknown error, perhaps the system is offline, or you are offline. Please file a bug including this code: " + data.status;
    }
    if (error_text !== '') {
      error_text = '<p><img src="../img/error.png" style="margin:5px auto 10px 100px;"></p>' + error_text;
      document.getElementById('loading_area').className = 'row collapse';
      oab.displayMessage(error_text, undefined, 'error');
      if (chrome && chrome.tabs) {
        if ( document.getElementById('goto_instructions') ) {
          document.getElementById('goto_instructions').onclick = function () {
            chrome.tabs.create({'url': oab.site_address + oab.howto_address});
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
