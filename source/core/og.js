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

goog.require('owg.ObjectDefs');
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

goog.require('goog.debug.Logger');

//------------------------------------------------------------------------------
//* @ignore
var _g_ogobjID = -1;
//------------------------------------------------------------------------------
/**
 * @description Internal function to cerate an ID for a new object
 * @returns {number} id
 * @ignore
 */
function _CreateID()
{
   _g_ogobjID++;
   return _g_ogobjID;
}
//------------------------------------------------------------------------------
/**
 * @description Factory: Internal function to Create an OpenWebGlobeObject
 * @param {number} type the object type
 * @ignore
 */
function _CreateObject(type, parent, options)
{
   var newobject = null;
   
   switch(type)
   {
      case OG_OBJECT_CONTEXT:
         newobject = new ogContext();
         break;
      case OG_OBJECT_SCENE:
         newobject = new ogScene();
         break;
      case OG_OBJECT_WORLD:
         newobject = new ogWorld();
         break;
      case OG_OBJECT_IMAGELAYER:
         newobject = new ogImageLayer();
         break;
      case OG_OBJECT_ELEVATIONLAYER:
         newobject = new ogElevationLayer();
         break;
      case OG_OBJECT_WAYPOINTLAYER:
         // not available yet...
         break;
      case OG_OBJECT_POILAYER:
         // not available yet...
         break;
      case OG_OBJECT_GEOMETRYLAYER:
         // not available yet...
         break;
      case OG_OBJECT_VOXELLAYER:
         // not available yet...
         break;
      case OG_OBJECT_IMAGE:
         // not available yet...
         break;
      case OG_OBJECT_TEXTURE:
         break;
      case OG_OBJECT_PIXELBUFFER:
         // not available yet...
         break;
      case OG_OBJECT_GEOMETRY:
         // not available yet...
         break;
      case OG_OBJECT_MESH:
         // not available yet...
         break;
      case OG_OBJECT_SURFACE:
         // not available yet...
         break;
      case OG_OBJECT_CAMERA:
          newobject = new ogCamera();
         break;
      case OG_OBJECT_TEXT:
         // not available yet...
         break;
      case OG_OBJECT_BINARYDATA:
         // not available yet (JSON data and not "binary")
         break;
      case OG_OBJECT_LIGHT:
         // not available yet...
         break;
      case OG_OBJECT_NAVIGATIONCONTROLLER:
         // not available yet...
         break;
      case OG_OBJECT_INVALID:
         // invalid object! can't be created!!
         goog.debug.Logger.getLogger('owg.OpenWebGlobe').warning("** WARNING: Trying to create an invalid object!");
         return null;
         break;
      default:
         goog.debug.Logger.getLogger('owg.OpenWebGlobe').warning("** WARNING: Can't create object. Wrong type!");
         return null;
   }
   
   if (newobject != null)
   {
      newobject.SetId(_CreateID());
      newobject.SetParent(parent);
      newobject.RegisterObject();
      newobject.SetOptions(options);
   }
   
   return newobject;
}

//------------------------------------------------------------------------------
/**
 * @description Factory: Internal function to Destroy an OpenWebGlobeObject
 * @param {number} type the object type
 * @ignore
 */
_DestroyObject = function(obj)
{
   
}

//------------------------------------------------------------------------------
// OBJECT UTILS:
//------------------------------------------------------------------------------

function ogGetObjectType(object)
{
   var obj = _GetObjectFromId(object);
   if (obj)
   {
      return obj.type;
   }
   else
   {
      return OG_OBJECT_INVALID;
   }
   //return object.GetType();   
}
goog.exportSymbol('ogGetObjectType', ogGetObjectType);

//------------------------------------------------------------------------------
function ogGetObjectName(object)
{
   var obj = _GetObjectFromId(object);
   if (obj)
   {
      return obj.name;
   }
   else
   {
      return "";
   }
}
goog.exportSymbol('ogGetObjectName', ogGetObjectName);

//------------------------------------------------------------------------------
// FUBCTIONS FOR CONTEXT OBJECTS:
//------------------------------------------------------------------------------

function ogCreateContext(contextoptions, cbfInit, cbfExit, cbfResize)
{
   var context = _CreateObject(OG_OBJECT_CONTEXT, null, contextoptions);
   if (context != null)
   {
      return context.id;
   }
   return -1;
}
goog.exportSymbol('ogCreateContext', ogCreateContext);

//------------------------------------------------------------------------------

function ogCreateContextFromCanvas(sCanvasId, fullscreen, cbfInit, cbfExit, cbfResize)
{
   contextoptions = {};
   if (fullscreen)
   {
      contextoptions.fullscreen = true;
   }
   else
   {
      contextoptions.fullscreen = false;
   }
   
   var context = _CreateObject(OG_OBJECT_CONTEXT, null, contextoptions);
   if (context != null)
   {
      return context.id;
   }
   return -1;
}
goog.exportSymbol('ogCreateContextFromCanvas', ogCreateContextFromCanvas);

//------------------------------------------------------------------------------

function ogCreateRenderWindow(title, width, height)
{
   
}
goog.exportSymbol('ogCreateRenderWindow', ogCreateRenderWindow);

//------------------------------------------------------------------------------

function ogGetWidth()
{
   
}
goog.exportSymbol('ogGetWidth', ogGetWidth);

//------------------------------------------------------------------------------

function ogGetHeight()
{
   
}
goog.exportSymbol('ogGetHeight', ogGetHeight);

//------------------------------------------------------------------------------

function ogGetScene(context)
{
   
}
goog.exportSymbol('ogGetScene', ogGetScene);

//------------------------------------------------------------------------------

function ogExec()
{
   // in JavaScript ogExec is not required. This function is
}
goog.exportSymbol('ogExec', ogExec);

//------------------------------------------------------------------------------

