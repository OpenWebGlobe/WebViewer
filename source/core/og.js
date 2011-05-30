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
goog.require('owg.ogMeshObject');
goog.require('owg.ogPOI');
goog.require('owg.ogSurface');
goog.require('owg.ogTexture');
goog.require('owg.ogPOILayer');
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
   /** @type {ogObject} */
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
         newobject = new ogPOILayer();
         break;
      case OG_OBJECT_GEOMETRYLAYER:
         // not available yet...
         break;
      case OG_OBJECT_VOXELLAYER:
         // not available yet...
         break;
      case OG_OBJECT_IMAGE:
         // probably not available in WebGL version -> use texture
         break;
      case OG_OBJECT_TEXTURE:
         newobject = new ogTexture();
         break;
      case OG_OBJECT_POI:
         newobject = new ogPOI();
         break;
      case OG_OBJECT_PIXELBUFFER:
         // not available yet...
         break;
      case OG_OBJECT_GEOMETRY:
         newobject = new ogGeometry();
         break;
      case OG_OBJECT_MESH:
         newobject = new ogMeshObject();
         break;
      case OG_OBJECT_SURFACE:
         newobject = new ogSurface();
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
goog.exportSymbol('_CreateObject', _CreateObject);
//##############################################################################
// ** GENERAL OBJECT FUNCTIONS **
//##############################################################################
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
goog.exportSymbol('ogGetObjectStatus', ogGetObjectStatus);
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
//##############################################################################
// ** CONTEXT OBJECT **
//##############################################################################
/**
 * @description Create context
 * @param {Object} contextoptions
 * @param {function()} cbfInit
 * @param {function()} cbfExit
 * @param {function()} cbfResize
 */
function ogCreateContext(contextoptions, cbfInit, cbfExit, cbfResize)
{
   contextoptions["cbfInit"] = cbfInit;
   contextoptions["cbfExit"] = cbfExit;
   contextoptions["cbfResize"] = cbfResize;
   
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
 * @param {number} sCanvasId
 * @param {boolean} fullscreen
 * @param {function()} cbfInit
 * @param {function()} cbfExit
 * @param {function()} cbfResize
 */
function ogCreateContextFromCanvas(sCanvasId, fullscreen, cbfInit, cbfExit, cbfResize)
{
   var contextoptions = {};
   if (fullscreen)
   {
      contextoptions["fullscreen"] = true;
   }
   else
   {
      contextoptions["fullscreen"] = false;
   }
   
   contextoptions["canvas"] = sCanvasId;
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
   var context = _GetObjectFromId(context_id);
   if (context && context.type == OG_OBJECT_CONTEXT)
   {
      if (context.scene)
      {
         return context.scene.id;
      }
   }

   return -1; 
}
goog.exportSymbol('ogGetScene', ogGetScene);
//------------------------------------------------------------------------------
/**
 * @description Set background color
 * @param {number} context_id id of the context
 * @param {number} r red component [0,1]
 * @param {number} g green component [0,1]
 * @param {number} b blue component [0,1]
 * @param {number} a alpha component [0,1]
 */
function ogSetBackgroundColor(context_id, r, g, b, a)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      obj.SetBackgroundColor(r,g,b,a);
   }
}
goog.exportSymbol('ogSetBackgroundColor', ogSetBackgroundColor);
//------------------------------------------------------------------------------
/**
 * @description Set text color
 * @param {number} context_id id of the context
 * @param {number} r red component [0,1]
 * @param {number} g green component [0,1]
 * @param {number} b blue component [0,1]
 */
function ogSetTextColor(context_id, r, g, b)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      obj.SetTextColor(r,g,b);
   }
}
goog.exportSymbol('ogSetTextColor', ogSetTextColor);
//------------------------------------------------------------------------------
/**
 * @description Set text color
 * @param {number} context_id id of the context
 * @param {string} text The text to be drawn
 * @param {number} x x position (window coordinate)
 * @param {number} y y position (window coordinate)
 */
function ogDrawText(context_id, text, x, y)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      obj.DrawText(text, x, y);
   }
}
goog.exportSymbol('ogDrawText', ogDrawText);
//------------------------------------------------------------------------------
/**
 * @description Set text color
 * @param {number} context_id id of the context
 * @param {string} text The text to be drawn
 * @returns {Array} Array with 2 items 0: width, 1:height
 */
