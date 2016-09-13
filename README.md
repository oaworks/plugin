Open Access Button Unified Extension
===============

This will be a WebExtension which runs on Firefox and Chrome (and maybe Opera) which encapsulates functionality of the incumbent [Open Access Button](https://github.com/OAButton/oab-chromeaddon) and [Open Data Button](https://github.com/OAButton/odb-chromeaddon)

## Contributing

/Backend contains far more information on the project, how to contribute etc. 

* Issues go in /backend (issues here are being shut, then no more are being added)
* Code goes here

### packaging for firefox

Firefox requires extra keys in the manifest, and the project files zip archived with extension ```.xpi```. The script ```pack_ffx.py``` does this. Supply the required [extension ID](https://developer.mozilla.org/en-US/Add-ons/Install_Manifests#id).
```./pack_ffx.py -i oab-ffx@openaccessbutton.org```

## Dev Install

### Getting the latest extension

* Go to code page for this repo page, [unified-extension](https://github.com/meganwaps/unified-extension/). 
* Be sure you are on the develop branch, if not, switch to develop in the drop down option on the top left of the page.
* click the big green button on the top right that says 'clone or download'.
* click download to get a zip file of the latest extension.
* Download the zip.
* Navigate and find the file on your computer, double click it to unzip it. You now have the latest code.

#### Or, for leet coders

* git clone
* git checkout develop

### Installing the file on Chrome

* In Chrome, go to chrome://extensions via the url bar, tick the 'Developer mode' tick-box in the top right corner.
* Click the newly appeared 'Load unpacked extension...' button
* Browse to the project directory you just downloaded, click 'Select'. It will upload the zip file you just downloaded. 
* If you're experiencing problems with any of these steps, feel free to leave an issue on the backend repository [here](https://github.com/OAButton/backend/issues/new). 
 
