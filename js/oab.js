/* Using the OAB API */

var oab = {

  debug : true,

  api_address : 'https://dev.api.cottagelabs.com/service/oab', //'https://api.openaccessbutton.org',

  site_address : 'http://oab.test.cottagelabs.com', // 'https://openaccessbutton.org',

  howto_address : '/howto',
  
  register_address : '/account',
  
  messages: 'message', // a div ID name to put error messages etc

  // Tell the API which plugin version is in use for each POST
  signPluginVersion: function(data) {
    // Add the debug key if turned on
    try {
      var manifest = chrome.runtime.getManifest();
      data.plugin = manifest.version_name;
    } catch (err) {
      data.plugin = 'oab_test_page';
      data.test = true;
    }
    if (oab.debug) data.test = true;
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
    var opts = {
      'type': 'POST',
      'url': oab.api_address + request_type,
      'contentType': 'application/json; charset=utf-8',
      'dataType': 'json',
      'processData': false,
      'cache': false,
      'data': JSON.stringify(this.signPluginVersion(data)),
      'success': function(response){
        success_callback(response)
      },
      'error': function(response) {
        failure_callback(response)
      }
    }
    if (api_key !== undefined) {
      opts.beforeSend = function (request) {
        request.setRequestHeader("x-apikey", api_key);
      }
    }
    $.ajax(opts);
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
    // TODO handle the blacklist error, whatever it may be
    var error_text = '';
    if (data.status === 400) {
      error_text = 'Sorry, the page you are on is not one that we can check availability for. See the <a href="' + oab.site_address + oab.howto_address + '">HOWTO</a> for further information';
    } else if (data.status === 401) {
      error_text = "Unauthorised - check your API key is valid. Go to ";
      error_text += oab.site_address + oab.register_address + " and sign up if you have not already done so. Once you are signed in the plugin should find your API key for you."
    } else if (data.status === 403) {
      error_text = "Forbidden. Please file a bug."
    } else {
      error_text = data.status + ". Sorry, unknown error, please file a bug including this code."
    }
    if (error_text !== '') {
      oab.displayMessage(error_text, undefined, 'error');
    }
  },

  debugLog : function(message) {
    if (oab.debug) {
      console.log(message)
    }
  }
};