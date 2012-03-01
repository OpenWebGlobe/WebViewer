/*******************************************************************************
#      ____               __          __  _      _____ _       _               #
#     / __ \              \ \        / / | |    / ____| |     | |              #
#    | |  | |_ __   ___ _ __ \  /\  / /__| |__ | |  __| | ___ | |__   ___      #
#    | |  | | '_ \ / _ \ '_ \ \/  \/ / _ \ '_ \| | |_ | |/ _ \| '_ \ / _ \     #
#    | |__| | |_) |  __/ | | \  /\  /  __/ |_) | |__| | | (_) | |_) |  __/     #
#     \____/| .__/ \___|_| |_|\/  \/ \___|_.__/ \_____|_|\___/|_.__/ \___|     #
#           | |                                                                #
#           |_|                 _____ _____  _  __                             #
#                              / ____|  __ \| |/ /                             #
#                             | (___ | |  | | ' /                              #
#                              \___ \| |  | |  <                               #
#                              ____) | |__| | . \                              #
#                             |_____/|_____/|_|\_\                             #
#                                                                              #
#                              (c) 2010-2011 by                                #
#           University of Applied Sciences Northwestern Switzerland            #
#                     Institute of Geomatics Engineering                       #
#                           martin.christen@fhnw.ch                            #
********************************************************************************
*     Licensed under MIT License. Read the file LICENSE for more information   *
*******************************************************************************/


goog.provide('owg.ObjectDefs');

//------------------------------------------------------------------------------
// OBJECT TYPES
//------------------------------------------------------------------------------
//* @constant
var OG_OBJECT_CONTEXT               = 0;
//* @constant
var OG_OBJECT_SCENE                 = 1;
//* @constant
var OG_OBJECT_WORLD                 = 2;
//* @constant
var OG_OBJECT_IMAGELAYER            = 3;
//* @constant
var OG_OBJECT_ELEVATIONLAYER        = 4;
//* @constant
var OG_OBJECT_WAYPOINTLAYER         = 5;
//* @constant
var OG_OBJECT_POILAYER              = 6;
//* @constant
var OG_OBJECT_GEOMETRYLAYER         = 7;
//* @constant
var OG_OBJECT_VOXELLAYER            = 8;
//* @constant
var OG_OBJECT_IMAGE                 = 9;
//* @constant
var OG_OBJECT_TEXTURE               = 10;
//* @constant
var OG_OBJECT_PIXELBUFFER           = 11;
//* @constant
var OG_OBJECT_GEOMETRY              = 12;
//* @constant
var OG_OBJECT_MESH                  = 13;
//* @constant
var OG_OBJECT_SURFACE               = 14;
//* @constant
var OG_OBJECT_CAMERA                = 15;
//* @constant
var OG_OBJECT_TEXT                  = 16;
//* @constant
var OG_OBJECT_BINARYDATA            = 17;
//* @constant
var OG_OBJECT_LIGHT                 = 18;
//* @constant
var OG_OBJECT_NAVIGATIONCONTROLLER  = 19;
//* @constant
var OG_OBJECT_POI                   = 20;
//* @constant
var OG_OBJECT_BILLBOARD             = 21;
//* @constant
var OG_OBJECT_BILLBOARDLAYER        = 22;

//* @constant
var OG_OBJECT_AOEIMAGELAYER         = 65533;
//* @constant
var OG_OBJECT_AOEIMAGE              = 65534;
//* @constant
var OG_OBJECT_POINTSPRITE           = 23;
//* @constant
var OG_OBJECT_EARTHPOLYLINE         = 24;
//* @constant
var OG_OBJECT_INVALID               = 65535;

//* @constant
var OG_RENDEREFFECT_RGB             = 0;
//* @constant
var OG_RENDEREFFECT_CHROMADEPTH     = 1;

