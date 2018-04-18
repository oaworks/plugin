
var oabutton_running = false;
var oabutton_rotate_next = false;

var oabutton_site_address = 'https://openaccessbutton.org';

function oabutton_rotate() {
  var path = '../img/static_spin_orange_32';
  if (oabutton_rotate_next === 1) {
    path += '_r1';
    oabutton_rotate_next = 2;
  } else if (oabutton_rotate_next === 2) {
    path += '_r2';
    oabutton_rotate_next = 0;
  } else if (oabutton_rotate_next === 0) {
    oabutton_rotate_next = 1;
  }
  path += '.png';
  chrome.browserAction.setIcon({ path: path });
  if (oabutton_rotate_next !== false) setTimeout(oabutton_rotate, 100);
}

var oabutton_ui = function(debug,bookmarklet,api_address,site_address) {
  // don't do anything if already running, probably a user pressed the button twice in quick succession
  if (oabutton_running) return;
  oabutton_running = true;

  // =============================================
  // declare vars and functions

  //if (debug === undefined) debug = true;
  if (bookmarklet === undefined) bookmarklet = false; // this script is also used by a bookmarklet, which sets this to a version to change plugin type
  if (debug) {
    if (api_address === undefined) api_address = 'https://dev.api.cottagelabs.com/service/oab';
    oabutton_site_address = 'https://dev.openaccessbutton.org';
  }
  if (api_address === undefined) api_address = 'https://api.openaccessbutton.org';
  if (site_address !== undefined)  oabutton_site_address = site_address;

  function availability(data) {
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
        oabutton_running = false;
        http.status === 200 ? display(JSON.parse(http.response)) : error(http);
      }
    }
    http.send(JSON.stringify(data));
  }

  function error(data) {
    var code = data.response && data.response.code ? data.response.code : data.status;
    if (debug) console.log(data);
    var redir = code === 400 ? oabutton_site_address + '/instructions#blacklist' : oabutton_site_address + '/feedback?code=' + code;
    if (bookmarklet) {
      document.getElementById('iconloading').style.display = 'none';
      document.getElementById('iserror').style.display = 'inline';
      document.getElementById('linkerror').setAttribute('href',redir);
      debug ? alert('Would auto-trigger link error click now if not in debug mode') : document.getElementById('linkerror').click();
    }
    if (chrome && chrome.tabs) chrome.tabs.create({'url': redir});
  }

  function display(response) {
    if (debug) console.log('API response: ' + JSON.stringify(response.data));
    if (bookmarklet) document.getElementById('iconloading').style.display = 'none';
    for ( var avail_entry of response.data.availability ) {
      if (avail_entry.type === 'article') {
        if (bookmarklet) {
          document.getElementById('isopen').style.display = 'inline';
          document.getElementById('linkopen').setAttribute('href',avail_entry.url);
          debug ? alert('Would auto-trigger link open click now if not in debug mode') : document.getElementById('linkopen').click();
        }
        if (chrome && chrome.tabs) chrome.tabs.create({'url': avail_entry.url});
      }
    }
    for (var requests_entry of response.data.requests) {
      if (requests_entry.type === 'article') {
        if (bookmarklet) {
          document.getElementById('isclosed').style.display = 'inline';
          document.getElementById('linkclosed').setAttribute('href',oabutton_site_address + '/request/' + requests_entry._id);
          debug ? alert('Would auto-trigger link closed click now if not in debug mode') : document.getElementById('linkclosed').click();
        }
        if (chrome && chrome.tabs) chrome.tabs.create({'url': oabutton_site_address + '/request/' + requests_entry._id});
      }
    }
    for (var accepts_entry of response.data.accepts) {
      if (accepts_entry.type === 'article') {
        if (bookmarklet) {
          document.getElementById('isclosed').style.display = 'inline';
          document.getElementById('linkclosed').setAttribute('href',oabutton_site_address + '/request?url=' + encodeURIComponent(window.location.href) + (window.location.href.indexOf('eu.alma.exlibrisgroup.com') !== -1 && response.data.meta && response.data.meta.article && response.data.meta.article.title ? '&title=' + response.data.meta.article.title : ''));
          debug ? alert('Would auto-trigger link closed click now if not in debug mode') : document.getElementById('linkclosed').click();
        }
        chrome.tabs.create({'url': oabutton_site_address + '/request?url=' + encodeURIComponent(response.data.match) + (response.data.match.indexOf('eu.alma.exlibrisgroup.com') !== -1 && response.data.meta && response.data.meta.article && response.data.meta.article.title ? '&title=' + response.data.meta.article.title : '')});
      }
    }
    try {
      if (chrome && chrome.browserAction) {
        oabutton_rotate_next = false;
        setTimeout(function() {
          chrome.browserAction.setIcon({path:"../img/oa128.png"});
        },1000);
      }
    } catch(err) {}
  }

  try {
    chrome.storage.local.remove(['dom'],function() {
      chrome.tabs.executeScript({
        code: 'chrome.storage.local.set({dom: document.all[0].outerHTML });'
      },function() {
        chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
          var qry = {url:tabs[0].url.split('#')[0]};
          try {
            chrome.storage.local.get({dom : ''}, function(items) {
              if (items.dom !== '') qry.dom = items.dom;
              availability(qry);
            });
          } catch (err) {
            availability(qry);
          }
        });
      });
    });
  } catch (err) {
    if (bookmarklet) {
      if (debug) console.log('Sending availability query direct from within page');
      availability({url:window.location.href.split('#')[0], dom: document.all[0].outerHTML});
    }
  }
};

try {
  if (chrome && chrome.browserAction) {
    function execute() {
      chrome.browserAction.setIcon({path:"../img/static_spin_orange_32.png"});
      oabutton_rotate_next = 1;
      oabutton_rotate();
      //oabutton_ui();
      oabutton_ui(true); // comment this out before going to live
    }
    chrome.browserAction.onClicked.addListener(execute);
  }
} catch(err) {}

try {
  chrome.runtime.setUninstallURL(oabutton_site_address + '/feedback#uninstall');
} catch(err) {}

try {
  function instruct() {
    chrome.tabs.create({'url': oabutton_site_address + '/instructions'});
  }
  chrome.runtime.onInstalled.addListener(instruct);
} catch(err) {}
