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

goog.provide('owg.ogPOI');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');
goog.require('owg.ogScene');



//------------------------------------------------------------------------------
/** @typedef {{
      text        : string,
      position    : Array.<number>,
      size        : number
   }}
 */
var PoiOptions;

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description POI class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogPOI()
{
   /** @type string */
   this.name = "ogPOI";
   /** @type number */
   this.type = OG_OBJECT_POI;
   /** @type boolean */
   this.hide = false;  // true if poi is hidden
   /** @type Poi */
   this.poi = null;
}
//------------------------------------------------------------------------------
ogPOI.prototype = new ogObject();
//------------------------------------------------------------------------------
/**
 * @description Parse Options
 * @param {Object} options
 */
ogPOI.prototype.ParseOptions = function(options)
{
   /** @type string */
   var text = "unknown";
   /** @type Array.<number> */
   var position = [0,0,0];
   /** @type number */
   var size = 40;

   
   if (options["text"])
   {
      text = options["text"];
   }
   if (options["position"])
   {
      position = options["position"];
   }
   if (options["size"])
   {
      size = options["size"];
   }
   
   /** @type ogScene */
   var scene = this.parent;
   /** @type ogContext */
   var context = scene.parent;
   
   this.poi = context.engine.poimanager.CreatePoi(text);
   this.poi.SetPosition(position[0], position[1], position[2], 0);
   this.poi.SetSize(size);
   
   
}
//------------------------------------------------------------------------------
/**
 * @description Called when object is destroyed. Never call manually.
 * @ignore
 */
ogPOI.prototype._OnDestroy = function()
{
   
}
//------------------------------------------------------------------------------
/**
 * @description change POI text
 * @param {string} newtext the new POI text
 */
ogPOI.prototype.ChangeText = function(newtext)
{
   alert(newtext);
}
//------------------------------------------------------------------------------
/**
 * @description change POI icon
 * @param {string} newicon the url to the icon
 */
ogPOI.prototype.ChangeIcon = function(newicon)
{
   alert(newicon);
}
//------------------------------------------------------------------------------
/**
 * @description change POI size
 * @param {number} newsize the new size of the poi (meters per pixel)
 */
ogPOI.prototype.ChangeSize = function(newsize)
{
   alert(newsize);
}
//------------------------------------------------------------------------------
/**
 * @description change POI location
 * @param {number} lng Lontigude
 * @param {number} lat Latitude
 * @param {number} elv elevation
 */
ogPOI.prototype.ChangePosition = function(lng, lat, elv)
{
   alert(lng);
   alert(lat);
   alert(elv);
}
//------------------------------------------------------------------------------
/**
 * @description hide the poi
 */
ogPOI.prototype.Hide = function()
{
   this.hide = true;
}
//------------------------------------------------------------------------------
/**
 * @description show the previously hidden poi
 */
ogPOI.prototype.Show = function()
{
   this.hide = false;
}
//------------------------------------------------------------------------------

