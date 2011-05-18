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

goog.provide('owg.EventHandler');

//------------------------------------------------------------------------------
/** 
 * @description EventHandler: Class to manage callback functions called on a certain event.
 * @constructor
 */
function EventHandler()
{
   /** @type {Array.<EventInfo>} */
   this.vecKeyDown      = new Array(); // array containing all key down callbacks
   /** @type {Array.<EventInfo>} */
   this.vecKeyUp        = new Array(); // array containing all key up callbacks
   /** @type {Array.<EventInfo>} */
   this.vecMouseDown    = new Array(); // array containing all mouse down callbacks
   /** @type {Array.<EventInfo>} */
   this.vecMouseUp      = new Array(); // array containing all mouse up callbacks
   /** @type {Array.<EventInfo>} */
   this.vecMouseMove    = new Array(); // array containing all mouse move callbacks
   /** @type {Array.<EventInfo>} */
   this.vecMouseWheel   = new Array(); // array containing all mouse wheel callbacks
   /** @type {Array.<EventInfo>} */
   this.vecRender       = new Array(); // array containing all render callbacks
   /** @type {Array.<EventInfo>} */
   this.vecResize       = new Array(); // array containing all resize callbacks
   /** @type {Array.<EventInfo>} */
   this.vecTimer        = new Array(); // array containing all timer callbacks
}

//------------------------------------------------------------------------------
/** 
 * @description Event sender structure, for internal use
 * @constructor
 * @ignore
 */
function EventInfo(sender, func)
{
   this.sender = sender;
   this.func = func;
}

//------------------------------------------------------------------------------
/** 
 * @description Handle Key Down Event
 * @param {number} key the keycode
 * @param {engine3d=} engine the engine
 */
