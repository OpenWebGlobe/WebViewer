i3D OpenWebGlobe SDK WebViewer
==============================

With the OpenWebGlobe SDK you can create your own virtual globe applications.
You can develop your new application in your favorite language like C++, C#,
Visual Basic, Python.

The WebViewer is a port of the OpenWebGlobe SDK to Javascript/WebGL.

OpenWebGlobe SDK is created by the Geomatics Engineering departement at the
University of Applied Sciences Northwestern Switzerland.

http://wiki.openwebglobe.org/doku.php?id=webgl



Getting started
===============

WebViewer requires a modern web browser that supports WebGL.  There's a good
guide to finding one for your platform at <http://learningwebgl.com/blog/?p=11>.

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

1) Install Python (2.6 or 2.7) if you don't have it already. You can get python at http://www.python.org/

2) Go into the scripts directory and start 
"download_external.py". This will download all required external files.

It will also download a project file and some integration macros for the "Komodo Editor or IDE".
You can get Komodo editor here: http://www.activestate.com/komodo-edit


License
=======

The i3D OpenWebGlobe SDK is

Copyright (c) 2011 University of Applied Sciences Northwestern Switzerland.
Institute of Geomatics Engineering.

See the file `LICENSE` for details.