function ogGetTextSize(context_id, text)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      var result = obj.GetTextSize(text);
      if (result)
      {
         return result;
      }
   }
   
   var ret = new Array(2);
   ret[0] = 0;
   ret[1] = 0;
   return ret;
}
goog.exportSymbol('ogGetTextSize', ogGetTextSize);
//##############################################################################
// ** CONTEXT-EVENTS **
//##############################################################################
/**
 * @description Set callback function for mouse down event
 * @param {number} context_id id of the context
 * @param {function(number, number, number, number)} cbfMouseDown the callback function
 *
 * the callback function has the following params:
 *    1: context_id
 *    2: mouse button
 *    3: mouse x-coord
 *    4: mouse y-coord
 * 
 */
function ogSetMouseDownFunction(context_id, cbfMouseDown)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      obj.cbfMouseDown = cbfMouseDown;
   }
}
goog.exportSymbol('ogSetMouseDownFunction', ogSetMouseDownFunction);
//------------------------------------------------------------------------------
/**
 * @description Set callback function for mouse up event
 * @param {number} context_id id of the context
 * @param {function(number, number, number, number)} cbfMouseUp the callback function
 *
 *  the callback function has the following params:
 *    1: context_id
 *    2: mouse button
 *    3: mouse x-coord
 *    4: mouse y-coord
 */
function ogSetMouseUpFunction(context_id, cbfMouseUp)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      obj.cbfMouseUp = cbfMouseUp;
   } 
}
goog.exportSymbol('ogSetMouseUpFunction', ogSetMouseUpFunction);
//------------------------------------------------------------------------------
/**
 * @description Set callback function for mouse move event
 * @param {number} context_id id of the context
 * @param {function(number, number, number)} cbfMouseMove the callback function
 *
 *  the callback function has the following params:
 *    1: context_id
 *    2: mouse x-coord
 *    3: mouse y-coord
 */
function ogSetMouseMoveFunction(context_id, cbfMouseMove)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      obj.cbfMouseMove = cbfMouseMove;
   } 
}
goog.exportSymbol('ogSetMouseMoveFunction', ogSetMouseMoveFunction);
//------------------------------------------------------------------------------
/**
 * @description Set callback function for mouse wheel event
 * @param {number} context_id id of the context
 * @param {function(number, number)} cbfMouseWheel the callback function
 *
 *  the callback function has the following params:
 *    1: context_id
 *    2: positive or negative value, amount depends on mouse type or settings
 */
function ogSetMouseWheelFunction(context_id, cbfMouseWheel)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      obj.cbfMouseWheel = cbfMouseWheel;
   } 
}
goog.exportSymbol('ogSetMouseWheelFunction', ogSetMouseWheelFunction);
//------------------------------------------------------------------------------
/**
 * @description Set callback function for key down event
 * @param {number} context_id id of the context
 * @param {function(number, number)} cbfKeyDown the callback function
 *
 *  the callback function has the following params:
 *    1: context_id
 *    2: the key code.
 */
function ogSetKeyDownFunction(context_id, cbfKeyDown)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      obj.cbfKeyDown = cbfKeyDown;
   } 
}
goog.exportSymbol('ogSetKeyDownFunction', ogSetKeyDownFunction);
//------------------------------------------------------------------------------
/**
 * @description Set callback function for key up event
 * @param {number} context_id id of the context
 * @param {function(number, number)} cbfKeyUp the callback function
 *
 *  the callback function has the following params:
 *    1: context_id
 *    2: the key code.
 */
function ogSetKeyUpFunction(context_id, cbfKeyUp)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      obj.cbfKeyUp = cbfKeyUp;
   } 
}
goog.exportSymbol('ogSetKeyUpFunction', ogSetKeyUpFunction);
//------------------------------------------------------------------------------
/**
 * @description Set callback function for the resize event
 * @param {number} context_id id of the context
 * @param {function(number, number, number)} cbfResize the callback function
 *
 *  the callback function has the following params:
 *    1: context_id
 *    2: width
 *    3: height
 */
