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
var OG_OBJECT_INVALID               = 65535;


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

