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


goog.provide('owg.ogContext');

goog.require('goog.debug.Logger');
goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');
goog.require('owg.engine3d');

//------------------------------------------------------------------------------
// CALLBACK FUNCTIONS FOR ENGINE
//------------------------------------------------------------------------------
/**
 * @ignore
 * @param {engine3d} engine the engine
 */
function _ctx_callback_init(engine)
{ 
   var context = engine.owg;
   
   if (context.cbfInit)
   {
      context.cbfInit(context.id);
   }
   
}
//------------------------------------------------------------------------------
/**
 * @ignore
 * @param {number} dt time delta (in milliseconds)
 * @param {engine3d} engine the engine
 */
function _ctx_callback_timer(dt, engine)
{
   var context = engine.owg;
   
   if (context.cbfTimer)
   {
      context.cbfTimer(context.id, dt);
   }
}
//------------------------------------------------------------------------------
/**
 * @ignore
 * @param {engine3d} engine the engine
 */
function _ctx_callback_render(engine)
{
   var context = engine.owg;
   
   if (context.cbfRender)
   {
      context.cbfRender(context.id);
   }
}
//------------------------------------------------------------------------------
/**
 * @ignore
 * @param {number} button mouse button
 * @param {number} x mouse x-coord (window coord)
 * @param {number} y mouse y-coord (window coord)
 * @param {engine3d} engine the engine
 */
function _ctx_callback_mousedown(button, x, y, engine)
{
      var context = engine.owg;
   
   if (context.cbfMouseDown)
   {
      context.cbfMouseDown(context.id, button, x, y);
   }
}
//------------------------------------------------------------------------------
/**
 * @ignore
 * @param {number} button mouse button
 * @param {number} x mouse x-coord (window coord)
 * @param {number} y mouse y-coord (window coord)
 * @param {engine3d} engine the engine
 */
function _ctx_callback_mouseup(button, x, y, engine)
{
   var context = engine.owg;
   
   if (context.cbfMouseUp)
   {
      context.cbfMouseUp(context.id, button, x, y);
   }
}
//------------------------------------------------------------------------------
/**
 * @ignore
 * @param {number} x mouse x-coord (window coord)
 * @param {number} y mouse y-coord (window coord)
 * @param {engine3d} engine the engine
 */
function _ctx_callback_mousemove(x, y, engine)
{
   var context = engine.owg;
   
   if (context.cbfMouseMove)
   {
      context.cbfMouseMove(context.id, x, y);
   }
}
//------------------------------------------------------------------------------
/**
 * @ignore
 * @param {number} delta mouse wheel delta
 * @param {engine3d} engine the engine
 */
function _ctx_callback_mousewheel(delta, engine)
{
   var context = engine.owg;
   
   if (context.cbfMouseWheel)
   {
      context.cbfMouseWheel(context.id, delta);
   }
}
//------------------------------------------------------------------------------
/**
 * @ignore
 * @param {number} width width
 * @param {number} height height
 * @param {engine3d} engine the engine
 */
function _ctx_callback_resize(width, height, engine)
{
   var context = engine.owg;
   
   if (context.cbfResize)
   {
      context.cbfResize(context.id, width, height);
   }
}
//------------------------------------------------------------------------------
/**
 * @ignore
 * @param {number} keycode the keycode
 * @param {engine3d} engine the engine
 */
function _ctx_callback_keydown(keycode, engine)
{
   var context = engine.owg;
   
   if (context.cbfKeyDown)
   {
      context.cbfKeyDown(context.id, keycode);
   }
}
//------------------------------------------------------------------------------
/**
 * @ignore
 * @param {number} keycode the keycode
 * @param {engine3d} engine the engine
 */
function _ctx_callback_keyup(keycode, engine)
{
   var context = engine.owg;
   
   if (context.cbfKeyUp)
   {
      context.cbfKeyUp(context.id, keycode);
   }
}
//------------------------------------------------------------------------------
/**
 * @ignore
 * @param {engine3d} engine the engine
 */
function _ctx_callback_flytostartedcallback(engine)
{
   var context = engine.owg;
   if (context.cbfFlyToStarted)
   {
      context.cbfFlyToStarted(engine.owg.id);
   }
}
//------------------------------------------------------------------------------
/**
 * @ignore
 * @param {engine3d} engine the engine
 */
function _ctx_callback_inpositioncallback(engine)
{
   var context = engine.owg;
   if (context.cbfInPosition)
   {
      context.cbfInPosition(engine.owg.id);
   }
}

