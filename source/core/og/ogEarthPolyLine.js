/********************************************************************************
 #                          OpenWebGlobe Version 1.x                            #
 #                              (c) 2010-2015 by                                #
 #           University of Applied Sciences Northwestern Switzerland            #
 #                     Institute of Geomatics Engineering                       #
 #                           martin.christen@fhnw.ch                            #
 ********************************************************************************
 *     Licensed under MIT License. Read the file LICENSE for more information   *
 *******************************************************************************/


goog.provide('owg.ogEarthPolyline');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');
goog.require('owg.EarthPolyline');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {ogObject} 
 * @author Benjamin Loesch, benjamin.loesch@fhnw.ch
 */
function ogEarthPolyline()
{
   /** @type {string} */
   this.name = "ogEarthPolylineObject";
   /** @type {number} */
   this.type = OG_OBJECT_EARTHPOLYLINE;
   /** @type {EarthPolyline}*/
   this.earthpolyline = null;
   
   this.options = null;
   
}

//------------------------------------------------------------------------------
ogEarthPolyline.prototype = new ogObject();


//------------------------------------------------------------------------------
/**
* @description parse options
* @param {GeometryOptions} options
* @ignore
*/
ogEarthPolyline.prototype.ParseOptions = function(options)
{
   this.options = options;
   
   var scene = this.parent.parent;
   var context = scene.parent;
   var engine = context.engine; // get engine!
   this.earthpolyline = new  EarthPolyline(engine,options);
   
   this.earthpolyline.SetPoints(options["coords"]);
}






//------------------------------------------------------------------------------
/**
 * @description Called when object is destroyed. Never call manually.
 * @ignore
 */
ogEarthPolyline.prototype._OnDestroy = function()
{
   if (this.earthpolyline)
   {
      this.earthpolyline.Destroy();
      this.earthpolyline = null;
      this.status = OG_OBJECT_FAILED;
   }
}






/**
 * @description hides the mesh
 * 
 */
ogEarthPolyline.prototype.Hide = function()
{
  this.earthpolyline.hide=true;
}


//------------------------------------------------------------------------------
/**
 * @description Sets the postion of the whole geometry
 * @param {number} lng
 * @param {number} lat
 * @param {number} elv
 */
ogEarthPolyline.prototype.SetPositionWGS84 = function(lng,lat,elv)
{
   //todo  
}



/**
 * @description shows the mesh
 * 
 */
ogEarthPolyline.prototype.Show = function()
{
   this.earthpolyline.hide=false;
}













