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
 * @description Internal function to create an ID for a new object
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
 * @description Internal factory function to create an OpenWebGlobeObject
 * @param {number} type the object type
 * @param {ogObject} parent the parent object or null
 * @param {Object} options the object specific options
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
      newobject.ParseOptions(options);
   }
   
   return newobject;
}

//------------------------------------------------------------------------------
// ** OBJECT **
//------------------------------------------------------------------------------
/**
 * @description Retrieve object type
 * @param {number} object_id the object id
 * @returns {number} the object type, for example OG_OBJECT_CONTEXT
 */
function ogGetObjectType(object_id)
{
   var obj = _GetObjectFromId(object_id);
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
/**
 * @description Retrieve object name
 * @param {number} object_id the object id
 * @returns {string} the object name
 */
function ogGetObjectName(object_id)
{
   var obj = _GetObjectFromId(object_id);
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
/**
 * @description Get number of objects
 * @returns {number} the total number of openwebglobe objects
 */
function ogGetNumObjects()
{
   return _GetNumObjects();
}
goog.exportSymbol('ogGetNumObjects', ogGetNumObjects);
//------------------------------------------------------------------------------
/**
 * @description Get the OpenWebGlobe object at specified index
 * @param {number} index the index
 * @returns {number} the id of the object or -1 if there is none.
 */
function ogGetObjectAt(index)
{
   var object = _GetObjectAt(index);
   if (object == null)
   {
      return -1; 
   }
   else
   {
      return object.id;
   }
}
goog.exportSymbol('ogGetObjectAt', ogGetObjectAt);

//------------------------------------------------------------------------------
/**
 * @description Get parent object
 * @param {number} object_id the id of the object
 * @returns {number} the id of the parent object or -1 if there is none.
 */
function ogGetParentObject(object_id)
{
   var obj = _GetObjectFromId(object_id);
   if (obj)
   {
      if (obj.parent)
      {
         return obj.parent.id;
      }
   }
   
   return -1;
}
goog.exportSymbol('ogGetParentObject', ogGetParentObject);

//------------------------------------------------------------------------------
/**
 * @description Set object name
 * @param {number} object_id the id of the object
 * @param {string} name the custom object name
 */
function ogSetObjectName(object_id, name)
{
   var obj = _GetObjectFromId(object_id);
   if (obj)
   {
      obj.name = name;
   }
}
goog.exportSymbol('ogSetObjectName', ogSetObjectName);
//------------------------------------------------------------------------------
/**
 * @description Retrieve object id from name
 * @param {string} name object name
 * @returns {number} object_id the id of the object or -1 if not found
 */
function ogGetObjectByName(name)
{
   var obj = _GetObjectByName(name);
   if (obj)
   {
      return obj.id;
   }
   
   return -1;
}
goog.exportSymbol('ogGetObjectByName', ogGetObjectByName);
//------------------------------------------------------------------------------
/**
 * @description Get object status (useful for asynchronous objects)
 * @param {number} object_id the id of the object
 * @returns {number} status, OG_OBJECT_READY, OG_OBJECT_BUSY or OG_OBJECT_FAILED
 */
function ogGetObjectStatus(object_id)
{
   var obj = _GetObjectFromId(object_id);
   if (obj)
   {
      return obj.status;
   }
   
   return OG_OBJECT_FAILED;
}
goog.exportSymbol('ogSetObjectName', ogSetObjectName);
//------------------------------------------------------------------------------
/**
 * @description Set function to call when object is ready (usefull for async objects only)
 * @param {number} object_id the id of the object
 * @param {function(number)} cbfReady the function to call (1 parameter: object_id)
 */
function ogOnLoad(object_id, cbfReady)
{
   var obj = _GetObjectFromId(object_id);
   if (obj)
   {
      if (obj.status == OG_OBJECT_READY)
      {
         cbfReady(object_id);
      }
      else
      {
         obj.cbfReady = cbfReady;
      }
   }
}
goog.exportSymbol('ogOnLoad', ogOnLoad);
//------------------------------------------------------------------------------
/**
 * @description Set function to call when object creation failed (usfaull for async objects only)
 * @param {number} object_id the id of the object
 * @param {function(number)} cbfFailed the function to call (1 parameter: object_id)
 */
function ogOnFailure(object_id, cbfFailed)
{
   var obj = _GetObjectFromId(object_id);
   if (obj)
   {
      if (obj.status == OG_OBJECT_FAILED)
      {
         cbfFailed(object_id);
      }
      else
      {
         obj.cbfFailed = cbfFailed;
      }
   }
}
goog.exportSymbol('ogOnFailure', ogOnFailure);
//------------------------------------------------------------------------------
// ** CONTEXT OBJECT **
//------------------------------------------------------------------------------
/**
 * @description Create context
 * @param {Object} contextoptions options for context creation
 * @param {function(number)} cbfInit the callback function, called after context is initialized
 * @param {function(number)} cbfExit the callback function, called before context is destroyed
 * @param {function(number,number,number)} cbfResize the callback function, called when size of context changes
 * @returns {number} the context id
 */
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
/**
 * @description Convienience function to create context
 * @param {string} sCanvasId id of the HTML5 Canvas object
 * @param {boolean} fullscreen true, if canvas should fill all browser window
 * @param {function(number)} cbfInit the callback function, called after context is initialized
 * @param {function(number)} cbfExit the callback function, called before context is destroyed
 * @param {function(number,number,number)} cbfResize the callback function, called when size of context changes
 * @returns {number} the context id
 */
function ogCreateContextFromCanvas(sCanvasId, fullscreen, cbfInit, cbfExit, cbfResize)
{
   var contextoptions = {};
   if (fullscreen)
   {
      contextoptions.fullscreen = true;
   }
   else
   {
      contextoptions.fullscreen = false;
   }
   
   contextoptions.canvas = sCanvasId;
   return ogCreateContext(contextoptions, cbfInit, cbfExit, cbfResize);
}
goog.exportSymbol('ogCreateContextFromCanvas', ogCreateContextFromCanvas);
//------------------------------------------------------------------------------
/**
 * @description Get width of context
 * @param {number} context_id id of the context
 * @returns {number} width of the context or 0 if not found.
 */
function ogGetWidth(context_id)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      return obj.GetWidth();
   }
   
   return 0;
}
goog.exportSymbol('ogGetWidth', ogGetWidth);
//------------------------------------------------------------------------------
/**
 * @description Get height of context
 * @param {number} context_id id of the context
 * @returns {number} height of the context or 0 if not found
 */
function ogGetHeight(context_id)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      return obj.GetHeight();
   }
   
   return 0;
}
goog.exportSymbol('ogGetHeight', ogGetHeight);
//------------------------------------------------------------------------------
/**
 * @description Get the scene attached to the context
 * @param {number} context_id id of the context
 * @returns {number} id of the scene or -1 if there is none.
 */
function ogGetScene(context_id)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      if (obj.scene)
      {
         return obj.scene.id;
      }
   }

   return -1; 
}
goog.exportSymbol('ogGetScene', ogGetScene);
//------------------------------------------------------------------------------

function ogExec()
{
   // in JavaScript ogExec is not required. This function is just empty
}
goog.exportSymbol('ogExec', ogExec);
//------------------------------------------------------------------------------