goog.exportSymbol('OG_OBJECT_CONTEXT', OG_OBJECT_CONTEXT);
goog.exportSymbol('OG_OBJECT_SCENE', OG_OBJECT_SCENE);
goog.exportSymbol('OG_OBJECT_WORLD', OG_OBJECT_WORLD);
goog.exportSymbol('OG_OBJECT_IMAGELAYER', OG_OBJECT_IMAGELAYER);
goog.exportSymbol('OG_OBJECT_ELEVATIONLAYER', OG_OBJECT_ELEVATIONLAYER);
goog.exportSymbol('OG_OBJECT_WAYPOINTLAYER', OG_OBJECT_WAYPOINTLAYER);
goog.exportSymbol('OG_OBJECT_GEOMETRYLAYER', OG_OBJECT_GEOMETRYLAYER);
goog.exportSymbol('OG_OBJECT_VOXELLAYER', OG_OBJECT_VOXELLAYER);
goog.exportSymbol('OG_OBJECT_IMAGE', OG_OBJECT_IMAGE);
goog.exportSymbol('OG_OBJECT_TEXTURE', OG_OBJECT_TEXTURE);
goog.exportSymbol('OG_OBJECT_PIXELBUFFER', OG_OBJECT_PIXELBUFFER);
goog.exportSymbol('OG_OBJECT_GEOMETRY', OG_OBJECT_GEOMETRY);
goog.exportSymbol('OG_OBJECT_MESH', OG_OBJECT_MESH);
goog.exportSymbol('OG_OBJECT_SURFACE', OG_OBJECT_SURFACE);
goog.exportSymbol('OG_OBJECT_CAMERA', OG_OBJECT_CAMERA);
goog.exportSymbol('OG_OBJECT_TEXT', OG_OBJECT_TEXT);
goog.exportSymbol('OG_OBJECT_BINARYDATA', OG_OBJECT_BINARYDATA);
goog.exportSymbol('OG_OBJECT_LIGHT', OG_OBJECT_LIGHT);
goog.exportSymbol('OG_OBJECT_NAVIGATIONCONTROLLER', OG_OBJECT_NAVIGATIONCONTROLLER);
goog.exportSymbol('OG_OBJECT_POI', OG_OBJECT_POI);
goog.exportSymbol('OG_OBJECT_BILLBOARD', OG_OBJECT_BILLBOARD);
goog.exportSymbol('OG_OBJECT_BILLBOARDLAYER', OG_OBJECT_BILLBOARDLAYER);
goog.exportSymbol('OG_OBJECT_AOEIMAGELAYER', OG_OBJECT_AOEIMAGELAYER);
goog.exportSymbol('OG_OBJECT_AOEIMAGE', OG_OBJECT_AOEIMAGE);
goog.exportSymbol('OG_OBJECT_INVALID', OG_OBJECT_INVALID);
goog.exportSymbol('OG_RENDEREFFECT_RGB', OG_RENDEREFFECT_RGB);
goog.exportSymbol('OG_RENDEREFFECT_CHROMADEPTH', OG_RENDEREFFECT_CHROMADEPTH);

//------------------------------------------------------------------------------
// SCENE TYPES
//------------------------------------------------------------------------------

//* @constant
var OG_SCENE_3D_ELLIPSOID_WGS84     = 1;
//* @constant
var OG_SCENE_3D_FLAT_CARTESIAN      = 2;
//* @constant
var OG_SCENE_2D_SCREEN              = 3;
//* @constant
var OG_SCENE_CUSTOM                 = 4;

goog.exportSymbol('OG_SCENE_3D_ELLIPSOID_WGS84', OG_SCENE_3D_ELLIPSOID_WGS84);
goog.exportSymbol('OG_SCENE_3D_FLAT_CARTESIAN', OG_SCENE_3D_FLAT_CARTESIAN);
goog.exportSymbol('OG_SCENE_2D_SCREEN', OG_SCENE_2D_SCREEN);
goog.exportSymbol('OG_SCENE_CUSTOM', OG_SCENE_CUSTOM);


//------------------------------------------------------------------------------
// OBJECT STATUS
//------------------------------------------------------------------------------

//* @constant
var OG_OBJECT_READY     = 1;
//* @constant
var OG_OBJECT_BUSY      = 2;
//* @constant
var OG_OBJECT_FAILED    = 3;

goog.exportSymbol('OG_OBJECT_READY', OG_OBJECT_READY);
goog.exportSymbol('OG_OBJECT_BUSY', OG_OBJECT_BUSY);
goog.exportSymbol('OG_OBJECT_FAILED', OG_OBJECT_FAILED);



