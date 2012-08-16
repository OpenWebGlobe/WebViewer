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
      text: string,
      icon: string,
      position: Array.<number>,
      flagpole: boolean,
      flagpoleColor: Array.<number>,
      visibilityRange: Array.<number>,
      mode:	string,
      size: number
   }}
 */
var PoiOptions;

//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {ogObject} 
 * @description POI class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogPOI()
{
   /** @type {string} */
   this.name = "ogPOI";
   /** @type {number} */
   this.type = OG_OBJECT_POI;
   /** @type {boolean} */
   this.hide = false;  // true if poi is hidden
   /** @type {Poi} */
   this.poi = null;
   /** @type {ogPoiIconStyle}*/
   this.iconstyle;
   /** @type {ogPoiTextStyle} */
   this.textstyle;
   /** @type {?ogPOILayer} */
   this.layer = null;
}
//------------------------------------------------------------------------------
/** @extends {ogObject} */ 
ogPOI.prototype = new ogObject();
//------------------------------------------------------------------------------
/**
 * @description Parse Options
 * @param {Object} options
 */
ogPOI.prototype.ParseOptions = function(options)
{
   /** @type {string} */
   var text = "";
   /** @type {Array.<number>} */
   var position = [0,0,0];
   /** @type {number} */
   var size = 40;
   /** @type {?string} */
   var icon = null;
   
   if (options["text"])
   {
      text = options["text"];
   }
   if (options["position"])
   {
      var wgs_position = options["position"];
      var geocoord = new GeoCoord(wgs_position[0],wgs_position[1],wgs_position[2]);
      var cart = [];
      geocoord.ToCartesian(cart);
   }
   if (options["size"])
   {
      size = options["size"];
   }
   if (options["icon"])
   {
      icon = options["icon"];
   }
   if (options["textstyle"])
   {
      this.textstyle = options["textstyle"];
   }
   if (options["iconstyle"])
   {
      this.iconstyle = options["iconstyle"];
   }

   /** @type {ogScene} */
   var scene = /** @type ogScene */this.parent;
   /** @type {ogContext} */
   var context = /** @type ogContext */scene.parent;
   
   this.poi = context.engine.poimanager.CreatePoi(text, this.textstyle, icon, this.iconstyle);
   this.poi.hide = false; //appended property
   
   if(options["flagpoleColor"])
   {
      this.poi.SetFlagpoleColor(options["flagpoleColor"]);
   }
   // todo: fix lat/lng -> lng/lat !!!
   if(options["flagpole"] == true)
   {
      this.poi.SetPosition(cart[0], cart[1], cart[2], 0);
   }
   else
   {
      this.poi.SetPosition(cart[0], cart[1], cart[2],null);
   }
   
   this.poi.SetSize(size);
   
   if(options["centerOnIcon"] == true)
   {
      this.poi.SetCenterOnIcon(true);
   }
   
   if(options["pivotPoint"])
   {
      /** type {Array.<number>} */
      var pivotPoint = options["pivotPoint"];
      this.poi.SetPivot(pivotPoint[0], pivotPoint[1], pivotPoint[2]);
   }
   
   this.poi.ogpoi = this;
   
   var poirenderer = this._GetPoiRenderer();
   
   if (poirenderer)
   {
      poirenderer.AddPoi(this.poi);
   }
   
   if(options["visibilityRange"])
   {
      this.poi.SetVisibilityRange(options["visibilityRange"]);
   }
   
}
//------------------------------------------------------------------------------
/**
 * @description Called when object is destroyed. Never call manually.
 * @ignore
 */
ogPOI.prototype._OnDestroy = function()
{
   /** @type {ogScene} */
   var scene = /** @type ogScene */this.parent;
   /** @type {ogContext} */
   var context = /** @type ogContext */scene.parent;
   
   /** @type {PoiRenderer} */
   var poirenderer = this._GetPoiRenderer();
   
   if (poirenderer)
   {
      poirenderer.RemovePoi(this.poi);
   }
   
   /** @type {PoiManager} */
   var poimgr = context.engine.poimanager;
   poimgr.DestroyPoi(this.poi);
   
}
//------------------------------------------------------------------------------
/**
 * @description change POI text
 * @param {string} newtext the new POI text
 */
ogPOI.prototype.ChangeText = function(newtext)
{
   /** @type {ogScene} */
   var scene = /** @type ogScene */this.parent;
   /** @type {ogContext} */
   var context = /** @type ogContext */scene.parent;
   
   if(this.textstyle)
   {
      context.engine.poimanager.ChangePoiText(this.poi,newtext,this.textstyle); 
   }

}
//------------------------------------------------------------------------------
/**
 * @description change POI icon
 * @param {string} newicon the url to the icon
 */
ogPOI.prototype.ChangeIcon = function(newicon)
{
   /** @type {ogScene} */
   var scene = /** @type ogScene */this.parent;
   /** @type {ogContext} */
   var context = /** @type ogContext */scene.parent;
   
   if(this.iconstyle)
   {
      context.engine.poimanager.ChangePoiIcon(this.poi,newicon,this.iconstyle);
   }
   
}
//------------------------------------------------------------------------------
/**
 * @description change POI size
 * @param {number} newsize the new size of the poi (meters per pixel)
 */
ogPOI.prototype.ChangeSize = function(newsize)
{
   this.poi.SetSize(newsize);
}
//------------------------------------------------------------------------------
/**
 * @description change POI location
 * @param {number} x cartesian x coordinate
 * @param {number} y cartesian y coordinate
 * @param {number} z cartesian z coordinate
 */
ogPOI.prototype.ChangePosition = function(x, y, z)
{
   if(this.poi.pole)
   {
      this.poi.SetPosition(x,y,z,0);  
   }
   else
   {
      this.poi.SetPosition(x,y,z,null);   
   }
}

//------------------------------------------------------------------------------
/**
 * @description hide the poi
 */
ogPOI.prototype.Hide = function()
{
   this.hide = true;
   this.poi.hide = true; //appended property
}
//------------------------------------------------------------------------------
/**
 * @description show the previously hidden poi
 */
ogPOI.prototype.Show = function()
{
   this.hide = false;
   this.poi.hide = false; //appended property
}
//------------------------------------------------------------------------------
/**
 *  @returns {PoiRenderer} the poi-renderer
 */
ogPOI.prototype._GetPoiRenderer = function()
{
   /** @type {PoiRenderer} */
   var renderer = null;
   /** @type {ogScene} */
   var scene = /** @type ogScene */this.parent;
   /** @type {ogContext} */
   var context =  /** @type ogContext */scene.parent;
   // Get the engine
   /** @type {engine3d} */
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
/**
 * @description
 * @param {number} r the red value
 * @param {number} g the red value
 * @param {number} b the red value
 * @param {number} a the red value
 */
ogPOI.prototype.SetActiveColor = function(r,g,b,a)
{
   var col = new vec4(r,g,b,a);
   this.poi.poiActiveColor=col;
}

