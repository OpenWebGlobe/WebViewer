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
      "fontString" 	   : "48px Arial", 
      "backgroundColor" : "rgba(0, 0, 0, 0)",
      "fontColor" 		: "rgba(255, 255, 255, 1.0)",
      "lineWidth" 		: 3,
      "strokeStyle" 		: "rgba(0, 0, 0, 1.0)",
      "shadowOffsetX" 	: 0,
      "shadowOffsetY" 	: 0,
      "shadowBlur" 	   : 0,
      "shadowColor"  	: "rgba(0, 0, 0, 0.0)"
   }

   this.defaultIconstyle = 
   {
      "iconWidth" 		: 64,
      "iconHeight" 		: 64,
      "border" 		: 5,
      "backgroundColor" 	: "rgba(0, 0, 0, 0.0)",
      "shadowOffsetX" 	: 0,
      "shadowOffsetY" 	: 0,
      "shadowBlur" 	: 10,
      "shadowColor" 	: "rgba(255, 0, 0, 0.6)"
   };
}
//------------------------------------------------------------------------------
ogPOILayer.prototype = new ogObject();
//------------------------------------------------------------------------------


ogPOILayer.prototype.convertStyle = function(style)
{
      if(style.font  && style.fontSize ) style.fontString = style.fontSize+"px"+" "+style.font;
      if(style.backgroundColor )
      {
        var tmp = style.backgroundColor;
        style.backgroundColor = "rgba("+tmp[0]*255+","+tmp[1]*255+","+tmp[2]*255+","+tmp[3]+")";
      } 
      if(style.fontColor )
      {
        var tmp = style.fontColor;
        style.fontColor = "rgba("+tmp[0]*255+","+tmp[1]*255+","+tmp[2]*255+","+tmp[3]+")";
      }
      if(style.strokeColor )
      {
        var tmp = style.strokeColor;
        style.strokeStyle = "rgba("+tmp[0]*255+","+tmp[1]*255+","+tmp[2]*255+","+tmp[3]+")";
      }
      if(style.shadowColor )
      {
        var tmp = style.shadowColor;
        style.shadowColor = "rgba("+tmp[0]*255+","+tmp[1]*255+","+tmp[2]*255+","+tmp[3]+")";
      }
      if(style.width) style.iconWidth = style.width;
      if(style.height) style.iconHeight = style.height;
}
/**
 * @description Parse Options
 * @param {Object} options
 */
ogPOILayer.prototype.ParseOptions = function(options)
{
   if(options.name )
   {
      this.layername = options.name ;
   }
   if(options.textstyle )
   {
      this.convertStyle(options.textstyle );
      this.textstyle = options.textstyle ;
   }
   else
   {
      this.textstyle = this.defaultTextstyle;
   }
   
   if(options.iconstyle )
   {
      this.convertStyle(options.iconstyle );
      this.iconstyle = options.iconstyle ;
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
   for(var i= 0; i < this.poiarray.length; i++)
   {
      this.poiarray[i].UnregisterObject();
   }
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
 *  @description creates a poi using the layer styles.
 */
ogPOILayer.prototype.CreatePOI = function(options)
{
   options.textstyle = this.textstyle; //append the poi_layer styles..
   options.iconstyle = this.iconstyle;
   var poi = _CreateObject(OG_OBJECT_POI,this.parent.parent,options);
   this.poiarray.push(poi);
   poi.poilayer = this;
   return poi;
}
//------------------------------------------------------------------------------
/**
 *  @description removes the poi and frees its memory.
 *  @param {ogPOI} poi the poi
 */
ogPOILayer.prototype.RemovePOI = function(poi)
{
   for(var i= 0; i < this.poiarray.length; i++)
   {
      if(this.poiarray[i] == poi)
      {
         this.poiarray[i].UnregisterObject();
         this.poiarray.splice(i,1);
      }
      
   }
}