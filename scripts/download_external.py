#!/usr/bin/python

import urllib2
import sys
import os
import os.path
import tarfile


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

#check if file was downloaded before.
if (os.path.isfile(destfile)):
   print "File already downloaded..."
else:
   download("https://github.com/downloads/OpenWebGlobe/WebViewer/external.tar.gz", destfile)
   # extract archive in "WebViewer/external"
   print "Extracting external files..." 
   tar = tarfile.open(destfile)
   tar.extractall("../")
   tar.close()
   print "Ok."

print "Done."



