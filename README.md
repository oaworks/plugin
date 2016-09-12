Unified Extension
===============

**Open Access Button Unified Extension**

This will be a WebExtension which runs on Firefox and Chrome (and maybe Opera) which encapsulates functionality of the incumbent [Open Access Button](https://github.com/OAButton/oab-chromeaddon) and [Open Data Button](https://github.com/OAButton/odb-chromeaddon)

### packaging for firefox
Firefox requires extra keys in the manifest, and the project files zip archived with extension ```.xpi```. The script ```pack_ffx.py``` does this. Supply the required [extension ID](https://developer.mozilla.org/en-US/Add-ons/Install_Manifests#id).
```./pack_ffx.py -i oab-ffx@openaccessbutton.org```


## Dev Install

### Getting the latest extension

* Go to the repo page
* you should be on the develop branch automatically because it is the newest branch but if not, switch to develop in the drop down option on the left
* click the big green button that says clone or download, click it
* click download
* you will get a zip
* Navigate to the file on your computer, double click it to unzip it and you have the code

### Installing the file

* In Chrome, go to chrome://extensions via the url bar, tick the 'Developer mode' tick-box
* Click the newly appeared 'Load unpacked extension...' button
* Browse to the project directory, click 'Select'. It'll appear in the extensions list.