function ogSetResizeFunction(context_id, cbfResize)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      obj.cbfResize = cbfResize;
   } 
}
goog.exportSymbol('ogSetResizeFunction', ogSetResizeFunction);
//------------------------------------------------------------------------------
/**
 * @description Set callback function for the render event
 * @param {number} context_id id of the context
 * @param {function(number)} cbfRender the callback function
 *
 *  the callback function has the following params:
 *    1: context_id
 */
function ogSetRenderFunction(context_id, cbfRender)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      obj.cbfRender = cbfRender;
   } 
}
goog.exportSymbol('ogSetRenderFunction', ogSetRenderFunction);
//------------------------------------------------------------------------------
/**
 * @description Set callback function for the timer event
 * @param {number} context_id id of the context
 * @param {function(number,number)} cbfTimer the callback function
 *
 *  the callback function has the following params:
 *    1: context_id
 *    2: delta [ms]
 */
function ogSetTimerFunction(context_id, cbfTimer)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      obj.cbfTimer = cbfTimer;
   } 
}
goog.exportSymbol('ogSetTimerFunction', ogSetTimerFunction);
//------------------------------------------------------------------------------
/**
 * @description Set callback function for the render geometry event
 * @param {number} context_id id of the context
 * @param {function(number,number)} cbfGeometry the callback function
 *
 *  the callback function has the following params:
 *    1: mesh_id
 *    2: pass the render pass.
 */
function ogSetRenderGeometryFunction(context_id, cbfGeometry)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      obj.cbfGeometry = cbfGeometry;
   } 
}
goog.exportSymbol('ogSetRenderGeometryFunction', ogSetRenderGeometryFunction);
//------------------------------------------------------------------------------
/**
 * @description Set callback function for the begin render event
 * @param {number} context_id id of the context
 * @param {function(number,number)} cbfBeginRender the callback function
 *
 *  the callback function has the following params:
 *    1: scene_id
 *    2: pass - the render pass.
 */
function ogSetBeginRenderFunction(context_id, cbfBeginRender)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      obj.cbfBeginRender = cbfBeginRender;
   } 
}
goog.exportSymbol('ogSetBeginRenderFunction', ogSetBeginRenderFunction);
//------------------------------------------------------------------------------
/**
 * @description Set callback function for the end render event
 * @param {number} context_id id of the context
 * @param {function(number,number)} cbfEndRender the callback function
 *
 *  the callback function has the following params:
 *    1: scene_id
 *    2: pass - the render pass.
 */
function ogSetEndRenderFunction(context_id, cbfEndRender)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      obj.cbfEndRender = cbfEndRender;
   } 
}
goog.exportSymbol('ogSetEndRenderFunction', ogSetEndRenderFunction);
//------------------------------------------------------------------------------
/**
 * @description Set callback function for the end render event
 * @param {number} context_id id of the context
 * @param {number} numPasses number of render passes
 */
