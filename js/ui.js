
var oabutton_ui = function() {
  // =============================================
  // declare vars and functions

  function display(response) {
    if (oab.debug) console.log('API response: ' + JSON.stringify(response.data));
    document.getElementById('iconloading').style.display = 'none';
    document.getElementById('iconarticle').style.display = 'inline';
    for ( var avail_entry of response.data.availability ) {
      if (avail_entry.type === 'article') {
        document.getElementById('oabutton_popup').style.backgroundColor = '#5cb85c';
        document.getElementById('iconarticle').setAttribute('href',avail_entry.url);
        document.getElementById('iconarticle').innerHTML = 'Available!';
        document.getElementById('iconarticle').click();
        if (chrome && chrome.tabs) chrome.tabs.create({'url': avail_entry.url});
      }
    }
    for (var requests_entry of response.data.requests) {
      if (requests_entry.type === 'article') {
        document.getElementById('oabutton_popup').style.backgroundColor = 'orange';
        document.getElementById('iconarticle').setAttribute('href',oab.site_address + '/request/' + requests_entry._id);
        document.getElementById('iconarticle').innerHTML = 'Request in progress!';
        document.getElementById('iconarticle').click();
        if (chrome && chrome.tabs) chrome.tabs.create({'url': oab.site_address + '/request/' + requests_entry._id});
      }
    }
    for (var accepts_entry of response.data.accepts) {
      if (accepts_entry.type === 'article') {
        document.getElementById('oabutton_popup').style.backgroundColor = '#d9534f';
        document.getElementById('iconarticle').setAttribute('href',oab.site_address + '/request?url=' + encodeURIComponent(window.location.href));
        document.getElementById('iconarticle').innerHTML = 'Unavailable - request it!';
        document.getElementById('iconarticle').click();
        if (chrome && chrome.tabs) {
          chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
            chrome.tabs.create({'url': oab.site_address + '/request?url=' + encodeURIComponent(tabs[0].url)});
          });
        }
      }
    }
  }

  try {
    chrome.runtime.setUninstallURL(oab.site_address + '/feedback#uninstall');
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
          oab.availability(qry, display);
        });
      } catch (err) {
        oab.availability(qry, display);
      }
    });
  } catch (err) {
    if (oab.debug) console.log('Sending availability query direct from within page');
    oab.availability({url:window.location.href.split('#')[0], dom: document.all[0].outerHTML}, display);
  }
  
};
