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
   this.vecKeyDown      = new Array(); // array containing all key down callbacks
   this.vecKeyUp        = new Array(); // array containing all key up callbacks
   this.vecMouseDown    = new Array(); // array containing all mouse down callbacks
   this.vecMouseUp      = new Array(); // array containing all mouse up callbacks
   this.vecMouseMove    = new Array(); // array containing all mouse move callbacks
   this.vecMouseWheel   = new Array(); // array containing all mouse wheel callbacks
   this.vecRender       = new Array(); // array containing all render callbacks
   this.vecResize       = new Array(); // array containing all resize callbacks
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
 * @constructor
 */
EventHandler.prototype.KeyDown = function(key)
{
   for (var i=0;i<this.vecKeyDown.length;i++)
   {
      var evtinfo = this.vecKeyDown[i];
      evtinfo.func(evtinfo.sender, key);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Key Up Event
 * @constructor
 */
EventHandler.prototype.KeyUp = function(key)
{
   for (var i=0;i<this.vecKeyUp.length;i++)
   {
      var evtinfo = this.vecKeyUp[i];
      evtinfo.func(evtinfo.sender, key);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Mouse Down Event
 * @constructor
 */
EventHandler.prototype.MouseDown = function(button, x, y)
{
   for (var i=0;i<this.vecMouseDown.length;i++)
   {
      var evtinfo = this.vecMouseDown[i];
      evtinfo.func(evtinfo.sender, button, x, y);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Mouse Up Event
 * @constructor
 */
EventHandler.prototype.MouseUp = function(button, x, y)
{
   for (var i=0;i<this.vecMouseUp.length;i++)
   {
      var evtinfo = this.vecMouseUp[i];
      evtinfo.func(evtinfo.sender, button, x, y);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Mouse wheel Event
 * @constructor
 */
EventHandler.prototype.MouseWheel = function(delta)
{
   for (var i=0;i<this.vecMouseWheel.length;i++)
   {
      var evtinfo = this.vecMouseWheel[i];
      evtinfo.func(evtinfo.sender, delta);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Mouse Move Event
 * @constructor
 */
EventHandler.prototype.MouseMove = function(x, y)
{
   for (var i=0;i<this.vecMouseMove.length;i++)
   {
      var evtinfo = this.vecMouseMove[i];
      evtinfo.func(evtinfo.sender, x, y);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Render Event
 * @constructor
 */
EventHandler.prototype.Render = function()
{
   for (var i=0;i<this.vecRender.length;i++)
   {
      var evtinfo = this.vecRender[i];
      evtinfo.func(evtinfo.sender);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Resize Event
 * @constructor
 */
EventHandler.prototype.Resize = function(w,h)
{
   for (var i=0;i<this.vecResize.length;i++)
   {
      var evtinfo = this.vecResize[i];
      evtinfo.func(evtinfo.sender, w,h);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Timer Event
 * @constructor
 */
EventHandler.prototype.Timer = function(dt)
{
   for (var i=0;i<this.vecTimer.length;i++)
   {
      var evtinfo = this.vecTimer[i];
      evtinfo.func(evtinfo.sender, dt);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Add Key Down Event
 * @constructor
 */
EventHandler.prototype.AddKeyDownCallback = function(sender, cbf)
{
   var evtinfo = new EventInfo(sender, cbf);
   this.vecKeyDown.push(evtinfo);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Key Up Event
 * @constructor
 */
EventHandler.prototype.AddKeyUpCallback = function(sender, cbf)
{
   var evtinfo = new EventInfo(sender, cbf);
   this.vecKeyUp.push(evtinfo);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Mouse Down Event
 * @constructor
 */
EventHandler.prototype.AddMouseDownCallback = function(sender, cbf)
{
   var evtinfo = new EventInfo(sender, cbf);
   this.vecMouseDown.push(evtinfo);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Mouse Up Event
 * @constructor
 */
EventHandler.prototype.AddMouseUpCallback = function(sender, cbf)
{
   var evtinfo = new EventInfo(sender, cbf);
   this.vecMouseUp.push(evtinfo);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Mouse Wheel Event
 * @constructor
 */
EventHandler.prototype.AddMouseWheelCallback = function(sender, cbf)
{
   var evtinfo = new EventInfo(sender, cbf);
   this.vecMouseWheel.push(evtinfo);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Mouse Move Event
 * @constructor
 */
EventHandler.prototype.AddMouseMoveCallback = function(sender, cbf)
{
   var evtinfo = new EventInfo(sender, cbf);
   this.vecMouseMove.push(evtinfo);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Render Event
 * @constructor
 */
EventHandler.prototype.AddRenderCallback = function(sender, cbf)
{
   var evtinfo = new EventInfo(sender, cbf);
   this.vecRender.push(evtinfo);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Resize Event
 * @constructor
 */
EventHandler.prototype.AddResizeCallback = function(sender, cbf)
{
   var evtinfo = new EventInfo(sender, cbf);
   this.vecResize.push(evtinfo);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Timer Event
 * @constructor
 */
EventHandler.prototype.AddTimerCallback = function(sender, cbf)
{
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