function ogSetNumRenderPasses(context_id, numPasses)
{
   var obj = _GetObjectFromId(context_id);
   if (obj && obj.type == OG_OBJECT_CONTEXT)
   {
      obj.numRenderPasses = numPasses;
   } 
}
goog.exportSymbol('ogSetNumRenderPasses', ogSetNumRenderPasses);
//##############################################################################
// ** MISC **
//##############################################################################
function ogExec()
{
   // in JavaScript ogExec is not required. This function is just empty.
}
goog.exportSymbol('ogExec', ogExec);
//##############################################################################
// ** SCENE-OBJECT **
//##############################################################################
/**
* @description create a new scene object
* @param {number} context_id the id of the context
* @param {number} scenetype the type of scene. This must be OG_SCENE_3D_ELLIPSOID_WGS84, OG_SCENE_3D_FLAT_CARTESIAN, OG_SCENE_2D_SCREEN, or OG_SCENE_CUSTOM
* @returns {number} the scene or -1 if failed
*/
function ogCreateScene(context_id, scenetype)
{
   // test if context_id is a valid context
   var context = _GetObjectFromId(context_id);
   if (context && context.type == OG_OBJECT_CONTEXT)
   {
      var sceneoptions = {};
      sceneoptions["type"] = scenetype;
      
      if (scenetype == OG_SCENE_3D_ELLIPSOID_WGS84 ||
          scenetype == OG_SCENE_3D_FLAT_CARTESIAN ||
          scenetype == OG_SCENE_2D_SCREEN ||
          scenetype == OG_SCENE_CUSTOM
          )
      {
         /** @type {ogScene} */
         var scene = _CreateObject(OG_OBJECT_SCENE, context, sceneoptions);
         context.scene = scene;
         return scene.id;
      }
      else
      {
         goog.debug.Logger.getLogger('owg.og').warning("** WARNING: wrong scene type");
         return -1; // wrong scene type
      }
   }
   
   goog.debug.Logger.getLogger('owg.og').warning("** WARNING: context is not valid");
   return -1;

}
goog.exportSymbol('ogCreateScene', ogCreateScene);
//------------------------------------------------------------------------------
/** @description get the context object of the specified scene
*   @param {number} scene_id the scene
*   @returns {number} the context object or -1 if there is none
*/
function ogGetContext(scene_id)
{
   /** @type {ogScene} */
   var scene = /** @type {ogScene} */ _GetObjectFromId(scene_id);
   if (scene && scene.type == OG_OBJECT_SCENE)
   {
      /** @type {ogContext} */
      var context = /** @type {ogContext} */ scene.parent;
      if (context)
      {
         return context.id;
      }
   }
   
   return -1;
}
goog.exportSymbol('ogGetContext', ogGetContext);
//------------------------------------------------------------------------------
/** @description get the world object of the specified scene
*   @param {number} scene_id the scene
*   @returns {number} the world object or -1 if there is none
*/
function ogGetWorld(scene_id)
{
   /** @type {ogScene} */
   var scene =  /** @type {ogScene} */ _GetObjectFromId(scene_id);
   if (scene && scene.type == OG_OBJECT_SCENE)
   {
      /** @type {ogWorld} */
      var world = scene.world;
      if (world)
      {
         return world.id;
      }
   }
   
   return -1;
}
goog.exportSymbol('ogGetWorld', ogGetWorld);
//------------------------------------------------------------------------------
/** @description Pick globe. This only works if scene type is OG_SCENE_3D_ELLIPSOID_WGS84 
*   @param {number} scene_id the scene
*   @param {number} mx x-coord of mouse
*   @param {number} my y-coord of mouse
*   @returns {Array} array with [hit, lng, lat, elv]. If hit is false there was no pick.
*/
function ogPickGlobe(scene_id, mx, my)
{
   /** @type {ogScene} */
   var scene = /** @type {ogScene} */ _GetObjectFromId(scene_id);
   if (scene && scene.type == OG_OBJECT_SCENE && scene.scenetype == OG_SCENE_3D_ELLIPSOID_WGS84)
   {
      return scene.Pick(mx, my);
   }
   
   return [false,0,0,0];
}
goog.exportSymbol('ogPickGlobe', ogPickGlobe);
//------------------------------------------------------------------------------
//##############################################################################
// ** WORLD-OBJECT **
//##############################################################################
/** @description create world object
*   @param {number} scene_id the scene
*   @returns {number} the world id
*/
function ogCreateWorld(scene_id)
{
   /** @type {ogScene} */
   var scene = /** @type {ogScene} */ _GetObjectFromId(scene_id);
   if (scene && scene.type == OG_OBJECT_SCENE)
   {
      var worldoptions = {};
      worldoptions["scenetype"] = scene.scenetype;
      var world = _CreateObject(OG_OBJECT_WORLD, scene, worldoptions);
      return world.id;
   }
   
   return -1;
}
goog.exportSymbol('ogCreateWorld', ogCreateWorld);
//------------------------------------------------------------------------------
/** @description create globe (WGS84 world)
*   @param {number} context_id the context
*   @returns {number} the world object (globe)
*/
function ogCreateGlobe(context_id)
{
   // this is just a convienience function to save some typing.
   var scene_id = ogCreateScene(context_id, OG_SCENE_3D_ELLIPSOID_WGS84);
   var world_id = ogCreateWorld(scene_id);
   return world_id;
}
goog.exportSymbol('ogCreateGlobe', ogCreateGlobe);

