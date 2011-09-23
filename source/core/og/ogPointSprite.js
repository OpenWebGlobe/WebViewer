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

goog.provide('owg.ogPointSprite');

goog.require('owg.ObjectDefs');
goog.require('owg.ogObject');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {ogObject} 
 * @description Mesh Object (OpenWebGlobe object)
 * @author Martin Christen, martin.christen@fhnw.ch
 */
function ogPointSprite()
{
   /** @type {string} */
   this.name = "ogPointSpriteObject";
   /** @type {number} */
   this.type = OG_OBJECT_POINTSPRITE;
   /** @type {PointSprite}*/
   this.pointsprite = null;
   
   this.options = null;
   
   this.pointdata = null;
}

//------------------------------------------------------------------------------
ogPointSprite.prototype = new ogObject();


//------------------------------------------------------------------------------
/**
* @description parse options
* @param {GeometryOptions} options
* @ignore
*/
ogPointSprite.prototype.ParseOptions = function(options)
{
   this.options = options;
   
   var scene = this.parent.parent;
   var context = scene.parent;
   var engine = context.engine; // get engine!
   this.pointsprite = new  PointSprite(engine);
   this.pointsprite.SetPoints(options);
   
}


//------------------------------------------------------------------------------
/**
* @description parse options
* @param {Array.<{Number}>} pointData 
* @ignore
*/
ogPointSprite.prototype.loadPointData = function(pointData)
{
   this.pointdata = pointData;
   this.pointsprite.SetPoints(pointData);
   
}

//------------------------------------------------------------------------------
/**
 * @description Called when object is destroyed. Never call manually.
 * @ignore
 */
ogPointSprite.prototype._OnDestroy = function()
{
  
   //todo
}






/**
 * @description hides the mesh
 * 
 */
ogPointSprite.prototype.Hide = function()
{
  //todo
}


//------------------------------------------------------------------------------
/**
 * @description Sets the postion of the whole geometry
 * @param {number} lng
 * @param {number} lat
 * @param {number} elv
 */
ogPointSprite.prototype.SetPositionWGS84 = function(lng,lat,elv)
{
   //todo  
}



/**
 * @description shows the mesh
 * 
 */
ogPointSprite.prototype.Show = function()
{
   //todo
}