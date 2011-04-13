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
#                           martin.christen@fhnw.ch                            #
********************************************************************************

This file is part of the OpenWebGlobe SDK

GPL LICENSE

i3D OpenWebGlobe SDK is free software: you can redistribute it and/or modify  it
under the  terms of  the GNU  General Public  License as  published by  the Free
Software Foundation, either version  2 of the License,  or (at your option)  any
later version.

i3D OpenWebGlobe  SDK is  distributed in  the hope  that it  will be useful, but
WITHOUT ANY WARRANTY;  without even the  implied warranty of  MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See  the GNU General Public License for  more
details.

You should have received a copy of the GNU General Public License along with i3D
OpenWebGlobe SDK.  If not, see <http://www.gnu.org/licenses/>.

As a special  exception to the  GPL, any HTML  file which merely  makes function
calls to  this code,  and for  that purpose  includes it  by reference, shall be
deemed a separate work for copyright law purposes. If you modify this code,  you
may extend this exception to your version of the code, but you are not obligated
to do so. If you do not wish to do so, delete this exception statement from your
version.

Commercial License

OEMs (Original  Equipment Manufacturers),  ISVs (Independent  Software Vendors),
VARs (Value Added Resellers) and other distributors that combine and  distribute
commercially licensed  software with  i3D OpenWebGlobe  SDK and  do not  wish to
distribute the source code for the commercially licensed software under  version
2 of the  GNU General Public  License (the "GPL")  must enter into  a commercial
license agreement with the Institute of Geomatics Engineering at the  University
of Applied Sciences Northwestern Switzerland (FHNW).
*******************************************************************************/

//------------------------------------------------------------------------------
/** 
 * @description EventHandler: Class to manage callback functions called on a certain event.
 * @constructor
 */
function EventHandler()
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

//------------------------------------------------------------------------------
/** 
 * @description Handle Key Down Event
 * @constructor
 */
EventHandler.prototype.KeyDown = function(key)
{
   for (var i=0;i<this.vecKeyDown.length;i++)
   {
      this.vecKeyDown[i](key);
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
      this.vecKeyUp[i](key);
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
      this.vecMouseDown[i](button, x, y);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Mouse Down Event
 * @constructor
 */
EventHandler.prototype.MouseUp = function(button, x, y)
{
   for (var i=0;i<this.vecMouseUp.length;i++)
   {
      this.vecMouseUp[i](button, x, y);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Mouse Down Event
 * @constructor
 */
EventHandler.prototype.MouseMove = function(x, y)
{
   for (var i=0;i<this.vecMouseMove.length;i++)
   {
      this.vecMouseMove[i](button, x, y);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Mouse Down Event
 * @constructor
 */
EventHandler.prototype.Render = function()
{
   for (var i=0;i<this.vecRender.length;i++)
   {
      this.vecRender[i]();
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
      this.vecResize[i](w,h);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Handle Resize Event
 * @constructor
 */
EventHandler.prototype.Timer = function(dt)
{
   for (var i=0;i<this.vecTimer.length;i++)
   {
      this.vecTimer[i](w,h);
   }
}
//------------------------------------------------------------------------------
/** 
 * @description Add Key Down Event
 * @constructor
 */
EventHandler.prototype.AddKeyDownCallback = function(cbf)
{
   this.vecKeyDown.push(cbf);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Key Up Event
 * @constructor
 */
EventHandler.prototype.AddKeyUpCallback = function(cbf)
{
   this.vecKeyUp.push(cbf);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Mouse Down Event
 * @constructor
 */
EventHandler.prototype.AddKeyDownCallback = function(cbf)
{
   this.vecMouseDown.push(cbf);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Mouse Up Event
 * @constructor
 */
EventHandler.prototype.AddMouseUpCallback = function(cbf)
{
   this.vecMouseUp.push(cbf);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Mouse Move Event
 * @constructor
 */
EventHandler.prototype.AddMouseMoveCallback = function(cbf)
{
   this.vecMouseMove.push(cbf);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Render Event
 * @constructor
 */
EventHandler.prototype.AddRenderCallback = function(cbf)
{
   this.vecRender.push(cbf);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Resize Event
 * @constructor
 */
EventHandler.prototype.AddResizeCallback = function(cbf)
{
   this.vecResize.push(cbf);
}
//------------------------------------------------------------------------------
/** 
 * @description Add Timer Event
 * @constructor
 */
EventHandler.prototype.AddTimerCallback = function(cbf)
{
   this.vecTimer.push(cbf);
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