//##############################################################################
// ** TEXTURE-OBJECT **
//##############################################################################
/** @description load a texture in background
*   @param {number} scene_id the scene
*   @param {string} url the url of the image
*   @returns {number} the texture id
*/
function ogLoadTextureAsync(scene_id, url)
{
   /** @type {ogScene} */
   var scene =  /** @type {ogScene} */ _GetObjectFromId(scene_id);
   if (scene && scene.type == OG_OBJECT_SCENE)
   {
      var textureoptions = {};
      textureoptions.url = url;
      var texture = _CreateObject(OG_OBJECT_TEXTURE, scene, textureoptions);
      return texture.id;
   }
   return -1;
}
goog.exportSymbol('ogLoadTextureAsync', ogLoadTextureAsync);

//------------------------------------------------------------------------------
/** @description destroy texture (free all memory)
*   @param {number} texture_id the texture to be destroyed
*/
function ogDestroyTexture(texture_id)
{
   /** @type {ogTexture} */
   var texture = /** @type {ogTexture} */ _GetObjectFromId(texture_id);
   if (texture && texture.type == OG_OBJECT_TEXTURE)
   {
      texture.UnregisterObject();
   }
}
goog.exportSymbol('ogDestroyTexture', ogDestroyTexture);
//------------------------------------------------------------------------------
/**
 * @description Blit texture to screen (2D)
 * @param {number} texture_id the texture id
 * @param {number} x x-coord
 * @param {number} y y-coord
 * @param {Object=} opt_options optional options for blitting (rotation, scale, etc.)
 */
function ogBlitTexture(texture_id, x, y, opt_options)
{
   //** @type {ogTexture}
   var texture = _GetObjectFromId(texture_id);
   
   if (texture && texture.type == OG_OBJECT_TEXTURE)
   {
      texture.Blit(x,y,opt_options);
   }
}
goog.exportSymbol('ogBlitTexture', ogBlitTexture);
//------------------------------------------------------------------------------
//##############################################################################
// ** IMAGE LAYER-OBJECT **
//##############################################################################
/**
* @description Add an image layer to the globe
* @param {number} world_id
* @param {ImageLayerOptions} options
*/
function ogAddImageLayer(world_id, options)
{
   // test if context_id is a valid context
   var world = _GetObjectFromId(world_id);
   if (world && world.type == OG_OBJECT_WORLD)
   {
      var imagelayer = _CreateObject(OG_OBJECT_IMAGELAYER, world, options);
      return imagelayer.id;
   }
   
   return -1;

}
goog.exportSymbol('ogAddImageLayer', ogAddImageLayer);
//------------------------------------------------------------------------------
/**
* @description Remove image layer from globe
* @param {number} layer_id
*/
function ogRemoveImageLayer(layer_id)
{
   // test if context_id is a valid image layer
   // @type {ogImageLayer}
   var layer = _GetObjectFromId(layer_id);
   if (layer && layer.type == OG_OBJECT_IMAGELAYER)
   {
      layer.RemoveImageLayer();
      layer.UnregisterObject();
   }
}
goog.exportSymbol('ogRemoveImageLayer', ogRemoveImageLayer);
//------------------------------------------------------------------------------
//##############################################################################
// ** ELEVATION LAYER-OBJECT **
//##############################################################################
/**
* @description Add an elevation layer to the globe
* @param {number} world_id
* @param {ElevationLayerOptions} options
*/
function ogAddElevationLayer(world_id, options)
{
   // test if context_id is a valid context
   var world = _GetObjectFromId(world_id);
   if (world && world.type == OG_OBJECT_WORLD)
   {
      var elevationlayer = _CreateObject(OG_OBJECT_ELEVATIONLAYER, world, options);
      return elevationlayer.id;
   }
   
   return -1;

}
goog.exportSymbol('ogAddElevationLayer', ogAddElevationLayer);
//------------------------------------------------------------------------------
/**
* @description Remove elevation layer from globe
* @param {number} layer_id
*/
function ogRemoveElevationLayer(layer_id)
{
   // test if context_id is a valid elevation layer
   // @type {ogElevationLayer}
   var layer = _GetObjectFromId(layer_id);
   if (layer && layer.type == OG_OBJECT_ELEVATIONLAYER)
   {
      layer.RemoveImageLayer();
      layer.UnregisterObject();
   }
}
goog.exportSymbol('ogRemoveElevationLayer', ogRemoveElevationLayer);
//------------------------------------------------------------------------------
//##############################################################################
// ** POI OBJECT **
//##############################################################################
//------------------------------------------------------------------------------
/**
* @description Create a POI
* @param {number} scene_id
* @param {PoiOptions} options
* @returns {number} poi_id
*/
function ogCreatePOI(scene_id, options)
{
   // test if scene_id is a valid scene
   var scene = /** @type {ogScene} */ _GetObjectFromId(scene_id);
   if (scene && scene.type == OG_OBJECT_SCENE)
   {
      var POI = _CreateObject(OG_OBJECT_POI, scene, options);
      return POI.id;
   }
   
   return -1;
}
goog.exportSymbol('ogCreatePOI', ogCreatePOI);
//------------------------------------------------------------------------------
/**
 * @description Destroy POI, free all memory
 * @param {number} poi_id the POI to be destroyed
 */
