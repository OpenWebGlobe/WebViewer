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

//------------------------------------------------------------------------------
/** @ignore */
_g_objects = [];  // array containing all OpenWebGlobe objects

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
   for (var i=0;i<_g_objects.length();i++)
   {
      if (_g_objects[i].id == id)
      {
         _g_objects[i].Destroy();
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
   return _g_objects[index];
}
//------------------------------------------------------------------------------
/** @description return object with specified id*/
/** @param {number} id The object id */
/** @returns {ogObject} The object or null if not found.
/** @ignore */
function _GetObjectFromId(id)
{
   if (id == -1)
   {
      return null;
   }
   
   for (var i=0;i<_g_objects.length();i++)
   {
      if (_g_objects[i].id == id)
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
}

//------------------------------------------------------------------------------

ogObject.prototype.Destroy = function()
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
   var obj = this;
   _RegisterObject(obj);
}

//------------------------------------------------------------------------------

ogObject.prototype.SetOptions = function(options)
{
   
}

//------------------------------------------------------------------------------






