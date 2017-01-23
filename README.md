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

Firefox requires extra keys in the manifest, and the project files zip archived with extension ```.xpi```. The script ```firefox/pack.py``` does this. Pull the code repo locally and enter the .firefox folder, then just run ```python pack.py``` to generate a firefox .xpi archive that you can then use as an addon in firefox.

You can install this manually for testing - annoyingly, firefox no longer supports the config setting to install unsigned add-ons in newer versions, 
even though you can still see it there in the config. So you HAVE TO install Firefox Developer Edition to test it. You may then still have to change 
the setting to allow unsigned add-ons too, I got sick of it at this point and stopped trying (also in old versions of firefox this may still be the case).

To enable installing unsigned add-ons go to about:config in the firefox URL bar and search for the setting xpinstall.signatures.required and click to change 
it to false.

Once you have firefox dev edition (or an old version respecting the config setting), open firefox and go to Tools > Add-ons then in the Add-ons Manager 
page that opens, click the arrow next to the cog near the top right and select "Install Add-on From File" then browse to the repo code and in the firefox 
folder select the .xpi file.

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

## Managing releases 

* Only releases tagged "Release" can be put in the Chrome Store. Anything tagged "pre-release" will only work in development. Any time we want to release something new out to chrome, it will always be the latest live release that can be pushed to the chrome store. 
* Releases can be made through the Chrome store here: https://chrome.google.com/webstore/category/extensions while logged into the leads Open Access Button Account. 
* Releases should be tested on master, just in case, after release. 
* Releases tagged pre-release will increment whenever we push new features/fixes etc, and the most recent pre-release should be used for testing, then once testing is confirmed, we will make a live release.
