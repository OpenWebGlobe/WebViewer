#######################################################
#!/usr/bin/python
# Python Script to make an OpenWebGlobe deployment
# Make sure to compile first before calling this script
#######################################################

import sys
import os
import os.path
import shutil
import fileinput

###############################
# SETTINGS
###############################
OpenWebGlobe_Version = "0.9.14"
###############################
deploy_path = "../../WebSDK/"
viewer_path = "WebGLViewer/"
tutorials_path = "tutorials/"
###############################

jstarget = deploy_path + viewer_path;
target = deploy_path + viewer_path + tutorials_path;

#########################
## Replace for Deploy ###
line1 = '<script type="text/javascript" src="../../../external/closure-library/closure/goog/base.js"></script>\n'
line2 = '<script type="text/javascript" src="../../../compiled/deps.js"></script>\n'
line3 = '<script type="text/javascript">goog.require(\'owg.OpenWebGlobe\');</script>'
##
replace = '<script type="text/javascript" src="' + "../../openwebglobe-" + OpenWebGlobe_Version+ ".js" + '"></script>'
#########################

tutorials = []

if (os.path.exists(target)):
    shutil.rmtree(target)

shutil.copytree("../source/tutorials/", target, False, None)
shutil.copy("../compiled/owg-optimized.js", jstarget + "openwebglobe-" + OpenWebGlobe_Version+ ".js")

for dirname, dirnames, filenames in os.walk(target):
    for subdirname in dirnames:
        tutorials.append(subdirname)


for x in tutorials:
    for dirname, dirnames, filenames in os.walk(target+x):
        for f in filenames:
            thefile = target+x+'/'+f
            filename, ext = os.path.splitext(thefile)
            if (ext == ".html"):
                print "processing " + f
                for line in fileinput.FileInput(thefile,inplace=1):
                    line = line.replace(line1,"")
                    line = line.replace(line2,"")
                    line = line.replace(line3,replace)
                    #print line
                    sys.stdout.write(line)



