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
 * @description POI Layer class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogPOILayer()
{
   /** @type {string} */
   this.name = "ogPOILayer";
   /** @type {number} */
   this.type = OG_OBJECT_POILAYER;
   /** @type {boolean} */
   this.hide = false;  // true if poi layer is hidden
   /** @type {Array.<ogPOI>} */
   this.poiarray = [];   // array of "Poi"
   
   /** @type {string} */
   this.layername = "";
   this.textstyle = null;
   this.iconstyle = null;
   
   this.defaultTextstyle =
   {
      "font" 	: 'SansSerif', 
      "fontSize" 		: 48,
      "backgroundColor" 	: 'rgba(0, 0, 0, 0)',
      "fontColor" 		: 'rgba(255, 255, 255, 1.0)',
      "lineWidth" 		: 3,
      "strokeColor" 		: 'rgba(0, 0, 0, 1.0)',
      "textAlign" 		: 'left', 
      "shadowOffsetX" 	: 2,
      "shadowOffsetY" 	: 2,
      "shadowBlur" 	: 5,
      "shadowColor"  	: 'rgba(0, 0, 0, 0.0)'
   }

   this.defaultIconstyle = 
   {
      "iconWidth" 		: 64,
      "iconHeight" 		: 64,
      "border" 		: 10,
      "backgroundColor" 	: 'rgba(0, 0, 0, 0.0)',
      "shadowOffsetX" 	: 0,
      "shadowOffsetY" 	: 0,
      "shadowBlur" 	: 0,
      "shadowColor" 	: 'rgba(0, 0, 0, 0.6)'
   };
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
   if(options["Layername"])
   {
      this.layername = options["Layername"];
   }
   if(options["Textstyle"])
   {
      this.textstyle = options["Textstyle"];
   }
   else
   {
      this.textstyle = this.defaultTextstyle;
   }
   
   if(options["Iconstyle"])
   {
      this.iconstyle = options["Iconstyle"];
   }
   else
   {
      this.iconstyle = this.defaultIconstyle;
   }
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
   for(var i= 0; i < this.poiarray.length; i++)
   {
      this.poiarray[i].Hide();
   }
}
//------------------------------------------------------------------------------
/**
 * @description show the previously hidden poi layer
 */
ogPOILayer.prototype.Show = function()
{
   this.hide = false;
      for(var i= 0; i < this.poiarray.length; i++)
   {
      this.poiarray[i].Show();
   }
}

//------------------------------------------------------------------------------
/**
 *  @description removes all pois from the layer
 */
ogPOILayer.prototype.RemovePOILayer = function()
{
   alert("ToDo: implement ogPOILayer remove method");
}
//------------------------------------------------------------------------------
/**
 *  @description removes all pois from the layer
 */
ogPOILayer.prototype.CreatePOI = function(options)
{
   options.textstyle = this.textstyle; //append the poi_layer styles..
   options.iconstyle = this.iconstyle;
   var poi = _CreateObject(OG_OBJECT_POI,this.parent,options);
   this.poiarray.push(poi);
   return poi;
}