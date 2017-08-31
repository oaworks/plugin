
var oabutton_ui = function(debug,bookmarklet,api_address,site_address) {
  // =============================================
  // declare vars and functions

  if (debug === undefined) debug = true;
  if (bookmarklet === undefined) bookmarklet = false; // this script is also used by a bookmarklet, which sets this to a version to change plugin type
  
  if (api_address === undefined) api_address = debug ? 'https://dev.api.cottagelabs.com/service/oab' : 'https://api.openaccessbutton.org';
  if (site_address === undefined)  site_address = debug ? 'https://dev.openaccessbutton.org' :'https://openaccessbutton.org';

  function availability(data, success_callback) {
    try {
      var manifest = chrome.runtime.getManifest();
      data.plugin = manifest.version_name;
    } catch (err) {
      data.plugin = bookmarklet ? 'bookmarklet_'+bookmarklet : 'oab_test_page';
    }
    if (debug) data.test = true;
    var http = new XMLHttpRequest();
    var url = api_address + '/availability';
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/json; charset=utf-8");
    http.onreadystatechange = function() {
      if (http.readyState == XMLHttpRequest.DONE) {
        http.status === 200 ? success_callback(JSON.parse(http.response)) : error(http);
      }
    }
    http.send(JSON.stringify(data));
  }

  function error(data) {
    var code = data.response && data.response.code ? data.response.code : data.status;
    if (bookmarklet) document.getElementById('iconarticle').innerHTML('<a href="' + oab.site_address + '/feedback?code=' + code + '">Error! Click to report.</a>');
    if (chrome && chrome.tabs) chrome.tabs.create({'url': site_address + '/feedback?code=' + code});
  }

  function display(response) {
    if (debug) console.log('API response: ' + JSON.stringify(response.data));
    if (bookmarklet) {
      document.getElementById('iconloading').style.display = 'none';
      document.getElementById('iconarticle').style.display = 'inline';
    }
    for ( var avail_entry of response.data.availability ) {
      if (avail_entry.type === 'article') {
        if (bookmarklet) {
          document.getElementById('oabutton_popup').style.backgroundColor = '#5cb85c';
          document.getElementById('iconarticle').setAttribute('href',avail_entry.url);
          document.getElementById('iconarticle').innerHTML = 'Available!';
          document.getElementById('iconarticle').click();
        }
        if (chrome && chrome.tabs) chrome.tabs.create({'url': avail_entry.url});
      }
    }
    for (var requests_entry of response.data.requests) {
      if (requests_entry.type === 'article') {
        if (bookmarklet) {
          document.getElementById('oabutton_popup').style.backgroundColor = 'orange';
          document.getElementById('iconarticle').setAttribute('href',site_address + '/request/' + requests_entry._id);
          document.getElementById('iconarticle').innerHTML = 'Request in progress!';
          document.getElementById('iconarticle').click();
        }
        if (chrome && chrome.tabs) chrome.tabs.create({'url': site_address + '/request/' + requests_entry._id});
      }
    }
    for (var accepts_entry of response.data.accepts) {
      if (accepts_entry.type === 'article') {
        if (bookmarklet) {
          document.getElementById('oabutton_popup').style.backgroundColor = '#d9534f';
          document.getElementById('iconarticle').setAttribute('href',site_address + '/request?url=' + encodeURIComponent(window.location.href));
          document.getElementById('iconarticle').innerHTML = 'Unavailable - request it!';
          document.getElementById('iconarticle').click();
        }
        if (chrome && chrome.tabs) {
          chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
            chrome.tabs.create({'url': site_address + '/request?url=' + encodeURIComponent(tabs[0].url)});
          });
        }
      }
    }
    try {
      if (chrome && chrome.browserAction) {
        chrome.browserAction.setIcon({path:"../img/oa128.png"});
      }
    } catch(err) {}
  }

  try {
    chrome.runtime.setUninstallURL(site_address + '/feedback#uninstall');
    chrome.tabs.executeScript({
      code: 'chrome.storage.local.set({dom: document.all[0].outerHTML });'
    });
  } catch(err) {}
  try {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
      var qry = {url:tabs[0].url.split('#')[0]};
      try {
        chrome.storage.local.get({dom : ''}, function(items) {
          if (items.dom !== '') qry.dom = items.dom;
          availability(qry, display);
        });
      } catch (err) {
        availability(qry, display);
      }
    });
  } catch (err) {
    if (oab.debug) console.log('Sending availability query direct from within page');
    if (bookmarklet) availability({url:window.location.href.split('#')[0], dom: document.all[0].outerHTML}, display);
  }
  
};

function updateIcon() {
  chrome.browserAction.setIcon({path:"../img/spin_orange_32.svg"});
  oabutton_ui();
}
chrome.browserAction.onClicked.addListener(updateIcon);