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

goog.provide('owg.OpenWebGlobe');

goog.require('owg.ogObject');
goog.require('owg.ogContext');
goog.require('owg.ogCamera');
goog.require('owg.ogImage');
goog.require('owg.ogScene');
goog.require('owg.ogTexture');
goog.require('owg.ogWorld');
goog.require('owg.ogNavigationController');

goog.require('owg.ogImageLayer');
goog.require('owg.ogElevationLayer');

//------------------------------------------------------------------------------

var OG_OBJECT_CONTEXT = 0;
var OG_OBJECT_SCENE = 1;          
var OG_OBJECT_WORLD = 2;            
var OG_OBJECT_IMAGELAYER = 3;       
var OG_OBJECT_ELEVATIONLAYER = 4;   
var OG_OBJECT_WAYPOINTLAYER = 5;    
var OG_OBJECT_POILAYER = 6;         
var OG_OBJECT_GEOMETRYLAYER = 7;    
var OG_OBJECT_VOXELLAYER = 8;       
var OG_OBJECT_IMAGE = 9;            
var OG_OBJECT_TEXTURE = 10;          
var OG_OBJECT_PIXELBUFFER = 11;      
var OG_OBJECT_GEOMETRY = 12;         
var OG_OBJECT_MESH = 13;             
var OG_OBJECT_SURFACE = 14;          
var OG_OBJECT_CAMERA = 15;           
var OG_OBJECT_TEXT = 16;             
var OG_OBJECT_BINARYDATA = 17;       
var OG_OBJECT_LIGHT = 18;           
var OG_OBJECT_INVALID = 65535;

//------------------------------------------------------------------------------

function ogGetObjectType(object)
{
   //var obj = _getObject(object);
   //return object.GetType();   
}

//------------------------------------------------------------------------------
// FUBCTIONS FOR CONTEXT OBJECTS:
//------------------------------------------------------------------------------

function ogCreateContext(contextoptions, cbfInit, cbfExit, cbfResize)
{
   
}

//------------------------------------------------------------------------------

function ogCreateRenderWindow(title, width, height)
{
   
}

//------------------------------------------------------------------------------

function ogGetWidth()
{
   
}

//------------------------------------------------------------------------------

function ogGetHeight()
{
   
}

//------------------------------------------------------------------------------

function ogGetScene()
{
   
}

