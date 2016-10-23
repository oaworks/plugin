# Open Access Button Unified Extension
===============

This is the Button's WebExtension which runs on Firefox and Chrome (and maybe Opera) which encapsulates functionality of the incumbent [Open Access Button](https://github.com/OAButton/oab-chromeaddon) and [Open Data Button](https://github.com/OAButton/odb-chromeaddon).

## Contributing

Our [main repository](https:www.github.org/oabutton/backend) contains far more information on the project, how to contribute etc.

Quick guide:

* If you have an issue (e.g bug, suggestion, question), make it [here](https://github.com/OAButton/backend/issues/new)
* If you want to contribute code to the plugin do it in this repository. Pull requests are always welcome. Some useful information is below.

# Development notes

### Branches, master vs develop.

* master is our stable, released code.
* develop is what we're currently working on now.

## packaging for Firefox

Firefox requires extra keys in the manifest, and the project files zip archived with extension ```.xpi```. The script ```pack_ffx.py``` does this. Supply the required [extension ID](https://developer.mozilla.org/en-US/Add-ons/Install_Manifests#id).
```./pack_ffx.py -i oab-ffx@openaccessbutton.org```

## Install from development

If you just want to see something quickly, it may be easier to use the [testing site](oabe.test.cottagelabs.com/html/main.html).

### Getting the latest extension

* Go to code page for this repo page, [unified-extension](https://github.com/oabutton/unified-extension/).
* Be sure you are on the develop branch, if not, switch to develop in the drop down option on the top left of the page.
* click the big green button on the top right that says 'clone or download'.
* click download to get a zip file of the latest extension.
* Download the zip.
* Navigate and find the file on your computer, double click it to unzip it. You now have the latest code.

However, we commonly use releases on this repository. It may be better to use a recent release, which can be found [here](https://github.com/OAButton/unified-extension/releases)

#### Or, for leet coders

* git clone
* git checkout develop

### Installing the file on Chrome

* In Chrome, go to chrome://extensions via the url bar, tick the 'Developer mode' tick-box in the top right corner.
* Click the newly appeared 'Load unpacked extension...' button
* Browse to the project directory you just downloaded, click 'Select'. It will upload the zip file you just downloaded.
* If you're experiencing problems with any of these steps, feel free to leave an issue on the backend repository [here](https://github.com/OAButton/backend/issues/new).
