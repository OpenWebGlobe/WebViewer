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

goog.provide('owg.ogObject');

goog.require('owg.ObjectDefs');

//------------------------------------------------------------------------------
/** @ignore */
var _g_objects = [];  // array containing all OpenWebGlobe objects

//------------------------------------------------------------------------------
/** @description register object*/ 
/** @ignore */
function _RegisterObject(obj)
{
   _g_objects.push(obj);
}
//------------------------------------------------------------------------------
/** @description unregister object*/ 
/** @ignore */
function _UnregisterObject(objid)
{
   for (var i=0;i<_g_objects.length;i++)
   {
      if (_g_objects[i].id == objid)
      {
         _g_objects[i]._OnDestroy();
         _g_objects.splice(i,1);
         return;
      }
   }
}
//------------------------------------------------------------------------------
/** @description return number of objects*/ 
/** @ignore */
function _GetNumObjects()
{
   return _g_objects.length;
}
//------------------------------------------------------------------------------
/** @description return object at specified position (iterate)*/
/** @param {number} index */
/** @returns The object at specified index.
/** @ignore */
function _GetObjectAt(index)
{
   if (index<0 || index>_g_objects.length-1)
   {
      return null;
   }
   return _g_objects[index];
}
//------------------------------------------------------------------------------
/** @description return object with specified id*/
/** @param {number} id The object id */
/** @returns {null|ogObject} The object or null if not found.
/** @ignore */
function _GetObjectFromId(id)
{
   if (id == -1)
   {
      return null;
   }
   
   for (var i=0;i<_g_objects.length;i++)
   {
      if (_g_objects[i].id == id)
      {
         return _g_objects[i];
      }
   }
   
   return null;
}
//------------------------------------------------------------------------------
/** @description return object with specified name*/
/** @param {string} name The object name */
/** @returns {ogObject} The object or null if not found.
/** @ignore */
function _GetObjectByName(name)
{
   for (var i=0;i<_g_objects.length;i++)
   {
      if (_g_objects[i].name == name)
      {
         return _g_objects[i];
      }
   }
   
   return null;
}
//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Base class for all OpenWebGlobe objects
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogObject()
{
   this.parent = null; // no parent
   this.name = "ogObject";
   this.type = OG_OBJECT_INVALID;
   this.id = -1;
   this.status = OG_OBJECT_READY;
   this.cbfReady = null;
   this.cbfFailed = null;
}

//------------------------------------------------------------------------------

ogObject.prototype._OnDestroy = function()
{
   // called when object is destroyed   
}

//------------------------------------------------------------------------------

ogObject.prototype.SetId = function(id)
{
   this.id = id;
}

//------------------------------------------------------------------------------

ogObject.prototype.SetParent = function(parent)
{
   this.parent = parent;
}

//------------------------------------------------------------------------------

ogObject.prototype.RegisterObject = function()
{
   _RegisterObject(this);
}
//------------------------------------------------------------------------------
ogObject.prototype.UnregisterObject = function()
{
   _UnregisterObject(this.id);
}

//------------------------------------------------------------------------------

ogObject.prototype.ParseOptions = function(options)
{
   
}

//------------------------------------------------------------------------------