function ogDestroyPOI(poi_id)
{
   // test if scene_id is a valid scene
   var POI = _GetObjectFromId(poi_id);
   if (POI && POI.type == OG_OBJECT_POI)
   {
      POI.UnregisterObject();
   }
}
goog.exportSymbol('ogDestroyPOI', ogDestroyPOI);
//------------------------------------------------------------------------------
/**
 * @description Change text of POI
 * @param {number} poi_id the POI
 * @param {string} text
 */
function ogChangePOIText(poi_id, text)
{
   var POI = /** @type {ogPOI} */ _GetObjectFromId(poi_id);
   if (POI && POI.type == OG_OBJECT_POI)
   {
      POI.ChangeText(text);
   }
}
goog.exportSymbol('ogChangePOIText', ogChangePOIText);
//------------------------------------------------------------------------------
/**
 * @description Change POI Icon
 * @param {number} poi_id the POI
 */
function ogChangePOIIcon(poi_id, url)
{
   var POI = /** @type {ogPOI} */ _GetObjectFromId(poi_id);
   if (POI && POI.type == OG_OBJECT_POI)
   {
      POI.ChangeIcon(url);
   }
}
goog.exportSymbol('ogChangePOIIcon', ogChangePOIIcon);
//------------------------------------------------------------------------------
/**
 * @description Change POI Size
 * @param {number} poi_id the POI
 * @param {number} size the new size
 */
function ogChangePOISize(poi_id, size)
{
   var POI = /** @type {ogPOI} */ _GetObjectFromId(poi_id);
   if (POI && POI.type == OG_OBJECT_POI)
   {
      POI.ChangeSize(size);
   }
}
goog.exportSymbol('ogChangePOISize', ogChangePOISize);
//------------------------------------------------------------------------------
/**
 * @description Change POI Positions
 * @param {number} poi_id the POI
 * @param {number} lng Longitude
 * @param {number} lat Latitude
 * @param {number} elv Elevation
 */
function ogChangePOIPosition(poi_id, lng, lat, elv)
{
   var POI = /** @type {ogPOI} */ _GetObjectFromId(poi_id);
   if (POI && POI.type == OG_OBJECT_POI)
   {
      POI.ChangePosition(lng, lat, elv);
   }
}
goog.exportSymbol('ogChangePOIPosition', ogChangePOIPosition);
//------------------------------------------------------------------------------
/**
 * @description Hide POI
 * @param {number} poi_id the POI
 */
function ogHidePOI(poi_id)
{
   var POI = /** @type ogPOI */ _GetObjectFromId(poi_id);
   if (POI && POI.type == OG_OBJECT_POI)
   {
      POI.Hide();
   }
}
goog.exportSymbol('ogHidePOI', ogHidePOI);
//------------------------------------------------------------------------------
/**
 * @description Show previously hidden POI
 * @param {number} poi_id the POI
 */
