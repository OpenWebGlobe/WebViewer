OpenWebGlobe WebViewer
========================

With OpenWebGlobe you can create your own virtual globe applications.

The WebViewer is a port of the OpenWebGlobe SDK to Javascript/WebGL.

OpenWebGlobe is created by the Geomatics Engineering departement at the
University of Applied Sciences Northwestern Switzerland.


Getting started
===============

WebViewer requires a modern web browser that supports WebGL.  You can check if your browser supports WebGL here:
https://get.webgl.org/

Once you have a suitable browser, visit `source/demos/02_WorldDemo/demo.html` to
see a demonstration.


Building WebViewer
==================

WebViewer is compiled with [Google's Closure
Compiler](http://code.google.com/closure/compiler/) and uses [Google's Closure
Library](http://code.google.com/p/closure-library/).  The compiler produces an
optimized, minified Javascript file containing all the WebViewer code.


Windows, Linux, MacOS X
-----------------------

1) Install Python if you don't have it already. You can get python at http://www.python.org/
You also need Java installed for the closure compiler. 
On windows you may have to adjust the Python Path in "scripts/setup.bat".

2) Go into the scripts directory and start 
"download_external.py". This will download all required external files.


CORS - Cross Origin Resource Sharing
====================================

For security reasons CORS must be used when downloading textures. During development this can be annoying.
When using Firefox you can disable "security.fileuri.strict_origin_policy" in about:config and you can install the addon "Force CORS" from here: [Force CORS AddOn](https://addons.mozilla.org/en-US/firefox/addon/forcecors/)


License
=======

OpenWebGlobe is

Copyright (c) 2010-2015 University of Applied Sciences Northwestern Switzerland.
Institute of Geomatics Engineering.

See the file `LICENSE` for details.