EventHandler.prototype.KeyDown = function(key, engine)
{
   for (var i=0;i<this.vecKeyDown.length;i++)
   {
      /** @type {EventInfo} */
      var evtinfo = this.vecKeyDown[i];
      evtinfo.func(evtinfo.sender, key);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Key Up Event
 * @param {number} key the keycode
 * @param {engine3d=} engine the engine
 */
EventHandler.prototype.KeyUp = function(key,engine)
{
   for (var i=0;i<this.vecKeyUp.length;i++)
   {
      /** @type {EventInfo} */
      var evtinfo = this.vecKeyUp[i];
      evtinfo.func(evtinfo.sender, key);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Mouse Down Event
 * @param {number} button
 * @param {number} x
 * @param {number} y
 */
EventHandler.prototype.MouseDown = function(button, x, y)
{
   for (var i=0;i<this.vecMouseDown.length;i++)
   {
      /** @type {EventInfo} */
      var evtinfo = this.vecMouseDown[i];
      evtinfo.func(evtinfo.sender, button, x, y);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Mouse Up Event
 * @param {number} button
 * @param {number} x
 * @param {number} y
 */
EventHandler.prototype.MouseUp = function(button, x, y)
{
   for (var i=0;i<this.vecMouseUp.length;i++)
   {
      /** @type {EventInfo} */
      var evtinfo = this.vecMouseUp[i];
      evtinfo.func(evtinfo.sender, button, x, y);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Mouse wheel Event
 * @param {number} delta
 */
EventHandler.prototype.MouseWheel = function(delta)
{
   for (var i=0;i<this.vecMouseWheel.length;i++)
   {
      /** @type {EventInfo} */
      var evtinfo = this.vecMouseWheel[i];
      evtinfo.func(evtinfo.sender, delta);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Mouse Move Event
 * @param {number} x
 * @param {number} y
 */
EventHandler.prototype.MouseMove = function(x, y)
{
   for (var i=0;i<this.vecMouseMove.length;i++)
   {
      /** @type {EventInfo} */
      var evtinfo = this.vecMouseMove[i];
      evtinfo.func(evtinfo.sender, x, y);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Render Event
 * 
 */
EventHandler.prototype.Render = function()
{
   for (var i=0;i<this.vecRender.length;i++)
   {
      /** @type {EventInfo} */
      var evtinfo = this.vecRender[i];
      evtinfo.func(evtinfo.sender);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Resize Event
 * @param {number} w
 * @param {number} h
 */
EventHandler.prototype.Resize = function(w,h)
{
   for (var i=0;i<this.vecResize.length;i++)
   {
      /** @type {EventInfo} */
      var evtinfo = this.vecResize[i];
      evtinfo.func(evtinfo.sender, w,h);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Timer Event
 * @param {number} dt
 */
EventHandler.prototype.Timer = function(dt)
{
   for (var i=0;i<this.vecTimer.length;i++)
   {
      /** @type {EventInfo} */
      var evtinfo = this.vecTimer[i];
      evtinfo.func(evtinfo.sender, dt);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Add Key Down Event
 * @param {Object} sender
 * @param {function()} cbf
 */
EventHandler.prototype.AddKeyDownCallback = function(sender, cbf)
{
   /** @type {EventInfo} */
   var evtinfo = new EventInfo(sender, cbf);
   this.vecKeyDown.push(evtinfo);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Key Up Event
 * @param {Object} sender
 * @param {function()} cbf
 */
EventHandler.prototype.AddKeyUpCallback = function(sender, cbf)
{
   /** @type {EventInfo} */
   var evtinfo = new EventInfo(sender, cbf);
   this.vecKeyUp.push(evtinfo);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Mouse Down Event
 * @param {Object} sender
 * @param {function()} cbf
 */
EventHandler.prototype.AddMouseDownCallback = function(sender, cbf)
{
   /** @type {EventInfo} */
   var evtinfo = new EventInfo(sender, cbf);
   this.vecMouseDown.push(evtinfo);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Mouse Up Event
 * @param {Object} sender
 * @param {function()} cbf
 */
EventHandler.prototype.AddMouseUpCallback = function(sender, cbf)
{
   /** @type {EventInfo} */
   var evtinfo = new EventInfo(sender, cbf);
   this.vecMouseUp.push(evtinfo);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Mouse Wheel Event
 * @param {Object} sender
 * @param {function()} cbf
 */
EventHandler.prototype.AddMouseWheelCallback = function(sender, cbf)
{
   /** @type {EventInfo} */
   var evtinfo = new EventInfo(sender, cbf);
   this.vecMouseWheel.push(evtinfo);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Mouse Move Event
 * @param {Object} sender
 * @param {function()} cbf
 */
EventHandler.prototype.AddMouseMoveCallback = function(sender, cbf)
{
   /** @type {EventInfo} */
   var evtinfo = new EventInfo(sender, cbf);
   this.vecMouseMove.push(evtinfo);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Render Event
 * @param {Object} sender
 * @param {function()} cbf
 */
EventHandler.prototype.AddRenderCallback = function(sender, cbf)
{
   /** @type {EventInfo} */
   var evtinfo = new EventInfo(sender, cbf);
   this.vecRender.push(evtinfo);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Resize Event
 * @param {Object} sender
 * @param {function()} cbf
 */
EventHandler.prototype.AddResizeCallback = function(sender, cbf)
{
   /** @type {EventInfo} */
   var evtinfo = new EventInfo(sender, cbf);
   this.vecResize.push(evtinfo);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Timer Event
 * @param {Object} sender
 * @param {function()} cbf
 */
EventHandler.prototype.AddTimerCallback = function(sender, cbf)
{
   /** @type {EventInfo} */
   var evtinfo = new EventInfo(sender, cbf);
   this.vecTimer.push(evtinfo);
}
//------------------------------------------------------------------------------
/** 
 * @description Removes all event callback functions
 * 
 */
EventHandler.prototype.ClearAll = function()
{ 
   this.vecKeyDown   = new Array(); // array containing all key down callbacks
   this.vecKeyUp     = new Array(); // array containing all key up callbacks
   this.vecMouseDown = new Array(); // array containing all mouse down callbacks
   this.vecMouseUp   = new Array(); // array containing all mouse up callbacks
   this.vecMouseMove = new Array(); // array containing all mouse move callbacks
   this.vecRender    = new Array(); // array containing all render callbacks
   this.vecResize    = new Array(); // array containing all resize callbacks
   this.vecTimer     = new Array(); // array containing all timer callbacks
}
