oab-extension
===============

**Open Access Button Unified Extension**

This will be a WebExtension which runs on Firefox and Chrome (and maybe Opera) which encapsulates functionality of the incumbent [Open Access Button](https://github.com/OAButton/oab-chromeaddon) and [Open Data Button](https://github.com/OAButton/odb-chromeaddon)]

### packaging for firefox
Firefox requires extra keys in the manifest, and the project files zip archived with extension ```.xpi```. The script ```pack_ffx.py``` does this. Supply the required [extension ID](https://developer.mozilla.org/en-US/Add-ons/Install_Manifests#id).
```./pack_ffx.py -i oab-ffx@openaccessbutton.org```