function ogShowPOI(poi_id)
{
   var POI = /** @type {ogPOI} */ _GetObjectFromId(poi_id);
   if (POI && POI.type == OG_OBJECT_POI)
   {
      POI.Show();
   }
}
goog.exportSymbol('ogShowPOI', ogShowPOI);
//------------------------------------------------------------------------------
/**
 * @description Show previously hidden POI
 * @param {number} poi_id the POI
 * @param {number} r active color red value
 * @param {number} g active color blue value
 * @param {number} b active color green value
 * @param {number} a active color alpha value
 */
function ogSetPOIActiveColor(poi_id,r,g,b,a)
{
   var POI = /** @type {ogPOI} */ _GetObjectFromId(poi_id);
   if (POI && POI.type == OG_OBJECT_POI)
   {
      POI.SetActiveColor(r,g,b,a);
   }
}
goog.exportSymbol('ogSetPOIActiveColor', ogSetPOIActiveColor);
//------------------------------------------------------------------------------
/** @description Pick poi. 
*   @param {number} scene_id the scene
*   @param {number} mx x-coord of mouse
*   @param {number} my y-coord of mouse
*   @returns {number} poi_id or -1 if no pick.
*/
function ogPickPOI(scene_id, mx, my)
{
    //** @type {ogScene} */
   var scene = _GetObjectFromId(scene_id);
   if (scene && scene.type == OG_OBJECT_SCENE && scene.scenetype == OG_SCENE_3D_ELLIPSOID_WGS84)
   {
      return scene.PickPOI(mx, my);
   }
   return -1;
}
goog.exportSymbol('ogPickPOI', ogPickPOI);

//##############################################################################
// ** GEOMETRY OBJECT **
//##############################################################################
/** @description Create a Geometry Object
*   @param {number} scene_id the scene
*   @param {SurfaceOptions} options surface options
*/
function ogCreateGeometry(scene_id, options)
{
   // test if scene_id is a valid scene
   var scene = /** @type {ogScene} */ _GetObjectFromId(scene_id);
   if (scene && scene.type == OG_OBJECT_SCENE)
   {

      var geometry = _CreateObject(OG_OBJECT_GEOMETRY, scene, options);
      return geometry.id;
   }
   return -1;
}
goog.exportSymbol('ogCreateGeometry', ogCreateGeometry);
//------------------------------------------------------------------------------
/** @description Draw a Geometry
*   @param {number} geometry_id
*/
function ogDestroyGeometry(context,geometry_id)
{
   /** @type {ogGeometry} */
   var geometry = /** @type {ogGeometry} */ _GetObjectFromId(geometry_id);
   if (geometry && geometry.type == OG_OBJECT_GEOMETRY)
   {
      geometry._OnDestroy();
   }
   return -1;
}
goog.exportSymbol('ogDestroyGeomentry', ogDestroyGeometry);
//------------------------------------------------------------------------------
/** @description Adds a Mesh to a geomertry
*   @param {number} geometry_id 
*   @param {GeometryOptions} options 
*/
function ogAddToGeometry(geometry_id, options)
{
   /** @type {ogGeometry} */
   var geometry = /** @type {ogGeometry} */ _GetObjectFromId(geometry_id);
   if (geometry && geometry.type == OG_OBJECT_GEOMETRY)
   {
     geometry.Add(options);
   }
   return -1;
}
goog.exportSymbol('ogAddToGeometry', ogAddToGeometry);
//------------------------------------------------------------------------------
/** @description Pick geometry. 
*   @param {number} scene_id the scene
*   @param {number} mx x-coord of mouse
*   @param {number} my y-coord of mouse
*   @returns {number} poi_id or -1 if no pick.
*/
function ogPickGeometry(scene_id, mx, my)
{
/*    //** @type {ogScene} 
   var scene = _GetObjectFromId(scene_id);
   if (scene && scene.type == OG_OBJECT_SCENE && scene.scenetype == OG_SCENE_3D_ELLIPSOID_WGS84)
   {
     return scene.PickGeometry(mx, my);
   }
   return -1;
       */
}
goog.exportSymbol('ogPickGeometry', ogPickGeometry);

