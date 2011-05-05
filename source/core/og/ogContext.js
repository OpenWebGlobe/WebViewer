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
   this.cbfMouseDown = null;
   this.cbfMouseUp = null;
   this.cbfMouseWheel = null;
   this.cbfKeyDown = null;
   this.cbfKeyUp = null;
   this.cbfResize = null;
   this.cbfRender = null;
   this.cbfTimer = null;
   this.cbfRenderGeometry = null;
   this.cbfBeginRender = null;
   this.cbfEndRender = null;
}

//------------------------------------------------------------------------------
ogContext.prototype = new ogObject();
//------------------------------------------------------------------------------
/**
 * @description Returns the width of the context
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
 */
ogContext.prototype.ParseOptions = function(options)
{
   if (options == null)
   {
      goog.debug.Logger.getLogger('owg.ogContext').warning("** WARNING: no options for context creation!");
      return;  // no options!!
   }
   
   if (options.fullscreen)
   {
      this.fullscreen = true;
   }
   
   this.engine = new engine3d();
   
   // a html5 canvasid is provided:
   if (options.canvas)
   {
      this.engine.InitEngine(options.canvas, true);  // (canvasid, fullscreen)
   }
   else
   {
      goog.debug.Logger.getLogger('owg.ogContext').error("**ERROR: auto creating canvas is not supported yet!");
   }
   
}
//------------------------------------------------------------------------------
/**
 * @description Set background color (clear color)
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
 */
ogContext.prototype.SetTextColor = function(r,g,b)
{
   this.fontcolor.Set(r,g,b,1);
}

//------------------------------------------------------------------------------
/**
 * @description Draw text 
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
 */
ogContext.prototype.GetTextSize = function(text)
{
   if (this.engine)
   {   
      return this.engine.GetTextSize(text);
   }
   
   return null;
}
