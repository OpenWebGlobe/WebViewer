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


Windows
-------

1. Download the latest version of the Closure Compiler from
<http://closure-compiler.googlecode.com/files/compiler-latest.zip> and unzip
it in `external\closure`.

2. Change directory to `external` and check out the latest version of the
Closure Library with the command
    svn checkout http://closure-library.googlecode.com/svn/trunk/ closure-library

2. Change directory to `scripts` and run `compile.bat`.


Linux
-----

1. Change directory to `scripts` and run `make`.  This will download the Closure
Compiler and Library (if required) and compile WebViewer.



License
=======

The i3D OpenWebGlobe SDK is

Copyright (c) 2011 University of Applied Sciences Northwestern Switzerland.
Institute of Geomatics Engineering.

See the file `LICENSE` for details.

