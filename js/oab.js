
var oabutton_site_address = 'https://openaccessbutton.org';
var oabutton_running = false;
var oabutton_ui = function(debug, bookmarklet, api_address, site_address) {
  // don't do anything if already running, probably a user pressed the button twice in quick succession
  console.log('oabutton UI', oabutton_running);
  if (oabutton_running) return;
  oabutton_running = true;

  if (bookmarklet === undefined) bookmarklet = false; // this script is also used by a bookmarklet, which sets this to a version to change plugin type
  if (typeof debug !== 'boolean') debug = false;
  if (debug) {
    if (api_address === undefined) api_address = 'https://beta.oa.works';
    oabutton_site_address = 'https://dev.openaccessbutton.org';
  }
  if (api_address === undefined) api_address = 'https://api.oa.works';
  if (site_address !== undefined)  oabutton_site_address = site_address;

  try {
    chrome.action.setIcon({path:"../img/static_spin_orange_32.png"});
    var oabutton_rotate_next = 1;
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
      chrome.action.setIcon({ path: path });
      if (oabutton_rotate_next !== false) setTimeout(oabutton_rotate, 100);
    }
    oabutton_rotate();
  } catch(err) {}
  
  async function availability(data) {
    console.log('availability', data);
    try {
      var manifest = chrome.runtime.getManifest();
      data.plugin = manifest.version_name;
    } catch (err) {
      data.plugin = bookmarklet ? 'bookmarklet_'+bookmarklet : 'oab_test_page';
    }
    if (debug) data.test = true;
    resp = await fetch(api_address + '/availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (resp.status === 200) {
      response = await resp.json();
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
          var mu = bookmarklet ? window.location.href : response.data.match;
          var rurl = oabutton_site_address + '/request?url=' + encodeURIComponent(mu);
          if (response.data.exlibris && response.data.meta && response.data.meta.article) {
            if (response.data.meta.article.title) rurl += '&title=' + response.data.meta.article.title;
            if (response.data.meta.article.doi) rurl += '&doi=' + response.data.meta.article.doi;
            rurl += '&exlibris=true';
          }
          if (bookmarklet) {
            document.getElementById('isclosed').style.display = 'inline';
            document.getElementById('linkclosed').setAttribute('href',rurl);
            debug ? alert('Would auto-trigger link closed click now if not in debug mode') : document.getElementById('linkclosed').click();
          }
          if (chrome && chrome.tabs) chrome.tabs.create({'url': rurl});
        }
      }
    } else {
      try {
        var redir = resp.status === 400 ? oabutton_site_address + '/instructions#blacklist' : oabutton_site_address + '/feedback?code=' + resp.status;
        if (bookmarklet) {
          document.getElementById('iconloading').style.display = 'none';
          document.getElementById('iserror').style.display = 'inline';
          document.getElementById('linkerror').setAttribute('href',redir);
          debug ? alert('Would auto-trigger link error click now if not in debug mode') : document.getElementById('linkerror').click();
        }
        if (chrome && chrome.tabs) chrome.tabs.create({'url': redir});
      } catch (err) {}  
    }

    oabutton_running = false;
    try {
      if (chrome && chrome.action) {
        oabutton_rotate_next = false;
        setTimeout(function() { chrome.action.setIcon({path:"../img/oa128.png"}); }, 1000);
      }
    } catch(err) {}
  }

  if (bookmarklet) {
    if (debug) console.log('Sending availability query direct from within page');
    availability({url:window.location.href.split('#')[0], dom: document.all[0].outerHTML});
  } else if (chrome && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      var qry = {url: tabs[0].url.split('#')[0]};
      try {
        qry.dom = (await chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          function: function() {
            return document.all[0].outerHTML;
          }
        }))[0].result;
      } catch (err) {}
      try {
        qry.dom = qry.dom.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      } catch (err) {}
      availability(qry);
    });
  }

};

try {
  if (chrome && chrome.action) {
    chrome.action.onClicked.addListener(oabutton_ui);
    chrome.runtime.setUninstallURL(oabutton_site_address + '/feedback#uninstall');
    function instruct() {
      chrome.tabs.create({'url': oabutton_site_address + '/instructions'});
    }
    chrome.runtime.onInstalled.addListener(instruct);
  }
} catch(err) {}

