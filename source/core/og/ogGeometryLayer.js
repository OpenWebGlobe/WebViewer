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

goog.provide('owg.ogGeometryLayer');
goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');
goog.require('owg.ogScene');
goog.require('owg.ogGeometry');


//------------------------------------------------------------------------------
/**
 * @constructor
 * @description POI Layer class (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 * @author Benjamin Loesch, benjamin.loesch@fhnw.ch
 */
function ogGeometryLayer()
{
   /** @type {string} */
   this.name = "ogGeometryLayer";
   /** @type {number} */
   this.type = OG_OBJECT_GEOMETRYLAYER;
   /** @type {boolean} */
   this.hide = false;  // true if poi layer is hidden
   /** @type {Array.<ogGeometry>} */
   this.geometryarray = [];   // array of "ogGeometries"
   
   /** @type {string} */
   this.layername = "";
}
//------------------------------------------------------------------------------
ogGeometryLayer.prototype = new ogObject();
//------------------------------------------------------------------------------


/**
 * @description Parse Options
 * @param {Object} options
 */
ogGeometryLayer.prototype.ParseOptions = function(options)
{
   if(options["name"])
   {
      this.layername = options["name"];
   }
}

//------------------------------------------------------------------------------
/**
 * @description Called when object is destroyed. Never call manually.
 * @ignore
 */
ogGeometryLayer.prototype._OnDestroy = function()
{
   this.RemoveGeometryLayer();
}

//------------------------------------------------------------------------------
/**
 * @description hide the poi layer
 */
ogGeometryLayer.prototype.Hide = function()
{
   this.hide = true;
   for(var i= 0; i < this.geometryarray.length; i++)
   {
      this.geometryarray[i].Hide();
   }

}

//------------------------------------------------------------------------------
/**
 * @description show the previously hidden poi layer
 */
ogGeometryLayer.prototype.Show = function()
{
   this.hide = false;
   for(var i= 0; i < this.geometryarray.length; i++)
   {
      this.geometryarray[i].Show();
   }
}

//------------------------------------------------------------------------------
/**
 *  @description removes all geometries from the layer
 */
ogGeometryLayer.prototype.RemoveGeometryLayer = function()
{
   for(var i= 0; i < this.geometryarray.length; i++)
   {
      this.geometryarray[i]._OnDestroy(); //To Discuss: is this legal?
   }
}

//------------------------------------------------------------------------------
/**
 *  @description adds a geometry to the layer
 */
ogGeometryLayer.prototype.AddGeometry = function(geometry)
{
   this.geometryarray.push(geometry);
}

//------------------------------------------------------------------------------
/**
 *  @description adds a geometry to the layer
 */
ogGeometryLayer.prototype.RemoveGeometry = function(geometry)
{
   for(var i= 0; i < this.geometryarray.length; i++)
   {
      if(this.geometryarray[i] == geometry)
      {
         this.geometryarray.splice(i,1);
      }
   }
}

