/* Using the OAB API */

var oab = {

  debug : true,

  api_address : 'https://dev.api.cottagelabs.com/service/oab',                //'https://api.opendatabutton.org',

  site_address : 'https://oab.test.cottagelabs.com',

  register_address : '/account',

  // Tell the API which plugin version is in use for each POST
  signPluginVersion: function(pdata) {
    // Add the debug key if turned on
    var signed_post;
    try {
      var manifest = chrome.runtime.getManifest();
      signed_post = $.extend(pdata, { plugin: manifest.version_name } );
    } catch (err) {
      signed_post = $.extend(pdata, { plugin: 'oab_test_page' } );
    }

    if (oab.debug) {
      return $.extend(signed_post, { test: true })
    } else {
      return signed_post
    }
  },

  sendAuthQuery: function(api_key, success_callback, failure_callback) {
    oab.postToAPI('', api_key, {}, success_callback, failure_callback)
  },

  sendAvailabilityQuery: function(url, success_callback, failure_callback) {
    oab.postToAPI('/availability', undefined, { url: url }, success_callback, failure_callback)
  },

  sendRequestPost: function(api_key, request_id, data, success_callback, failure_callback) {
    oab.postToAPI('/request/' + request_id, api_key, data, success_callback, failure_callback)
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

  handleAPIError: function (data, displayFunction) {               // todo: check for more errors
    var error_text = '';
    if (data.status === 401) {
      error_text = "Unauthorised - check your API key is valid."
    } else if (data.status === 403) {
      error_text = "Forbidden - account may already exist."
    }
    if (error_text !== '') {
      displayFunction(error_text);
    }
  },

  debugLog : function(message) {
    if (oab.debug) {
      console.log(message)
    }
  }
};