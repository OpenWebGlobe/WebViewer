#!/usr/bin/python

import urllib2
import sys
import os
import os.path
import tarfile

#-------------------------------------------------------------------------------
# OS specific setupls

if sys.platform == 'win32':
   print "Windows detected..."
   dest = "komodo_integration_win32.tar.gz"
elif sys.platform == 'darwin':
   print "MacOS X detected..."
   dest = "komodo_integration_osx.tar.gz"
elif 'linux' in sys.platform:
   print "Linux detected..."
   dest = "komodo_integration_linux.tar.gz"
else:
   print "unsupported system: " + sys.platform
   print "project file will be installed, but no macros!"
   dest = "komodo_integration.tar.gz"

#-------------------------------------------------------------------------------
# FUNCTION: DOWNLOAD FILE
#-------------------------------------------------------------------------------
def download(url, filename):
   print "Fetching " + url
   webfile = urllib2.urlopen(url)
   diskfile = open(filename,"wb")
   diskfile.write(webfile.read())
   diskfile.close()
   webfile.close()
   

#-------------------------------------------------------------------------------
# MAIN
#-------------------------------------------------------------------------------
destfile = "external.tar.gz"

# Download Komodo project integration (depends OS)
url = "https://github.com/downloads/OpenWebGlobe/WebViewer/" + dest

if (os.path.isfile(dest)):
   print "Komodo integration file already downloaded..."
else:
   download(url, dest)
   print "Extracting komodo integration..."
   tar = tarfile.open(dest)
   tar.extractall("../")
   tar.close()
   print "Ok."

print "Done."