//------------------------------------------------------------------------------
/** @description gets the number of meshObjects in a geometry. 
*   @param {number} geometry_id
*   @returns {number} poi_id or -1 if no pick.
*/
function ogGetNumMeshes(geometry_id)
{
    /** @type {ogGeometry} */
   var geometry = _GetObjectFromId(geometry_id);
   if (geometry && geometry.type == OG_OBJECT_GEOMETRY)
   {
     return geometry.GetNumMeshes();
   }
   return -1;
       
}
goog.exportSymbol('ogGetNumMeshes', ogGetNumMeshes);

//------------------------------------------------------------------------------
/** @description gets the mesh id of a mesh at index in a geometry
*   @param {number} geometry_id
*   @returns {number} index
*/
function ogGetMeshAt(geometry_id, index)
{
   /** @type {ogGeometry} */
   var geometry = _GetObjectFromId(geometry_id);
   if (geometry && geometry.type == OG_OBJECT_GEOMETRY)
   {
     return geometry.GetMeshAt(index);
   }
   return -1;
       
}
goog.exportSymbol('ogGetMeshAt', ogGetMeshAt);

//------------------------------------------------------------------------------
/** @description gets the mesh id of a mesh at index in a geometry
*   @param {number} geometry_id
*   @returns {number} index
*/
function ogGetSurfaceAt(mesh_id, index)
{
   /** @type {ogGeometry} */
   var mesh = _GetObjectFromId(mesh_id);
   if (mesh && mesh.type == OG_OBJECT_MESH)
   {
     return mesh.GetSurfaceAt(index);
   }
   return -1; 
}
goog.exportSymbol('ogGetSurfaceAt', ogGetSurfaceAt);

//------------------------------------------------------------------------------
/** @description Hide a Geometry
*   @param {number} geometry_id
*/
function ogHideGeometry(geometry_id)
{
   /** @type {ogGeometry} */
   var geometry = _GetObjectFromId(geometry_id);
   if (geometry && geometry.type == OG_OBJECT_GEOMETRY)
   {
     geometry.Hide();
   }  
}
goog.exportSymbol('ogHideGeometry', ogHideGeometry);

//------------------------------------------------------------------------------
/** @description Show a hidden geometry
*   @param {number} geometry_id
*/
function ogShowGeometry(geometry_id)
{
    /** @type {ogGeometry} */
   var geometry = _GetObjectFromId(geometry_id);
   if (geometry && geometry.type == OG_OBJECT_GEOMETRY)
   {
     geometry.Show();
   }
       
}
goog.exportSymbol('ogShowGeometry', ogShowGeometry);

//------------------------------------------------------------------------------
/** @description Hide a Mesh
*   @param {number} mesh_id
*/
function ogHideMesh(mesh_id)
{
   /** @type {ogGeometry} */
   var mesh = _GetObjectFromId(mesh_id);
   if (mesh && mesh.type == OG_OBJECT_MESH)
   {
     mesh.Hide();
   }
       
}
goog.exportSymbol('ogHideMesh', ogHideMesh);

//------------------------------------------------------------------------------
/** @description Show a hidden Mesh
*   @param {number} mesh_id
*/
function ogShowMesh(mesh_id)
{
   /** @type {ogGeometry} */
   var mesh = _GetObjectFromId(mesh_id);
   if (mesh && mesh.type == OG_OBJECT_MESH)
   {
     mesh.Show();
   }
       
}
goog.exportSymbol('ogShowMesh', ogShowMesh);
//------------------------------------------------------------------------------
/** @description Hide a Mesh
*   @param {number} mesh_id
*/
function ogHideSurface(surface_id)
{
   /** @type {ogSurface} */
   var surf = _GetObjectFromId(surface_id);
   if (surf && surf.type == OG_OBJECT_SURFACE)
   {
     surf.Hide();
   }
       
}
goog.exportSymbol('ogHideSurface', ogHideSurface);
//------------------------------------------------------------------------------
/** @description Show a hidden Mesh
*   @param {number} mesh_id
*/
function ogShowSurface(surface_id)
{
   /** @type {ogSurface} */
   var surf = _GetObjectFromId(surface_id);
   if (surf && surf.type == OG_OBJECT_SURFACE)
   {
     surf.Show();
   }
       
}
goog.exportSymbol('ogShowSurface', ogShowSurface);