//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Context class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogContext()
{
   this.name = "ogContext";
   this.type = OG_OBJECT_CONTEXT;
   this.fullscreen = false;
   /** @type {engine3d} */
   this.engine = null;
   /** @type {ogScene} */
   this.scene = null;  // scene object attached to context
   /** @type {vec4} */
   this.fontcolor = new vec4(1,1,1,1);
   
   // number of render passes:
   this.numRenderPasses = 1;
   
   // context-related callback functions
   /** @type {function(number, number, number, number)|null} */
   this.cbfMouseDown = null;
   /** @type {function(number, number, number, number)|null} */
   this.cbfMouseUp = null;
   /** @type {function(number, number)|null} */
   this.cbfMouseWheel = null;
   /** @type {function(number, number, number)|null} */
   this.cbfMouseMove = null;
   /** @type {function(number, number)|null} */
   this.cbfKeyDown = null;
   /** @type {function(number, number)|null} */
   this.cbfKeyUp = null;
   /** @type {function(number, number, number)|null} */
   this.cbfResize = null;
   /** @type {function(number)|null} */
   this.cbfRender = null;
   /** @type {function(number, number)|null} */
   this.cbfTimer = null;
   /** @type {function(number)|null} */
   this.cbfInit = null;
   /** @type {function(number)|null} */
   this.cbfExit = null;
   /** @type {function(number)|null} */
   this.cbfFlyToStarted = null;
   /** @type {function(number)|null} */
   this.cbfInPosition = null;
}

//------------------------------------------------------------------------------
ogContext.prototype = new ogObject();
//------------------------------------------------------------------------------
/**
 * @description Returns the width of the context
 * @returns {number} the width of the context
 */
ogContext.prototype.GetWidth = function()
{
   if (this.engine)
   {
      return this.engine.width;
   }
   return 0;
}
//------------------------------------------------------------------------------
/**
 * @description Returns the height of the context
 * @returns {number} the height of the context
 */
ogContext.prototype.GetHeight = function()
{
   if (this.engine)
   {
      return this.engine.height;
   }
   
   return 0;
}
//------------------------------------------------------------------------------
/**
 * @description Parse options for context
 * @param {Object} options the options for context creation
 */
ogContext.prototype.ParseOptions = function(options)
{
   this.cbfInit = options["cbfInit"];
   this.cbfExit = options["cbfExit"];
   this.cbfResize = options["cbfResize"];
   
   if (options["fullscreen"])
   {
      this.fullscreen = true;
   }
   
   this.engine = new engine3d();
   this.engine.owg = this;
   
   // a html5 canvasid is provided:
   if (options["canvas"])
   {
      this.engine.InitEngine(options["canvas"], this.fullscreen);  // (canvasid, fullscreen)
   }
   else
   {
      goog.debug.Logger.getLogger('owg.ogContext').warning("**ERROR: auto creating canvas is not supported yet!");
   }

   this.engine.SetInitCallback(_ctx_callback_init);
   this.engine.SetTimerCallback(_ctx_callback_timer);
   this.engine.SetRenderCallback(_ctx_callback_render);
   this.engine.SetMouseDownCallback(_ctx_callback_mousedown);
   this.engine.SetMouseUpCallback(_ctx_callback_mouseup);
   this.engine.SetMouseMoveCallback(_ctx_callback_mousemove);
   this.engine.SetMouseWheelCallback(_ctx_callback_mousewheel);
   this.engine.SetResizeCallback(_ctx_callback_resize);
   this.engine.SetKeyDownCallback(_ctx_callback_keydown);
   this.engine.SetKeyUpCallback(_ctx_callback_keyup);
   
   //FlyTo callback functions
   this.engine.flyto.SetFlyToStartedCallback(_ctx_callback_flytostartedcallback);
   this.engine.flyto.SetInPositionCallback(_ctx_callback_inpositioncallback);
}
//------------------------------------------------------------------------------
/**
 * @description Set background color (clear color)
 * @param {number} r red component in range [0, 1]
 * @param {number} g green component in range [0, 1]
 * @param {number} b blue component in range [0, 1]
 * @param {number} a blue component in range [0, 1]. In most cases this should be set to 1.
 */
ogContext.prototype.SetBackgroundColor = function(r,g,b,a)
{
   if (this.engine)
   {
      this.engine.SetClearColor(r,g,b,a);
   }
}

//------------------------------------------------------------------------------
/**
 * @description Set text color
 * @param {number} r red component in range [0, 1]
 * @param {number} g green component in range [0, 1]
 * @param {number} b blue component in range [0, 1]
 */
ogContext.prototype.SetTextColor = function(r,g,b)
{
   this.fontcolor.Set(r,g,b,1);
}

//------------------------------------------------------------------------------
/**
 * @description Draw text
 * @param {string} text the text to draw
 * @param {number} x x-coordinate
 * @param {number} y y-coordinate
 */
ogContext.prototype.DrawText = function(text, x, y)
{
   if (this.engine)
   {
      this.engine.DrawText(text,x,y,1,this.fontcolor);
   }
}
//------------------------------------------------------------------------------
/**
 * @description Get text size
 * @param {string} text the text
 */
ogContext.prototype.GetTextSize = function(text)
{
   if (this.engine)
   {   
      return this.engine.GetTextSize(text);
   }
   
   return null;
}
//------------------------------------------------------------------------------
/**
 * @description Get text size
 */
ogContext.prototype._OnDestroy = function()
{
   this.engine.OnDestroy();
   this.engine = null;
}
//------------------------------------------------------------------------------


