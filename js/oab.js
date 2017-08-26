/* Using the OAB API */

var oab = {

  debug : true, // this puts the button in debug mode, issues debug warnings
  api_address : 'https://dev.api.cottagelabs.com/service/oab',//'https://api.openaccessbutton.org',
  site_address : 'https://dev.openaccessbutton.org',//'https://openaccessbutton.org',

  bookmarklet : false, // this lib is also used by a bookmarklet, which sets this to a version to change plugin type

  availability: function(data, success_callback) {
    try {
      var manifest = chrome.runtime.getManifest();
      data.plugin = manifest.version_name;
    } catch (err) {
      data.plugin = oab.bookmarklet ? 'bookmarklet_'+oab.bookmarklet : 'oab_test_page';
    }
    if (oab.debug) data.test = true;
    var http = new XMLHttpRequest();
    var url = oab.api_address + '/availability';
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/json; charset=utf-8");
    http.onreadystatechange = function() {
      if (http.readyState == XMLHttpRequest.DONE) {
        http.status === 200 ? success_callback(JSON.parse(http.response)) : oab.error(http);
      }
    }
    http.send(JSON.stringify(data));
  },

  error: function(data) {
    var code = data.response && data.response.code ? data.response.code : data.status;
    document.getElementById('iconarticle').innerHTML('<a href="' + oab.site_address + '/feedback?code=' + code + '">Error! Click to report.</a>');
    if (chrome && chrome.tabs) chrome.tabs.create({'url': oab.site_address + '/feedback?code=' + code});
  }
};
