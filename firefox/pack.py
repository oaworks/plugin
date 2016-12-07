#! /usr/bin/env python
import os
import json
import zipfile
import argparse
import re
ver = '0.1.3'
abt = \
    """
    Script to convert a Chrome / Opera WebExtension to a Firefox-compatible WebExtension archive.
    Creates a compressed zip archive named from manifest keys <version_name>.xpi  or <name>_firefox_<version>.xpi.
    By Steven Eardley | Cottage Labs LLP | steve@cottagelabs.com
    """

parser = argparse.ArgumentParser(description=abt, version=ver)
parser.add_argument("-d",
                    "--dir",
                    default="..",
                    help="directory to pack (with manifest.json at its root)."
                         "Defaults to .. so this script can used in a submodule")
parser.add_argument("-i",
                    "--id",
                    default="jid1-I4HAe95cHq6CJQ@jetpack",
                    help="extension ID to be added to the manifest. Default is jid1-I4HAe95cHq6CJQ@jetpack")
parser.add_argument("-m",
                    "--min_version",
                    default="45.0",
                    help="version to put as strict_min_version for Firefox. Defaults to 45.0")
args = parser.parse_args()

ffx_manifest_extras = {
    'applications': {
        'gecko': {
            'id': args.id,
            'strict_min_version': args.min_version
        }
    }
}

chrome_manifest = None
try:
    with open(args.dir + '/manifest.json') as f:
        try:
            chrome_manifest = json.load(f)
            # change version string to firefox
            try:
                chrome_manifest["version_name"] = chrome_manifest["version_name"].replace('oabutton_', 'oabutton_firefox_')
            except KeyError:
                # no version_name, pass
                pass

            # add firefox keys to manifest
            chrome_manifest.update(ffx_manifest_extras)
        except ValueError:
            print "Error: could not parse manifest file."
            exit(1)
except IOError:
    print "Error: problem reading manifest file or file not found."
    exit(1)

if chrome_manifest is None:
    print "Error: no usable manifest file found."
    exit(1)

try:
    name = chrome_manifest['version_name']
except KeyError:
    name = "{0}_firefox_{1}".format(chrome_manifest['name'].replace(' ','_'), chrome_manifest['version'])
archive_filename = '{0}.xpi'.format(name)

with zipfile.ZipFile(file=archive_filename, mode='w') as xpi_zip:
    archive_root = args.dir if args.dir.endswith('/') else args.dir + '/'
    match_root = re.compile('^{0}'.format(archive_root))

    # write all files apart from the manifest
    for root, dirs, files in os.walk(args.dir):
        # exclude hidden files and directories
        files = [f for f in files if not f.startswith('.')]
        dirs[:] = [d for d in dirs if not d.startswith('.') and not d == 'firefox']

        for fi in files:
            # add all files to archive except any old .xpi, the old manifest and this script
            if fi != 'manifest.json' and fi != 'pack.py' and not fi.endswith(".xpi"):
                xpi_zip.write(filename=os.path.join(root, fi),
                              arcname=match_root.sub('', os.path.join(root, fi)),
                              compress_type=zipfile.ZIP_DEFLATED)

    # write the updated manifest
    xpi_zip.writestr('manifest.json', json.dumps(chrome_manifest), compress_type=zipfile.ZIP_DEFLATED)

    print "Done. New archive at {0} including:\n".format(archive_filename)
    xpi_zip.printdir()

    xpi_zip.close()
