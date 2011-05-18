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

goog.provide('owg.ogPOILayer');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');
goog.require('owg.ogScene');
goog.require('owg.ogPOI');


//------------------------------------------------------------------------------
/** @typedef {{
      text        : string,
      position    : Array.<number>,
      size        : number
   }}
 */
var PoiLayerOptions;
//------------------------------------------------------------------------------
/**
 * @constructor
 * @description POI class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogPOILayer()
{
   /** @type string */
   this.name = "ogPOILayer";
   /** @type number */
   this.type = OG_OBJECT_POILAYER;
   /** @type boolean */
   this.hide = false;  // true if poi layer is hidden
   /** @type Array.<Poi> */
   this.poiarray = null;   // array of "Poi"
}
//------------------------------------------------------------------------------
ogPOILayer.prototype = new ogObject();
//------------------------------------------------------------------------------
/**
 * @description Parse Options
 * @param {Object} options
 */
ogPOILayer.prototype.ParseOptions = function(options)
{
  
   
}
//------------------------------------------------------------------------------
/**
 * @description Called when object is destroyed. Never call manually.
 * @ignore
 */
ogPOILayer.prototype._OnDestroy = function()
{

   
}
//------------------------------------------------------------------------------
/**
 * @description hide the poi layer
 */
ogPOILayer.prototype.Hide = function()
{
   this.hide = true;
}
//------------------------------------------------------------------------------
/**
 * @description show the previously hidden poi layer
 */
ogPOILayer.prototype.Show = function()
{
   this.hide = false;
}
//------------------------------------------------------------------------------
/**
 *  @returns {PoiRenderer} the poi-renderer
 */
ogPOILayer.prototype._GetPoiRenderer = function()
{
   /** @type PoiRenderer */
   var renderer = null;
   /** @type ogScene */
   var scene = /** @type ogScene */ this.parent;
   /** @type ogContext */
   var context = /** @type ogContext */ scene.parent;
   // Get the engine
   /** @type engine3d */
   var engine = context.engine;
   
   // test if there is a scenegraph attached
   if (engine.scene)
   {
      if (engine.scene.nodeRenderObject)
      {
         renderer = engine.scene.nodeRenderObject.poirenderer;  
      }
   }
   return renderer;
}
//------------------------------------------------------------------------------
